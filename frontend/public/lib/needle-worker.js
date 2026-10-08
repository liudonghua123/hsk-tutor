/**
 * Needle WASM Worker for HSK Tutor
 * Runs model loading and inference in a Web Worker to avoid blocking UI
 */

let Module = null;
let modelReady = false;
let currentModel = null;
let weightsPtr = null;

// Log helper
function log(msg) {
  const full = `[Needle Worker] ${msg}`;
  console.log(full);
  // Send progress to main thread
  self.postMessage({ type: 'progress', data: { message: msg } });
}

// Dynamically load needle.js script for the specified model
async function loadNeedleScript(modelType) {
  const basePath = `/lib/${modelType}/`;
  const scriptPath = `${basePath}needle.js`;
  console.log("[Needle Worker] Loading needle script from:", scriptPath);

  return new Promise((resolve, reject) => {
    try {
      importScripts(scriptPath);

      // Fix scriptDirectory after load - it was computed from worker URL
      // The locateFile() function inside needle.js uses scriptDirectory
      globalThis.scriptDirectory = basePath;
      console.log("[Needle Worker] Fixed scriptDirectory to:", basePath);

      if (typeof createNeedle === 'function') {
        console.log("[Needle Worker] createNeedle loaded successfully");
        resolve();
      } else {
        reject(new Error('createNeedle not found after loading'));
      }
    } catch (e) {
      reject(e);
    }
  });
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

// Load model
async function loadModel(modelType, toolsJson) {
  if (modelReady && currentModel === modelType) {
    return { success: true, message: 'Already loaded' };
  }

  const t0 = performance.now();

  try {
    currentModel = modelType;
    const basePath = `/lib/${modelType}/`;

    log("Loading WASM engine...");
    console.log("[Needle Worker] Dynamically loading needle script...");

    // Dynamically load needle.js in worker using importScripts
    await loadNeedleScript(modelType);
    console.log("[Needle Worker] createNeedle global:", typeof createNeedle);

    Module = await createNeedle({
      locateFile: (path) => basePath + path,
    });
    console.log("[Needle Worker] Module keys:", Object.keys(Module).filter(k => k.startsWith("_")).slice(0, 20));
    await waitForInit(Module);
    log("WASM engine loaded");

    log("Loading model weights...");
    const cactUrl = `${basePath}${modelType}.cact`;
    console.log("[Needle Worker] cact URL:", cactUrl);
    const resp = await fetch(cactUrl);
    if (!resp.ok) throw new Error(`CACT fetch failed: HTTP ${resp.status}`);

    const cactBytes = new Uint8Array(await resp.arrayBuffer());
    console.log("[Needle Worker] cact size:", (cactBytes.length / 1024 / 1024).toFixed(1), "MB");

    weightsPtr = Module._malloc(cactBytes.length);
    Module.HEAPU8.set(cactBytes, weightsPtr);
    const ret = Module._needle_load(weightsPtr, BigInt(cactBytes.length));
    console.log("[Needle Worker] needle_load returned:", ret);
    if (ret !== 0) throw new Error(`needle_load() returned ${ret}`);
    log("Weights loaded");

    const today = new Date();
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")} ${days[today.getDay()]}`;
    const locale = "en-US";
    const systemPrompt = `date: ${dateStr}; locale: ${locale}; device: browser (HSK Tutor)`;

    log("Initializing tools...");
    console.log("[Needle Worker] tools JSON (first 500):", toolsJson.slice(0, 500));
    console.log("[Needle Worker] system prompt:", systemPrompt);
    const sPtr = strToWasm(systemPrompt);
    const tPtr = strToWasm(toolsJson);
    const iPtr = 0;
    const initRet = Module._needle_init(sPtr, tPtr, iPtr);
    Module._free(sPtr); Module._free(tPtr);
    console.log("[Needle Worker] needle_init returned:", initRet);
    if (initRet < 0) throw new Error(`needle_init() returned ${initRet}`);
    log("Tools initialized");

    modelReady = true;
    log("Model ready!");
    return { success: true };
  } catch (e) {
    console.error("[Needle Worker] LOAD FAILED:", e);
    modelReady = false;
    return { success: false, error: e.message };
  }
}

// Complete a query
function complete(input) {
  if (!Module || !modelReady) {
    return { error: "Model not loaded" };
  }

  console.log("[Needle Worker] complete input (first 200):", input.slice(0, 200));

  const inPtr = strToWasm(input);
  const outCap = 32768;
  const outPtr = Module._malloc(outCap);
  Module.HEAPU8.fill(0, outPtr, outPtr + outCap);

  const status = Module._needle_complete(inPtr, 1024, outPtr, outCap);
  Module._free(inPtr);

  console.log("[Needle Worker] needle_complete status:", status, "outCap:", outCap);

  let end = outPtr;
  while (end < outPtr + outCap && Module.HEAPU8[end] !== 0) end++;
  const outLen = end - outPtr;
  console.log("[Needle Worker] output bytes read:", outLen);

  let result;
  if (outLen > 0) {
    const text = new TextDecoder().decode(Module.HEAPU8.subarray(outPtr, end));
    Module._free(outPtr);
    console.log("[Needle Worker] raw output text:", text);
    try {
      result = JSON.parse(text);
    } catch {
      console.warn("[Needle Worker] JSON parse failed, raw:", text);
      result = { type: "respond", function_calls: [], reasoning: text, confidence: 0 };
    }
  } else {
    Module._free(outPtr);
    console.warn("[Needle Worker] empty output, status:", status);
    result = { type: "respond", function_calls: [], reasoning: "", confidence: 0 };
  }

  console.log("[Needle Worker] complete result:", result.type, result.function_calls?.length ?? 0, "calls, confidence:", result.confidence);
  return result;
}

// Reset conversation
function reset() {
  if (Module && modelReady) {
    Module._needle_reset();
    console.log("[Needle Worker] conversation reset");
  }
  return { success: true };
}

// Handle messages from main thread
self.onmessage = async function(e) {
  const { id, type, data } = e.data;

  try {
    let result;
    let resultType;

    switch (type) {
      case 'load':
        result = await loadModel(data.modelType, data.toolsJson);
        resultType = 'loadResult';
        break;

      case 'complete':
        result = complete(data.input);
        resultType = 'completeResult';
        break;

      case 'reset':
        result = reset();
        resultType = 'resetResult';
        break;

      case 'isReady':
        result = { ready: modelReady };
        resultType = 'readyResult';
        break;

      default:
        result = { error: `Unknown message type: ${type}` };
        resultType = 'error';
    }

    self.postMessage({ id, type: resultType, data: result });
  } catch (e) {
    self.postMessage({ id, type: 'error', data: { error: e.message } });
  }
};

// Signal that worker is ready
self.postMessage({ type: 'workerReady' });