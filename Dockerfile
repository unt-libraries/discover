FROM docker.io/ruby:2.7.8-slim-bullseye AS builder

# Install dependencies
RUN apt-get update && apt-get install -y \
  git \
  curl \
  libpq-dev \
  build-essential \
  patch \
  zlib1g-dev \
  liblzma-dev \
  shared-mime-info

ENV NODE_OPTIONS=--openssl-legacy-provider
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
RUN apt-get update && apt-get install -y nodejs
RUN corepack enable

WORKDIR /app

# Bundler installs with binstubs to our custom /bundle/bin volume path. Let system use those stubs.
ENV BUNDLE_PATH=/bundle \
    BUNDLE_BIN=/bundle/bin \
    GEM_HOME=/bundle
ENV PATH="${BUNDLE_BIN}:${PATH}"

# Update rubygems to last version supporting ruby 2.7.8, otherwise bundler 2.1.4 isn't found at run time
RUN gem update --system '3.4.22' --no-document && \
    gem install rake

COPY Gemfile* ./
RUN bundle install

COPY package.json ./
COPY yarn.lock ./
RUN yarn install --frozen-lockfile

# Second stage of multi-stage build for smaller final image
FROM docker.io/ruby:2.7.8-slim-bullseye

# Install dependencies
RUN apt-get update && apt-get install -y \
  git \
  curl \
  nano \
  libpq-dev \
  build-essential

ENV NODE_OPTIONS=--openssl-legacy-provider
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
RUN apt-get update && apt-get install -y nodejs
RUN corepack enable

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

# Update rubygems to last version supporting ruby 2.7.8, otherwise bundler 2.1.4 isn't found at run time
RUN gem update --system '3.4.22' --no-document && \
    gem install rake

COPY --from=builder /bundle/ /bundle/
COPY --from=builder /app/node_modules/ /app/node_modules/
COPY . .

CMD ["bundle", "exec", "rails", "server", "-p", "3000", "-b", "0.0.0.0"]
