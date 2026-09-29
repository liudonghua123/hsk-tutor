/**
 * Needle WASM LLM wrapper for HSK Tutor
 * Adapted from chrome-needle extension
 * Supports needle2 and needle3 models
 * Dynamically loads the correct needle.js script
 */

let Module = null;
let modelReady = false;
let currentModel = null;
// The WASM engine keeps a reference to the weights buffer passed to
// needle_load() for the lifetime of the session. It does NOT copy the bytes
// like the native engine does, so freeing this pointer corrupts the model
// (every completion degrades into an empty-call refusal). Keep it alive here.
let weightsPtr = null;

export function isReady() {
  return modelReady;
}

export function getCurrentModel() {
  return currentModel;
}

// Dynamically load needle.js script for the specified model
async function loadNeedleScript(modelType) {
  const basePath = `/lib/${modelType}/`
  const scriptPath = `${basePath}needle.js`

  // need to check with modelType
  // // Check if already loaded
  // if (typeof createNeedle === 'function') {
  //   console.log("[Needle] createNeedle already available")
  //   return
  // }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = scriptPath
    script.onload = () => {
      if (typeof createNeedle === 'function') {
        console.log("[Needle] createNeedle loaded from", scriptPath)
        resolve()
      } else {
        reject(new Error('createNeedle not found after loading'))
      }
    }
    script.onerror = () => reject(new Error(`Failed to load ${scriptPath}`))
    document.head.appendChild(script)
  })
}

// Wait for createNeedle to be available
async function waitForCreateNeedle(timeout = 10000) {
  const start = performance.now()
  return new Promise((resolve, reject) => {
    const check = () => {
      if (typeof createNeedle === 'function') {
        resolve()
        return
      }
      if (performance.now() - start > timeout) {
        reject(new Error('Timeout waiting for createNeedle'))
        return
      }
      setTimeout(check, 50)
    }
    check()
  })
}

export async function loadModel(modelType, toolsJson, onProgress) {
  if (modelReady && currentModel === modelType) return;

  const t0 = performance.now();
  const log = (msg) => {
    const elapsed = (performance.now() - t0).toFixed(0);
    const full = `[Needle ${elapsed}ms] ${msg}`;
    console.log(full);
    onProgress?.(msg);
  };

  try {
    currentModel = modelType;
    const basePath = `/lib/${modelType}/`;

    log("Step 1/4: Loading WASM engine...");
    console.log("[Needle] checking createNeedle global:", typeof createNeedle);

    // Dynamically load needle.js script if not already loaded
    await loadNeedleScript(modelType)
    await waitForCreateNeedle()

    Module = await createNeedle({
      locateFile: (path) => basePath + path,
    });
    console.log("[Needle] Module keys:", Object.keys(Module).filter(k => k.startsWith("_")).slice(0, 20));
    await waitForInit(Module);
    log("WASM engine loaded");

    log("Step 2/4: Loading model weights...");
    const cactUrl = `${basePath}${modelType}.cact`;
    console.log("[Needle] cact URL:", cactUrl);
    const resp = await fetch(cactUrl);
    if (!resp.ok) throw new Error(`CACT fetch failed: HTTP ${resp.status}`);

    const cactBytes = new Uint8Array(await resp.arrayBuffer());
    console.log("[Needle] cact size:", (cactBytes.length / 1024 / 1024).toFixed(1), "MB");

    weightsPtr = Module._malloc(cactBytes.length);
    Module.HEAPU8.set(cactBytes, weightsPtr);
    const ret = Module._needle_load(weightsPtr, BigInt(cactBytes.length));
    console.log("[Needle] needle_load returned:", ret);
    if (ret !== 0) throw new Error(`needle_load() returned ${ret}`);
    log("Weights loaded");

    const today = new Date();
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")} ${days[today.getDay()]}`;
    const locale = "en-US";
    const systemPrompt = `date: ${dateStr}; locale: ${locale}; device: browser (HSK Tutor)`;

    log("Step 3/4: Initializing tools...");
    console.log("[Needle] tools JSON (first 500):", toolsJson.slice(0, 500));
    console.log("[Needle] system prompt:", systemPrompt);
    const sPtr = strToWasm(systemPrompt);
    const tPtr = strToWasm(toolsJson);
    const iPtr = 0;
    const initRet = Module._needle_init(sPtr, tPtr, iPtr);
    Module._free(sPtr); Module._free(tPtr);
    console.log("[Needle] needle_init returned:", initRet);
    if (initRet < 0) throw new Error(`needle_init() returned ${initRet}`);
    log("Tools initialized");

    modelReady = true;
    log("Step 4/4: Model ready!");
  } catch (e) {
    console.error("[Needle] LOAD FAILED:", e);
    modelReady = false;
    throw e;
  }
}

export function complete(input) {
  if (!Module || !modelReady) throw new Error("Model not loaded");

  console.log("[Needle] complete input (first 200):", input.slice(0, 200));

  const inPtr = strToWasm(input);
  const outCap = 32768;
  const outPtr = Module._malloc(outCap);
  Module.HEAPU8.fill(0, outPtr, outPtr + outCap);

  const status = Module._needle_complete(inPtr, 1024, outPtr, outCap);
  Module._free(inPtr);

  console.log("[Needle] needle_complete status:", status, "outCap:", outCap);

  let end = outPtr;
  while (end < outPtr + outCap && Module.HEAPU8[end] !== 0) end++;
  const outLen = end - outPtr;
  console.log("[Needle] output bytes read:", outLen);

  let result;
  if (outLen > 0) {
    const text = new TextDecoder().decode(Module.HEAPU8.subarray(outPtr, end));
    Module._free(outPtr);
    console.log("[Needle] raw output text:", text);
    try {
      result = JSON.parse(text);
    } catch {
      console.warn("[Needle] JSON parse failed, raw:", text);
      result = { type: "respond", function_calls: [], reasoning: text, confidence: 0 };
    }
  } else {
    Module._free(outPtr);
    console.warn("[Needle] empty output, status:", status);
    result = { type: "respond", function_calls: [], reasoning: "", confidence: 0 };
  }

  console.log("[Needle] complete result:", result.type, result.function_calls?.length ?? 0, "calls, confidence:", result.confidence);
  return result;
}

export function reset() {
  if (Module && modelReady) {
    Module._needle_reset();
    console.log("[Needle] conversation reset");
  }
}

function strToWasm(str) {
  const bytes = new TextEncoder().encode(str + "\0");
  const ptr = Module._malloc(bytes.length);
  Module.HEAPU8.set(bytes, ptr);
  return ptr;
}

function waitForInit(mod) {
  return new Promise((resolve) => {
    if (mod._needle_init) { resolve(); return; }
    const check = () => {
      if (mod._needle_init) { resolve(); return; }
      setTimeout(check, 50);
    };
    check();
  });
}