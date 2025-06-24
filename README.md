# UNT Discover

## About

This is the University of North Texas Libraries' implementation of [Project Blacklight](http://projectblacklight.org/) 
as a faceted search interface for accessing the online catalog.

## Installation

#### Requirements

* [Docker CE or EE](https://docs.docker.com/install/) for your operating system
* [Docker Compose](https://docs.docker.com/compose/install/)

**Clone this repository**

SSH:
```console
$ git clone git@github.com:unt-libraries/discover.git discover
$ cd discover
```

or HTTPS:
```console
$ git clone https://github.com/unt-libraries/discover discover
$ cd discover
```

Environment variables should be set in a `.env` file in the root directory to make local development 
easier. This file is used by Docker Compose. They can be overridden at runtime by specifying a different `.env*` file with the 
`--env-file` option, or they can be overridden at runtime by following Docker's 
[order of precedence](https://docs.docker.com/compose/how-tos/environment-variables/envvars-precedence/) for environment variables.

Recommended `.env` file for local development:
```dotenv
# .env file
RAILS_PORT=3000
RAILS_ENV=development
RAILS_SERVE_STATIC_FILES=false
RAILS_MASTER_KEY=#YOUR_RAILS_MASTER_KEY
POSTGRES_PASSWORD=#YOUR_POSTGRES_PASSWORD
# SOLR_URL in local .env to override dev value in credentials file for server
SOLR_URL=SOLR_SERVER_URL
# RAILS_DEVELOPMENT_HOSTS is used to determine if the request is coming from a host that should be allowed to access the application in development mode.
RAILS_DEVELOPMENT_HOSTS=localhost
# Enable Vite HMR client in development
ENABLE_VITE_HMR_CLIENT=true
```

Build the containers with:

```console
$ docker compose build

# OR with Yarn
$ yarn build
```

After building the containers, [create your credentials](#managing-secrets) with the keys below.

```yaml
default: &default
  SOLR_URL: 
  google_analytics: 
  SIERRA_API_KEY: 
  SIERRA_API_SECRET: 
  COVID_RESTRICTED: 
  POSTGRES_PASSWORD: 

development:
  <<: *default

test:
  <<: *default

production:
  <<: *default
  # Enable DNS rebinding protection by defining allowed production hosts.
  RAILS_PRODUCTION_HOSTS:

secret_key_base: 
```

Start the app and database with:

```console
$ docker compose up

# OR with Yarn
$ yarn start
```

You should now be able to go to `localhost:3000` in your browser to see the running app.

**Solr configuration**

This project uses a Solr instance that is part of our 
[Catalog API project](https://github.com/unt-libraries/catalog-api).
You can read more about that project if you wish. The connection to Solr
can be configured by following [Project Blacklight's instructions](https://github.com/projectblacklight/blacklight/wiki/Solr-Configuration).
For this project, the `SOLR_URL` can be stored in the credentials file (detailed below).

## Managing secrets
{: #managing-secrets }

### Rails credentials

Rails 5.2 introduced the `credentials` API, which is our preferred method of managing
secrets in this project. Rails credentials allows you to store an encrypted version 
of your secrets in version control and access them with a key file or string that can be
shared among developers and securely deployed to environments.

All credentials are stored in `config/credentials.yml.enc`, an encrypted file that can
only be read through the Rails command line. The file should contain key/value pairs in the
same format as a normal YAML file. Rails uses `RAILS_MASTER_KEY`, stored in
`config/master.key` (or in the `RAILS_MASTER_KEY` environment variable, which can be defined in the
`.env` file) to decrypt `credentials.yml.enc`. `master.key` should not be stored
in version control and has been added to the `.gitignore` file.

**If you cloned our project, you will need to delete credentials.yml.enc before you will
be able to create your own credentials and key pair**

**Creating credentials**

To create the `config/credentials.yml.enc` and `config/master.key` files, simply follow
the editing instructions below. If you attempt to edit credentials and the files do not
exist, Rails will generate them for you. **Be sure to take note of `RAILS_MASTER_KEY`**.

**Editing credentials**

To edit secrets stored in `credentials.yml.enc`, use the following command:

```console
$ docker compose run web bash -c "EDITOR=vim rails credentials:edit"

# OR with Yarn
$ yarn credentials
```

NOTE: If you're not using Docker, you only need the command in quotes

This opens the vim editor and allows you to edit the key value pairs in the 
credentials file. You can also specify a different editor if you'd like.

**Reading Credentials**

Assuming your `config/credentials.yml.enc` looks like this:

```yaml
aws:
  access_key_id: 123
  secret_access_key: 345

secret_key_base: 3936047f2d004281e50c4
```

You can access the credentials values programmatically like:

```ruby
Rails.application.credentials.aws[:access_key_id]     # => "123"
Rails.application.credentials.aws[:secret_access_key] # => "345"
Rails.application.credentials.secret_key_base         # => "3936047f2d004281e50c4"
```

To define different variables in different environments, the credentials can be
namespaced like this:

```yaml
development:
  aws:
    access_key_id: 123
    secret_access_key: 345
  secret_key_base: 3936047f2d004281e50c4

production:
  aws:
    access_key_id: 456
    secret_access_key: 678
  secret_key_base: d6f1731cf57c4967ffd19
```

You can access the namespaced values with the environment namespace:

```ruby
Rails.application.credentials[Rails.env.to_sym][:aws][:access_key_id]
```

More information about Rails credentials:
- [Rails 5.2 credentials](https://medium.com/cedarcode/rails-5-2-credentials-9b3324851336)
- [Rails 5.2 credentials cheat sheet](https://blog.eq8.eu/til/rails-52-credentials-tricks.html)

For this project, Rails should have generated a `secret_key_base` for you and you should add your 
`SOLR_URL` to your credentials file.

If you find yourself needing to generate a new secret, you can so so with:

```console
$ docker compose run --rm web rake secret
```

## Scripts

Several convenience scripts exist in `package.json` that can be invoked with yarn (or npm).
Example: `$ yarn start` to build the docker containers and start the web server. Refer to the
`package.json` file for a complete list of available scripts.

## Code style

Style guides are included for Javascript and Ruby

### Javascript

Javascript linting uses [ESLint](https://eslint.org/) and Airbnb's [style guide](https://github.com/airbnb/javascript).
Configuration can be found in `.eslintrc.js`. You can use the integration with your development
environment, or run `yarn javascriptStyle` to check style guide compliance.

### Ruby

Ruby linting uses [RuboCop](https://github.com/rubocop-hq/rubocop) and Airbnb's [style guide](https://github.com/airbnb/ruby).
Configuration can be found in `.rubocop.yml` and `.rubocop_airbnb.yml`. `rubocop_todo.yml` contains
tests that have failed previously, but are ignored. You can use the integration with your development
environment, or run `yarn rubyStyle` to check style guide compliance.

## Production

Production deployment is done with Docker and Docker Compose using Gitlab CI/CD. The production pipeline can be
simulated locally.

You must first adjust the following values in your `.env` file or otherwise pass them in as environment variables:
```dotenv
RAILS_ENV=production
RAILS_SERVE_STATIC_FILES=true
# APP_IMAGE_NAME can be anything, but it is recommended to use the same name as you'll use in production
APP_IMAGE_NAME=IMAGE_NAME
ENABLE_VITE_HMR_CLIENT=false
```
And set the `RAILS_MASTER_KEY` environment variable to the value of your production master key.
```console
export RAILS_MASTER_KEY=#YOUR_RAILS_MASTER_KEY
```
Rails master key must be set in the environment instead of the `.env` file for production builds because it uses Docker secrets.

Then run the following command to build the production image:
```console
docker build --secret id=RAILS_MASTER_KEY \
    --build-arg APP_BUILD_TYPE="production" \
    --build-arg BUILD_TIME_RAILS_ENV="production" \
    -t <APP_IMAGE_NAME from your .env file> .
```

Bring the containers up with:
```console
docker compose -f compose.deploy.yaml up --remove-orphans
```

In a separate terminal, copy the `public` directory from the container to your local machine:
```console
docker compose -f compose.deploy.yaml cp web:/app/public ./public
```

## Testing

Tests can usually be run with the development environment. You can run the tests with:
```console
$ yarn test:vitest
$ yarn test:compileAssets
$ yarn test:rspec
```
Compiling assets is required for the RSpec tests to run. You can also run the tests in a Docker container with:
