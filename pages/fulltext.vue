<template>
    <div class="outer-container">
        <div class="inner-container">
          <van-search v-model="search_term" clearable placeholder="Search" />
          <van-progress style="margin: 1rem" :percentage="(progress * 100).toFixed(2)" />
          <!-- <van-cell
              v-for="(e, index) in ordered_sentences"
              :title="e.s"
              :value="e.sim.toFixed(2) ?? 'nothing'"
            /> -->
            <div style="margin-left: 0.5rem; margin-right: 0.5rem">
                <span
                  v-for="(sentence, index) in sentences"
                  :key="index"
                  :style="getStyle(index)"
                  >{{ sentence }}</span
                >
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { getModelInfo, extractEmbeddings, cosine_similarity } from "@/utils";

import { text } from "@/sample_text.json";
const search_term = ref("");

function getStyle(index: number) {
  // sim
  const sim = similarities.value[index];
  const top_ten_cutoff = sorted_similarities.value[10];
  // between 0 and 0.5 dont do anything
  if (sim === null) {
    return "";
  } else if (sim < (top_ten_cutoff ?? 0.5)) {
    return "";
  } else {
    const s = (1.0 - (sim - (top_ten_cutoff ?? 0.5)));
    const o = s * s * s * s * s;
    // turn sim into opacity
    return `background-color: rgba(255, 197, 48, ${o - 0.3});`;
  }
}

const sentences = ref(text.split(/(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s/));

console.log("sentences", sentences.value);

const similarities = ref<Array<null | number>>(
  Array(sentences.value.length).fill(null)
);

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

const embeddings = ref<Map<string, Float32Array>>(new Map());
const search_embedding = ref<Float32Array | null>(null);

const progress = ref<number>(0);

watch(
  embeddings,
  async (newVal) => {
    console.log("embeddings changed", newVal.size);
    const l1 = newVal.size;
    const l2 = sentences.value.length;
    progress.value = l1 / l2;
  },
  { deep: true }
);

const sorted_similarities = computed(() => {
  return [...similarities.value].sort().reverse();
});

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
  similarities.value = [...sim];
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
  // chunk sentences into batches of 8

  const chunks = sentences.value.reduce((resultArray: any, item, index) => {
    const chunkIndex = Math.floor(index / 8);

    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = []; // start a new chunk
    }

    resultArray[chunkIndex].push(item);

    return resultArray;
  }, []);

  for (const chunk of chunks) {
    const res = await extractEmbeddings(
      mlWorker.value,
      modelURL,
      tokenizerURL,
      configURL,
      modelID,
      chunk,
      (e: any) => {
        console.log("progress", e);
      }
    );
    res.output.embeddings.forEach((e: Float32Array, i: number) => {
      embeddings.value.set(chunk[i], e);
    });
  }

  // Cache the embeddings
  let embeddingsObj: any = {};
  for (const [sentence, embedding] of embeddings.value.entries()) {
    embeddingsObj[sentence] = float32ArrayToString(embedding);
  }
  //   localStorage.setItem("embeddings", JSON.stringify(embeddingsObj));
}
//   }

if (process.client) {
  get_embeddings();
  get_similarities();
}
</script>

<style scoped>

.outer-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
}

.inner-container {
    max-width: 900px;
    margin: 1rem;
}
</style>
