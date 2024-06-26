
ARG NODE_VERSION=20.5.0

FROM node:${NODE_VERSION}-bullseye as base
RUN apt-get update && \
    apt-get install --no-install-recommends zlib1g-dev clang musl-dev gcc -y \
    ca-certificates curl file \
    build-essential \
    autoconf automake autotools-dev libtool xutils-dev && \
    rm -rf /var/lib/apt/lists/*
# install rust
# RUN apt-get update && apt-get install -y curl
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"
ENV CPATH="/usr/include"
RUN rustup default stable


# install wasm pack
RUN cargo install wasm-pack
# install wasm-bindgen-cli
RUN cargo install wasm-bindgen-cli

ARG PORT=3000

ENV NODE_ENV=production

WORKDIR /usr/app
COPY ./ /usr/app
COPY package.json /usr/app/package.json
RUN npm i npm 

# Build
FROM base as build

# COPY package.json package-lock.json
RUN npm install

WORKDIR /usr/app/wasm-ml
RUN rustup target add wasm32-unknown-unknown
RUN /usr/app/wasm-ml/build.sh

WORKDIR /usr/app
# RUN cat node_modules/.bin
RUN npm ci && npm cache clean --force
RUN npm run build
RUN npm prune

# Run
FROM base

ENV PORT=$PORT

COPY --from=build /usr/app/.output /usr/app/.output
# Optional, only needed if you rely on unbundled dependencies
# COPY --from=build /src/node_modules /src/node_modules

CMD [ "node", "/usr/app/.output/server/index.mjs"]