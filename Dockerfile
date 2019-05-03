FROM ruby:2.5.3-alpine

# Install dependencies
RUN apk add --no-cache \
  bash \
  build-base \
  nano \
  nodejs \
  openjdk8-jre \
  postgresql-dev \
  tzdata

RUN gem install bundler

RUN mkdir /app
WORKDIR /app
COPY Gemfile* /app/
RUN bundle install

# Add a script to be executed every time the container starts.
COPY entrypoint.sh /usr/bin/
RUN chmod +x /usr/bin/entrypoint.sh
ENTRYPOINT ["entrypoint.sh"]

WORKDIR /app
COPY . /app
CMD bundle exec rails server -p 3000 -b '0.0.0.0'