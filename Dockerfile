# Common Base
FROM docker.io/ruby:3.4.3-slim-bullseye AS base

# Install common dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    gnupg \
    libyaml-dev \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# --- Builder stage ---
FROM base AS builder

# Determine docker build behavior
ARG APP_BUILD_TYPE=development
# Set rails and node environments
ARG BUILD_TIME_RAILS_ENV=development

ENV RAILS_ENV=${BUILD_TIME_RAILS_ENV} \
    NODE_ENV=${BUILD_TIME_RAILS_ENV} \
    BUNDLE_PATH=/bundle \
    BUNDLE_BIN=/bundle/bin \
    GEM_HOME=/bundle
ENV PATH="${BUNDLE_BIN}:${PATH}"

# Install dependencies
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    libpq-dev \
    build-essential \
    patch \
    zlib1g-dev \
    liblzma-dev \
    shared-mime-info \
    nodejs \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install corepack for Yarn
RUN corepack enable

WORKDIR /app

COPY Gemfile* ./
# Conditional gem installation based on build type
RUN if [ "$APP_BUILD_TYPE" = "production" ]; then \
      echo "Builder: Installing production gems (excluding development/test)..."; \
      bundle config set --local only 'production:default'; \
    else \
      echo "Builder: Installing all gems for $APP_BUILD_TYPE build..."; \
      bundle config unset --local only; \
    fi && \
    bundle install --jobs $(nproc) --retry 3

COPY package.json yarn.lock ./
RUN yarn cache clean && yarn install --frozen-lockfile

# Copy the application code
COPY . .

# Precompile assets ONLY if building for production or test image type
RUN --mount=type=secret,id=RAILS_MASTER_KEY \
    if [ "$APP_BUILD_TYPE" = "production" ] || [ "$APP_BUILD_TYPE" = "test" ]; then \
      echo "Building Vite assets for $BUILD_TIME_RAILS_ENV..."; \
      export RAILS_MASTER_KEY=$(cat /run/secrets/RAILS_MASTER_KEY) && \
      bundle exec rake assets:precompile; \
    else \
      echo "Builder: Skipping Vite asset precompilation for development build type."; \
    fi

# --- Final stage of multi-stage build for smaller final image ---
FROM base AS final

ARG APP_BUILD_TYPE=development
ARG APP_USER=appuser
RUN useradd --create-home --shell /bin/bash ${APP_USER}

# Add this line for explicit verification
RUN echo "FINAL STAGE: Effective APP_BUILD_TYPE is $APP_BUILD_TYPE"

# Install minimal runtime OS dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 && \
  if [ "$APP_BUILD_TYPE" != "production" ]; then \
    echo "Final: Adding git, nano, and nodejs for development image..."; \
    apt-get install -y --no-install-recommends \
    git \
    build-essential \
    nano && \
    echo "Final: Dev tools installed"; \
  fi && \
  apt-get clean && rm -rf /var/lib/apt/lists/*

# Install nodejs and corepack for development image
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN if [ "$APP_BUILD_TYPE" != "production" ]; then \
      echo "Final: Adding Node.js repo for $APP_BUILD_TYPE image..."; \
      curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
      apt-get update && apt-get install -y --no-install-recommends nodejs && \
      apt-get clean && rm -rf /var/lib/apt/lists/* && \
      corepack enable; \
    else \
      echo "Final: Skipping Node.js installation for $APP_BUILD_TYPE image."; \
    fi

WORKDIR /app

# Runtime environment variables (RAILS_ENV will be set when the container runs)
ENV RAILS_LOG_TO_STDOUT=true \
    RAILS_SERVE_STATIC_FILES=true \
    BUNDLE_PATH=/bundle \
    BUNDLE_BIN=/bundle/bin \
    GEM_HOME=/bundle
ENV PATH="${BUNDLE_BIN}:${PATH}"

# Copy pre-installed gems from builder stage
COPY --from=builder --chown=${APP_USER}:${APP_USER} /bundle /bundle

# Copy node_modules from builder stage and delete them if not building for development, to reduce final image size
COPY --from=builder --chown=${APP_USER}:${APP_USER} /app/node_modules /app/node_modules
RUN if [ "$APP_BUILD_TYPE" = "production" ]; then \
      echo "Final: Removing node_modules for ($APP_BUILD_TYPE)..."; \
      rm -rf /app/node_modules ; \
    fi

# Copy application code
COPY --chown=${APP_USER}:${APP_USER} . .

# Copy precompiled assets (public directory) if building for production/test
# For development, this public dir is copied, but Vite dev server often serves from memory/source.
COPY --from=builder --chown=${APP_USER}:${APP_USER} /app/public /app/public

# Copy and set up entrypoint
COPY --chown=${APP_USER}:${APP_USER} docker-entrypoint.sh /usr/bin/
RUN chmod +x /usr/bin/docker-entrypoint.sh
ENTRYPOINT ["/usr/bin/docker-entrypoint.sh"]
USER ${APP_USER}
CMD ["bundle", "exec", "rails", "server", "-p", "3000", "-b", "0.0.0.0"]
