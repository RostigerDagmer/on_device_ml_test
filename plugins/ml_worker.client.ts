export default defineNuxtPlugin(() => {
    return {
      provide: {
        mlWorker: new Worker('T5ModelEncoder.worker.js')
      }
    }
  })