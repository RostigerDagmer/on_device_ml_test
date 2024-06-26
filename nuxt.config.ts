// https://nuxt.com/docs/api/configuration/nuxt-config
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@vant/nuxt'],
  vite: {
    plugins: [
      wasm(),
      topLevelAwait()
    ],
    resolve: {
      alias: {
        // Set an alias for your Wasm directory
        '/wasm/': '/wasm-ml/build/',
      },
    }
  }
})
