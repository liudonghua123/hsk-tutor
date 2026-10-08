/**
 * Needle WASM LLM wrapper for HSK Tutor
 * Uses Web Worker for model loading and inference to avoid blocking UI
 */

let worker = null;
let modelReady = false;
let currentModel = null;
let messageId = 0;
const pendingRequests = new Map();

export function isReady() {
  return modelReady;
}

export function getCurrentModel() {
  return currentModel;
}

// Initialize the worker
function initWorker(modelType) {
  if (worker) return;

  // Worker should be in the same directory as needle.js
  const workerPath = `/lib/${modelType}/needle-worker.js`;
  worker = new Worker(workerPath);
  console.log('[Needle] Loading worker from:', workerPath);

  worker.onmessage = function(e) {
    const { id, type, data } = e.data;

    // Handle worker ready signal
    if (type === 'workerReady') {
      console.log('[Needle] Worker is ready');
      return;
    }

    // Resolve pending request
    if (id !== undefined && pendingRequests.has(id)) {
      const { resolve, reject } = pendingRequests.get(id);
      pendingRequests.delete(id);
      resolve(data);
    }
  };

  worker.onerror = function(e) {
    console.error('[Needle] Worker error:', e);
    // Reject all pending requests
    for (const [id, { reject }] of pendingRequests) {
      reject(new Error(`Worker error: ${e.message}`));
    }
    pendingRequests.clear();
  };
}

// Send a message to worker and wait for response
function sendMessage(type, data) {
  return new Promise((resolve, reject) => {
    if (!worker) {
      reject(new Error('Worker not initialized'));
      return;
    }

    const id = messageId++;
    pendingRequests.set(id, { resolve, reject });
    worker.postMessage({ id, type, data });

    // Timeout after 5 minutes for load operations, 30 seconds for others
    const timeout = type === 'load' ? 300000 : 30000;
    setTimeout(() => {
      if (pendingRequests.has(id)) {
        pendingRequests.delete(id);
        reject(new Error(`Timeout waiting for ${type}`));
      }
    }, timeout);
  });
}

export async function loadModel(modelType, toolsJson, onProgress) {
  if (modelReady && currentModel === modelType) return;

  // Initialize worker with the correct model path
  initWorker(modelType);

  try {
    currentModel = modelType;

    // Create a one-time message handler for progress
    const progressHandler = (e) => {
      if (e.data.type === 'progress' && e.data.data?.message) {
        onProgress?.(e.data.data.message);
      }
    };
    worker.addEventListener('message', progressHandler);

    try {
      const result = await sendMessage('load', { modelType, toolsJson, withProgress: true });

      if (result.success) {
        modelReady = true;
      } else {
        modelReady = false;
        throw new Error(result.error || 'Failed to load model');
      }
    } finally {
      // Remove progress handler after load completes
      worker.removeEventListener('message', progressHandler);
    }
  } catch (e) {
    console.error('[Needle] Load failed:', e);
    modelReady = false;
    throw e;
  }
}

export async function complete(input) {
  if (!modelReady) throw new Error("Model not loaded");

  const result = await sendMessage('complete', { input });
  return result;
}

export async function reset() {
  if (!modelReady) return { success: false, error: 'Model not loaded' };

  try {
    const result = await sendMessage('reset', {});
    return result;
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (worker) {
      worker.terminate();
      worker = null;
    }
  });
}