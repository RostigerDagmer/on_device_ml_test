let init, cosine_similarity;

class Similarity {
  static instance = {};

  static async getInstance() {
    let i = ({ default: init, cosine_similarity } = await import("/build/m.js"));
    if (!this.instance.f) {
      await init();
      self.postMessage({ status: "loading", message: "Loading Model" });
      this.instance = {f: cosine_similarity};
    } else {
      self.postMessage({ status: "ready", message: "Model Already Loaded" });
    }
    return this.instance;
  }
}

self.addEventListener("message", async (event) => {
  const { v1, v2 } = event.data;
  try {
    self.postMessage({ status: "ready", message: "Starting Similarity" });
    const model = await Similarity.getInstance();
    self.postMessage({
      status: "encoding",
      message: "Calculating Similarity",
    });
    const output = model.f(new Float32Array(v1), new Float32Array(v2));
    self.postMessage({
      status: "complete",
      message: "Similarity Calculated",
      similarity: output,
    });
  } catch (error) {
    self.postMessage({ error: error });
  }
});
