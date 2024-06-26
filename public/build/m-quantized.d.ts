/* tslint:disable */
/* eslint-disable */
/**
* @param {Float32Array} a
* @param {Float32Array} b
* @returns {number}
*/
export function cosine_similarity(a: Float32Array, b: Float32Array): number;
/**
*/
export class ModelConditionalGeneration {
  free(): void;
/**
* @param {Uint8Array} weights
* @param {Uint8Array} tokenizer
* @param {Uint8Array} config
*/
  constructor(weights: Uint8Array, tokenizer: Uint8Array, config: Uint8Array);
/**
* @param {any} input
* @returns {any}
*/
  decode(input: any): any;
}
/**
*/
export class ModelEncoder {
  free(): void;
/**
* @param {Uint8Array} weights
* @param {Uint8Array} tokenizer
* @param {Uint8Array} config
*/
  constructor(weights: Uint8Array, tokenizer: Uint8Array, config: Uint8Array);
/**
* @param {any} input
* @returns {any}
*/
  decode(input: any): any;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_modelencoder_free: (a: number) => void;
  readonly __wbg_modelconditionalgeneration_free: (a: number) => void;
  readonly modelconditionalgeneration_load: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly modelconditionalgeneration_decode: (a: number, b: number, c: number) => void;
  readonly modelencoder_load: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly modelencoder_decode: (a: number, b: number, c: number) => void;
  readonly main: (a: number, b: number) => number;
  readonly cosine_similarity: (a: number, b: number) => number;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
