# Nuxt 3 Minimal Starter

Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup


### Manual Build (development)

Install dependencies

```bash
npm install
```

Build rust project (optional, the project comes with prebuilt wasm targets)

```bash
cd wasm-ml
./build.sh
cd ..
```

Copy the generated files to public/build
```bash
cp -R wasm-ml/build ./public
```

Or symlink
```bash
ln -s wasm-ml/build ./public
```

Run the server

```bash
npm dev
```

### Docker build

Run:

```bash
docker compose up
```

This runs a production build. Not recommended since this is only a demo.