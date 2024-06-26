use wasm_bindgen::prelude::*;
use js_sys::Float32Array;

#[wasm_bindgen]
pub fn cosine_similarity(a: Float32Array, b: Float32Array) -> f64 {
    let mut dot_product = 0.0;
    let mut norm_a = 0.0;
    let mut norm_b = 0.0;
    let a = a.to_vec();
    let b = b.to_vec();
    for i in 0..a.len() {
        dot_product += a[i] * b[i];
        norm_a += a[i] * a[i];
        norm_b += b[i] * b[i];
    }
    norm_a = norm_a.sqrt();
    norm_b = norm_b.sqrt();
    (dot_product / (norm_a * norm_b)) as f64
}