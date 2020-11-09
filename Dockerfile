FROM ruby:2.6.6-slim-buster AS builder

# Install dependencies
RUN apt-get update && apt-get install -y \
  git \
  curl \
  libpq-dev \
  build-essential \
  patch \
  zlib1g-dev \
  liblzma-dev

RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
  echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

RUN apt-get update && apt-get install -y \
  nodejs \
  yarn

WORKDIR /app

# Bundler installs with binstubs to our custom /bundle/bin volume path. Let system use those stubs.
ENV BUNDLE_PATH=/bundle \
    BUNDLE_BIN=/bundle/bin \
    GEM_HOME=/bundle
ENV PATH="${BUNDLE_BIN}:${PATH}"

# Update rubygems for ruby 2.6.6, otherwise bundler 2.1.4 isn't found at run time
RUN gem update --system && \
    gem install bundler

COPY Gemfile* ./
RUN bundle install

COPY package.json ./
COPY yarn.lock ./
RUN yarn install --frozen-lockfile

# Second stage of multi-stage build for smaller final image
FROM ruby:2.6.6-slim-buster

# Install dependencies
RUN apt-get update && apt-get install -y \
  git \
  curl \
  nano \
  libpq-dev \
  build-essential

RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
  echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

RUN apt-get update && apt-get install -y \
  nodejs \
  yarn

WORKDIR /app
RUN mkdir -p tmp/db

# Add a script to be executed every time the container starts.
COPY entrypoint.sh /usr/bin/
RUN chmod +x /usr/bin/entrypoint.sh
ENTRYPOINT ["entrypoint.sh"]

# Bundler installs with binstubs to our custom /bundle/bin volume path. Let system use those stubs.
ENV BUNDLE_PATH=/bundle \
    BUNDLE_BIN=/bundle/bin \
    GEM_HOME=/bundle
ENV PATH="${BUNDLE_BIN}:${PATH}"

# Update rubygems for ruby 2.6.6, otherwise bundler 2.1.4 isn't found at run time
RUN gem update --system && \
    gem install bundler

COPY --from=builder /bundle/ /bundle/
COPY --from=builder /app/node_modules/ /app/node_modules/
COPY . .

CMD ["bundle", "exec", "rails", "server", "-p", "3000", "-b", "0.0.0.0"]
