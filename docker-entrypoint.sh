#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

RUNTIME_RAILS_ENV="${RAILS_ENV:-development}" # This is the runtime RAILS_ENV
echo "Entrypoint: Running with RAILS_ENV=${RUNTIME_RAILS_ENV}"

# Ensure tmp/pids directory exists and remove stale server.pid
mkdir -p /app/tmp/pids
rm -f /app/tmp/pids/server.pid

echo "Entrypoint: Verifying bundle..."
# Configure BUNDLE_WITHOUT based on the runtime RAILS_ENV
if [ "$RUNTIME_RAILS_ENV" = "production" ]; then
    echo "Entrypoint: Configuring Bundler to use ONLY 'production' and 'default' groups."
    bundle config set --local only 'production:default'
else
    echo "Entrypoint: Configuring Bundler to consider all groups (unsetting 'only' restriction)."
    bundle config unset --local only
fi

# Check if the bundle is already complete for the current environment
# BUNDLE_PATH=/bundle is set via ENV in Dockerfile, so bundler knows where to look.
if bundle check; then
    echo "The Gemfile's dependencies are satisfied for $RUNTIME_RAILS_ENV."
else
    echo "ERROR: Bundle check failed for $RUNTIME_RAILS_ENV with BUNDLE_WITHOUT='${BUNDLE_WITHOUT}'."
    echo "This indicates the Docker image may not have all necessary gems pre-installed for this environment."
    if [ "$RUNTIME_RAILS_ENV" = "development" ]; then
        echo "Attempting bundle install for development (requires /bundle to be writable by appuser)..."
        bundle install --jobs "$(nproc)" --retry 3
        echo "Bundle install completed for development."
    else
        echo "FATAL: Runtime bundle install would be required for $RUNTIME_RAILS_ENV. Image is misconfigured or build failed."
        exit 1
    fi
fi

# Check if a command was passed to `docker run` or `docker compose run`
if [ "$#" -eq 0 ] || \
   ([ "$1" = "bundle" ] && [ "$2" = "exec" ] && [ "$3" = "rails" ] && [ "$4" = "server" ]) || \
   ([ "$1" = "rails" ] && [ "$2" = "server" ]) || \
   [ "$1" = "puma" ]; then
    echo "Entrypoint: Preparing database (creating if necessary, loading schema, migrating)..."
    bundle exec rails db:prepare

    if [ "$RUNTIME_RAILS_ENV" = "development" ]; then
        echo "Entrypoint: Development mode - Starting Vite dev server and Rails server..."
        VITE_PID=""
        RAILS_PID=""
        cleanup_dev_processes() {
            echo "Entrypoint: Initiating cleanup of development services..." # More generic initial message

            if [ -n "$VITE_PID" ]; then
                if kill -0 "$VITE_PID" &>/dev/null; then
                    echo "Entrypoint: Sending SIGTERM to Vite (PID: $VITE_PID)..."
                    kill -TERM "$VITE_PID"
                    echo "Entrypoint: Waiting for Vite (PID: $VITE_PID) to stop..."
                    wait "$VITE_PID" 2>/dev/null || echo "Entrypoint: Vite (PID: $VITE_PID) exited or wait failed."
                else
                    echo "Entrypoint: Vite process (PID: $VITE_PID from var) not found or already stopped."
                fi
            fi

            if [ -n "$RAILS_PID" ]; then
                if kill -0 "$RAILS_PID" &>/dev/null; then
                    echo "Entrypoint: Sending SIGTERM to Rails (PID: $RAILS_PID)..."
                    kill -TERM "$RAILS_PID"
                    echo "Entrypoint: Waiting for Rails (PID: $RAILS_PID) to stop..."
                    wait "$RAILS_PID" 2>/dev/null || echo "Entrypoint: Rails (PID: $RAILS_PID) exited or wait failed."
                else
                    echo "Entrypoint: Rails process (PID: $RAILS_PID from var) not found or already stopped."
                fi
            fi

            echo "Entrypoint: Development services cleanup attempt finished."
        }
        # Trap SIGINT (Ctrl+C from user) and SIGTERM (docker stop/down)
        # This trap handles signals sent to the script itself.
        trap '
            echo "Entrypoint: Script received SIGINT/SIGTERM signal."
            cleanup_dev_processes
            echo "Entrypoint: Script exiting gracefully due to signal."
            exit 0 # Exit cleanly after handling the signal
        ' SIGINT SIGTERM

        echo "Entrypoint: Starting Vite dev server (using bundle exec)..."
        bundle exec vite dev &
        VITE_PID=$!
        echo "Entrypoint: Vite dev server PID: $VITE_PID"

        echo "Entrypoint: Starting Rails server (using bundle exec)..."
        bundle exec rails server -b 0.0.0.0 -p "${PORT:-3000}" &
        RAILS_PID=$!
        echo "Entrypoint: Rails server PID: $RAILS_PID"

        wait -n "$RAILS_PID" "$VITE_PID"
        EXIT_CODE=$?
        echo "Entrypoint: A dev service exited with code $EXIT_CODE."

        # If script reaches here, one process died. Trigger cleanup for the other and then exit.
        # The trap will not have been called for this scenario unless the script itself got a signal.
        cleanup_dev_processes
        echo "Entrypoint: Exiting with code $EXIT_CODE."
        exit $EXIT_CODE
    else
        echo "Entrypoint: $RUNTIME_RAILS_ENV mode - Assets presumed precompiled. Starting Rails server..."
        echo "Entrypoint: Starting Rails server in foreground for $RUNTIME_RAILS_ENV..."
        exec bundle exec rails server -b 0.0.0.0 -p "${PORT:-3000}"
    fi
else
      # A command was passed to `docker run` or `docker compose run`
      echo "Entrypoint: Command override detected ('$1'). Executing: $@"
      exec "$@" # Execute the provided command
fi
