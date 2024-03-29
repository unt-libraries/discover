# UNT Discover

## About

This is the University of North Texas Libraries' implementation
of [Project Blacklight](http://projectblacklight.org/) as a faceted
search interface for accessing the online catalog.

## Installation

### With Docker (preferred)

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
easier. They can be overridden at runtime by specifying a different `.env*` file with the 
`--env-file` option or passing environment variables in the shell.

Recommended `.env` file:
```console
# .env file
RAILS_PORT=3000
RAILS_ENV=development
RAILS_SERVE_STATIC_FILES=false
RAILS_MASTER_KEY=#YOUR_RAILS_MASTER_KEY
POSTGRES_PASSWORD=#YOUR_POSTGRES_PASSWORD

# OR in the shell
$ source RAILS_PORT=3000  # or port of your choice
```

Find more information about how Docker Compose evaluates environment variables
[here](https://docs.docker.com/compose/environment-variables/).

To build locally, modify Docker and Docker Compose files, or run without an upstream image, you
should modify the `image` value for the `web` app in `docker-compose.yml`, or replace it with
`build: .` to build a container from the `Dockerfile`.

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

secret_key_base: 
```

If you do not already have a database for the app, create one with:

```console
$ docker compose run --rm web rake db:create

# OR with Yarn
$ yarn web:dbCreate
```

Run database migrations with:

```console
$ docker compose run --rm web rake db:migrate

# OR with Yarn
$ yarn web:dbMigrate
```

Prior to running the development environment, you'll need to precompile assets.

```console
$ docker compose run --rm web rails assets:precompile

# OR with Yarn
$ yarn web:compileAssets
```

Start the app and database with:

```console
$ docker compose up

# OR with Yarn
$ yarn start
```

You should now be able to go to `localhost:3000` in your browser to see the running app.

In the development environment, you can use Webpacker's live code reloading by 
running `yarn web:assetServer` in a separate terminal.

### Without Docker

#### Requirements

**Ruby**

Blacklight requires Ruby >= 2.2. We recommend using [RVM](https://rvm.io/) or 
[rbenv](https://github.com/rbenv/rbenv) to install
and use a specific version for this project.

```console
$ ruby --version
  ruby 2.5.3p105 (2018-10-18 revision 65156) [x86_64-linux]
```

To install a version of Ruby, follow the instructions for RVM or rbenv.

You'll also need Ruby [Bundler](https://bundler.io/) version 2.0.

Check version:

```console
$ bundle version
  Bundler version 2.0.1 (2019-01-04 commit d7ad2192f)
```

Install Bundler:
```console
$ gem install bundler
```

**Rails**

Blacklight requires [Ruby on Rails](https://rubyonrails.org/) 5.x.

Check version:
```console
$ rails --version
  Rails 5.2.3
```

Install Rails:
```console
$ gem install rails
```

**Java**

Your JDK distribution may vary, but it should be version 1.8 (8) or higher.

[Oracle](https://www.oracle.com/technetwork/java/javase/downloads/index.html)

[OpenJDK](https://openjdk.java.net/install/)

```console
$ java -version
openjdk version "11.0.2" 2019-01-15
OpenJDK Runtime Environment (build 11.0.2+9-Ubuntu-3ubuntu118.04.3)
OpenJDK 64-Bit Server VM (build 11.0.2+9-Ubuntu-3ubuntu118.04.3, mixed mode, sharing)
```

The JDK can be obtained from [Oracle](https://www.oracle.com/technetwork/java/javase/downloads/index.html)
or [OpenJDK](https://openjdk.java.net/install/)

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

**Install gems**

```console
$ bundle install
```

**Create the database**

If no database exists, create one with:

```console
$ docker compose run web rake db:create
```

**Run database migrations**

This will generate the sqlite database used by Rails.

```console
$ rake db:migrate
```

Like the secrets file, the sqlite3 database files are in `.gitignore` 
and will not be committed to git.

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
$ yarn web:credentials
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
$ docker compose run web rake secret
```

## Scripts

Several convenience scripts exist in `package.json` that can be invoked with yarn (or npm).
Example: `$ yarn start` to build the docker containers and start the web server.

- `start`: Starts the Docker containers in the terminal
- `build`: Builds the Docker containers, required before starting
- `web:run`: Issue a command to the web container and then stop the containers
- `web:assetServer`: Runs the webpack asset server in a separate terminal session
- `rubyStyle`: Runs RuboCop style check
- `test`: Run tests using Rails and Docker test configurations
- `test:verbose`: Runs test with additional verbosity
- `web:compileAssets`: Precompile assets with Rails
- `web:dbCreate`: Create the database with Rails
- `web:dbMigrate`: Migrate databases with Rails
- `web:credentials`: Edit Rails credentials
- `docker:stopAll`: Stop all currently running Docker containers
- `docker:removeAll`: Remove all Docker containers
- `docker:prune`: Prune Docker containers
- `updateBrowserStats`: Update `browserslist-stats.json` for BrowsersList and Google Analytics integration

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

## Testing

Testing is done with RSpec, Capybara, and headless Chrome by running `$ yarn test`. Test files
can be found in the `/spec` directory.