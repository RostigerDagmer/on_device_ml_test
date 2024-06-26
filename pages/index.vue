<template>
  <div>
    <van-search v-model="search_term" clearable placeholder="Search" />
    <van-cell
      v-for="(e, index) in ordered_sentences"
      :title="e.s"
      :value="e.sim.toFixed(2) ?? 'nothing'"
    />
    <van-field
      v-model="new_sentence"
      placeholder="New Sentence"
      clearable
    />
    <van-button @click="add_sentence">Add Sentence</van-button>
  </div>
</template>

<script setup lang="ts">
import {
  getModelInfo,
  extractEmbeddings,
  cosine_similarity,
} from "@/utils";

const search_term = ref("");
const new_sentence = ref("");

const sentences = ref([
  "Hello world!",
  "How are you?",
  "What is the meaning of life?",
  "What is the airspeed velocity of an unladen swallow?",
  "What is the airspeed velocity of an unladen European swallow?",
  "What is the airspeed velocity of an unladen African swallow?",
  "What is the airspeed velocity of an unladen European swallow carrying a coconut?",
  "What is the airspeed velocity of an unladen African swallow carrying a coconut?",
]);

const similarities = ref<Array<null | number>>([
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
]);

const ordered_sentences: ComputedRef<Array<{s: string, sim: number}>> = computed(() => {
  const s = sentences.value.map((s, i) => ({s, sim: similarities.value[i] ?? 0}));
  return s.sort((a, b) => b.sim - a.sim);
})

const mlWorker = ref<Worker | null>(null);
const similarity_worker = ref<Worker | null>(null);
const modelID = "t5_small_quantized";
const { modelURL, configURL, tokenizerURL } = getModelInfo(modelID);
if (process.client) {
  mlWorker.value = new Worker("workers/T5ModelEncoder.worker.js");
  similarity_worker.value = new Worker("workers/Similarity.worker.js");
  if (mlWorker.value) {
    mlWorker.value.onmessage = (event) => {
      console.log("t5ModelEncoderWorker.onmessage", event);
    };
  }
}

watch(search_term, async (newVal) => {
  const e = await embed_single(newVal);
  search_embedding.value = e;
  await get_similarities();
});

watch(sentences, async (newVal) => {
  const diff = newVal.filter((s) => !embeddings.value.has(s));
  if (diff.length > 0) {
    for (const s of diff) {
      const e = await embed_single(s);
      embeddings.value.set(s, e);
    }
  }
  await get_similarities();
});

async function embed_single(string: string) {
  const res = await extractEmbeddings(
    mlWorker.value,
    modelURL,
    tokenizerURL,
    configURL,
    modelID,
    [string],
    (e: any) => {}
  );
  return res.output.embeddings[0];
}

async function add_sentence() {
  sentences.value = [...sentences.value, new_sentence.value];
  new_sentence.value = "";
}

const embeddings = ref<Map<string, Float32Array>>(new Map());
const search_embedding = ref<Float32Array | null>(null);

async function get_similarities() {
  let sim: Array<number> = [];
  const em = embeddings.value.values();
  console.log("em", em);
  if (!search_embedding.value) {
    return;
  }
  for (const e of em) {
    const s = await cosine_similarity(
      similarity_worker.value,
      [...e],
      [...search_embedding.value],
      (e: any) => {}
    );
    sim.push(s);
  }
  similarities.value = [...sim, ...Array(sentences.value.length).fill(null)];
}

// Helper functions to convert between Float32Array and string for storage
function float32ArrayToString(array: Float32Array) {
  return JSON.stringify(Array.from(array));
}

function stringToFloat32Array(string: string) {
  return Float32Array.from(JSON.parse(string));
}

// Modified get_embeddings function
async function get_embeddings() {
  const cachedEmbeddings = localStorage.getItem('embeddings');
  if (cachedEmbeddings) {
    const embeddingsObj = JSON.parse(cachedEmbeddings);
    for (const [sentence, embeddingString] of Object.entries(embeddingsObj)) {
      embeddings.value.set(sentence, stringToFloat32Array(embeddingString));
    }
  } else {
    const res = await extractEmbeddings(
      mlWorker.value,
      modelURL,
      tokenizerURL,
      configURL,
      modelID,
      [...sentences.value],
      (e: any) => {}
    );
    res.output.embeddings.forEach((e: Float32Array, i: number) => {
      embeddings.value.set(sentences.value[i], e);
    });
    // Cache the embeddings
    let embeddingsObj: any = {};
    for (const [sentence, embedding] of embeddings.value.entries()) {
      embeddingsObj[sentence] = float32ArrayToString(embedding);
    }
    localStorage.setItem('embeddings', JSON.stringify(embeddingsObj));
  }
}


if (process.client) {
  get_embeddings();
  get_similarities();
}

</script>
