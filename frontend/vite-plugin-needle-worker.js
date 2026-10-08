/**
 * Vite plugin to copy needle-worker.js to each model directory
 * This ensures the worker is always in the same directory as needle.js
 */

import fs from 'fs'
import path from 'path'

export function needleWorkerPlugin() {
  return {
    name: 'vite-plugin-needle-worker',
    apply: (config, { command }) => {
      // apply on build and serve
      return command === 'build' || command === 'serve'
    },

    buildStart() {
      const models = ['needle2', 'needle3']
      const sourceFile = path.resolve('public/lib/needle-worker.js')

      // Check if source exists
      if (!fs.existsSync(sourceFile)) {
        console.warn('[vite-plugin-needle-worker] Source file not found:', sourceFile)
        return
      }

      const sourceContent = fs.readFileSync(sourceFile, 'utf-8')

      for (const model of models) {
        const targetDir = path.resolve(`public/lib/${model}`)
        const targetFile = path.join(targetDir, 'needle-worker.js')

        // Ensure directory exists
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true })
        }

        // Write the worker file
        fs.writeFileSync(targetFile, sourceContent)
        console.log(`[vite-plugin-needle-worker] Copied to ${targetFile}`)
      }
    }
  }
}