<template>
  <div class="ai-assistant">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
          <span class="text-white text-lg font-bold">AI</span>
        </div>
        <div>
          <h3 class="text-lg font-bold text-gray-800">HSK-AI 助手</h3>
          <p class="text-xs text-gray-500">{{ currentModel }} 本地模型</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span :class="['w-2.5 h-2.5 rounded-full', modelReady ? 'bg-green-500 animate-pulse' : 'bg-gray-400']"></span>
        <span class="text-xs text-gray-500">{{ modelReady ? 'Ready' : 'Loading' }}</span>
        <button
          v-if="modelReady"
          @click="resetConversation"
          class="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          title="Reset conversation"
        >
          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Loading Screen -->
    <div v-if="loading" class="bg-gradient-to-br from-gray-50 to-violet-50 rounded-2xl p-6 mb-4">
      <div class="flex items-center gap-4 mb-4">
        <div class="animate-spin rounded-full h-8 w-8 border-3 border-violet-200 border-t-violet-600"></div>
        <div class="flex-1">
          <p class="text-sm font-medium text-gray-700">{{ loadingText }}</p>
          <div class="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-violet-500 to-purple-600 transition-all duration-300"
              :style="{ width: loadingProgress + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chat Messages -->
    <div v-show="!loading" ref="chatContainer" class="chat-messages mb-4 max-h-80 overflow-y-auto space-y-3 pr-2">
      <!-- Welcome message -->
      <div v-if="messages.length === 0" class="text-center py-6">
        <div class="w-14 h-14 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <span class="text-2xl font-bold text-violet-600">AI</span>
        </div>
        <h4 class="text-base font-bold text-gray-700 mb-1">HSK-AI 助手</h4>
        <p class="text-sm text-gray-500 mb-3">Query characters, translate text, navigate pages</p>
      </div>

      <!-- Messages -->
      <div
        v-for="(msg, index) in messages"
        :key="index"
        :class="['message', 'message-' + msg.type]"
      >
        <!-- User message -->
        <template v-if="msg.type === 'user'">
          <div class="flex items-start gap-2">
            <div class="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span class="text-white text-xs font-bold">U</span>
            </div>
            <div class="flex-1 bg-primary-50 rounded-2xl rounded-tl-sm px-4 py-2.5">
              <p class="text-gray-800 text-sm">{{ msg.content }}</p>
            </div>
          </div>
        </template>

        <!-- AI Status message (thinking, calling tool) -->
        <template v-else-if="msg.type === 'status'">
          <div class="flex items-start gap-2">
            <div class="w-7 h-7 bg-violet-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span class="text-white text-xs font-bold">AI</span>
            </div>
            <div class="flex-1 bg-violet-50 rounded-2xl rounded-tl-sm px-4 py-3">
              <div class="flex items-center gap-3">
                <div class="flex gap-1">
                  <span class="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
                  <span class="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
                  <span class="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
                </div>
                <span class="text-sm text-gray-600">{{ msg.content }}</span>
              </div>
            </div>
          </div>
        </template>

        <!-- AI Result message -->
        <template v-else-if="msg.type === 'result'">
          <div class="flex items-start gap-2">
            <div class="w-7 h-7 bg-violet-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span class="text-white text-xs font-bold">AI</span>
            </div>
            <div class="flex-1 bg-violet-50 rounded-2xl rounded-tl-sm px-4 py-3">
              <!-- Parsed result display -->
              <div v-if="msg.parsedResult">
                <div v-for="(item, idx) in (Array.isArray(msg.parsedResult) ? msg.parsedResult : [msg.parsedResult])" :key="idx" class="text-sm">
                  <template v-if="!item.error">
                    <!-- Hanzi info -->
                    <div v-if="item.char" class="mb-2">
                      <div class="flex items-center gap-3 mb-1">
                        <span class="text-2xl font-bold text-gray-800">{{ item.char }}</span>
                        <span v-if="item.pinyin" class="text-violet-600 font-medium">{{ item.pinyin }}{{ item.tone || '' }}</span>
                        <button
                          v-if="item.char"
                          @click="playAudio(item.char)"
                          class="p-1 bg-violet-100 hover:bg-violet-200 rounded-full transition-colors"
                          title="Play audio"
                        >
                          <svg class="w-4 h-4 text-violet-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </button>
                      </div>
                      <div class="grid grid-cols-3 gap-2 text-xs text-gray-600">
                        <div v-if="item.stroke_count"><span class="text-gray-400">笔画:</span> {{ item.stroke_count }}</div>
                        <div v-if="item.radical"><span class="text-gray-400">部首:</span> {{ item.radical }}</div>
                      </div>
                      <div v-if="item.words && item.words.length" class="mt-2">
                        <span class="text-xs text-gray-400">词语:</span>
                        <span class="text-xs text-gray-600 ml-1">{{ item.words.slice(0, 10).join(', ') }}</span>
                      </div>
                      <div v-if="item.idioms && item.idioms.length" class="mt-1">
                        <span class="text-xs text-gray-400">成语:</span>
                        <span class="text-xs text-gray-600 ml-1">{{ item.idioms.slice(0, 5).join(', ') }}</span>
                      </div>
                    </div>
                    <!-- Translation -->
                    <div v-if="item.translated" class="text-violet-700">
                      <span class="text-xs text-gray-500">翻译:</span>
                      <span class="ml-1 font-medium">{{ item.translated }}</span>
                    </div>
                    <!-- Explanation -->
                    <div v-if="item.explanation" class="text-gray-700 prose prose-sm max-w-none" v-html="renderMarkdown(item.explanation)"></div>
                    <!-- Search results -->
                    <div v-if="item.total !== undefined" class="mt-2">
                      <span class="text-xs text-gray-400">找到:</span>
                      <span class="text-xs font-medium text-violet-700 ml-1">{{ item.total }} 个结果</span>
                      <div v-if="item.results && item.results.length" class="mt-1 flex flex-wrap gap-1">
                        <span
                          v-for="r in item.results.slice(0, 20)"
                          :key="r.word"
                          class="px-2 py-0.5 bg-violet-50 text-violet-700 text-xs rounded cursor-pointer hover:bg-violet-100"
                          @click="navigateTo(`/word/${r.word}`)"
                        >
                          {{ r.word }}
                        </span>
                      </div>
                    </div>
                    <!-- Audio result -->
                    <div v-if="item.audio_url" class="flex items-center gap-2 mt-2">
                      <button
                        @click="playAudioUrl(item.audio_url)"
                        class="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 text-xs rounded-lg transition-colors"
                      >
                        🔊 Play Audio
                      </button>
                      <span class="text-xs text-gray-500">{{ item.pinyin || item.text }}</span>
                    </div>
                    <!-- Navigation result -->
                    <div v-if="item.navigation" class="mt-2">
                      <button
                        @click="navigateTo(item.navigation.path)"
                        class="px-3 py-1.5 bg-violet-100 hover:bg-violet-200 text-violet-700 text-xs rounded-lg transition-colors"
                      >
                        → Go to {{ item.navigation.label || item.navigation.path }}
                      </button>
                    </div>
                  </template>
                  <div v-else class="text-red-500 text-xs">{{ item.error }}</div>
                </div>
              </div>
              <!-- Fallback to raw content (rendered as markdown) -->
              <div v-else class="text-gray-700 text-sm prose prose-sm max-w-none" v-html="renderMarkdown(msg.content)"></div>
            </div>
          </div>
        </template>

        <!-- Tool call (expandable) -->
        <template v-else-if="msg.type === 'tool'">
          <div class="ml-9">
            <div class="tool-card">
              <button @click="msg.expanded = !msg.expanded" class="w-full flex items-center justify-between px-4 py-2.5 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors">
                <div class="flex items-center gap-2">
                  <span class="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded font-medium">{{ msg.tool }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-xs text-amber-500">{{ msg.expanded ? 'Hide' : 'Show' }}</span>
                  <svg :class="['w-4 h-4 text-amber-500 transition-transform', msg.expanded ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              <div v-show="msg.expanded" class="px-4 py-3 border-t border-amber-100">
                <div class="text-xs text-gray-500 mb-1">Input: {{ formatArgs(msg.args) }}</div>
                <div class="text-xs text-gray-500">Output: {{ formatResult(msg.result) }}</div>
              </div>
            </div>
          </div>
        </template>

        <!-- Error -->
        <template v-else-if="msg.type === 'error'">
          <div class="flex items-start gap-2">
            <div class="w-7 h-7 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div class="flex-1 bg-red-50 rounded-2xl rounded-tl-sm px-4 py-2.5">
              <p class="text-red-700 text-sm">{{ msg.content }}</p>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Input Area -->
    <div class="input-wrapper">
      <div class="input-container">
        <!-- Placeholder layer (clickable to focus input) -->
        <div
          v-if="!inputText && !isUserTyping && modelReady"
          class="placeholder-layer"
          @click="focusInput"
        >
          <span class="placeholder-text" @click.stop="selectExample(displayText)">
            {{ displayText }}
          </span>
          <span class="placeholder-cursor">|</span>
        </div>

        <!-- Input field -->
        <textarea
          ref="inputRef"
          v-model="inputText"
          @input="handleInputChange"
          @focus="handleInputFocus"
          @blur="handleInputBlur"
          @keydown="handleKeyDown"
          :disabled="!modelReady || processing"
          rows="1"
          class="input-field"
        ></textarea>

        <!-- Send button -->
        <button
          @click="sendMessage(inputText)"
          :disabled="!modelReady || processing || !inputText.trim()"
          class="send-btn"
        >
          <svg v-if="!processing" class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          <svg v-else class="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </button>
      </div>
      <div v-if="!inputText && !isUserTyping && modelReady" class="hint-text">Ask about Chinese words, translate, or navigate</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useConfigStore } from '../stores/config'
import { loadModel, isReady, complete, reset } from '../lib/needle'
import { getToolSchemas, executeTool } from '../lib/tools-hsk'
import { marked } from 'marked'
import cnchar from 'cnchar-all'

const router = useRouter()
const configStore = useConfigStore()

// Configure marked
marked.setOptions({
  breaks: true,
  gfm: true
})

// State
const modelReady = ref(false)
const loading = ref(true)
const loadingText = ref('Initializing...')
const loadingProgress = ref(0)
const inputText = ref('')
const processing = ref(false)
const messages = ref([])

const chatContainer = ref(null)
const inputRef = ref(null)

// Current needle model type
const currentModel = computed(() => configStore.needleModel || 'needle2')

// Track if user is actively typing
const isUserTyping = ref(false)

// Carousel examples
const carouselExamples = [
  'What does 一箭双雕 mean?',
  'Define 梅花香自苦寒来',
  'Translate 你好 to English',
  'Say 爱',
  'Search HSK2 words',
  'Lookup 好',
  'Navigate to /write',
]

// Carousel state
const currentHintIndex = ref(0)
const displayText = ref('')
let typingTimer = null

const currentHint = computed(() => carouselExamples[currentHintIndex.value] || '')

// Typing animation
function startTypingAnimation() {
  if (isUserTyping.value || inputText.value || processing.value) return

  const fullText = currentHint.value
  let charIndex = 0
  displayText.value = ''

  function typeChar() {
    if (isUserTyping.value || inputText.value || processing.value) {
      displayText.value = ''
      return
    }
    if (charIndex < fullText.length) {
      displayText.value += fullText[charIndex]
      charIndex++
      typingTimer = setTimeout(typeChar, 60)
    } else {
      typingTimer = setTimeout(nextExample, 2000)
    }
  }

  typeChar()
}

function nextExample() {
  if (isUserTyping.value || inputText.value || processing.value) return

  let chars = displayText.value

  function eraseChar() {
    if (isUserTyping.value || inputText.value || processing.value) {
      displayText.value = ''
      return
    }
    if (chars.length > 0) {
      chars = chars.slice(0, -1)
      displayText.value = chars
      typingTimer = setTimeout(eraseChar, 30)
    } else {
      currentHintIndex.value = (currentHintIndex.value + 1) % carouselExamples.length
      typingTimer = setTimeout(() => {
        startTypingAnimation()
      }, 400)
    }
  }

  eraseChar()
}

function stopTypingAnimation() {
  if (typingTimer) {
    clearTimeout(typingTimer)
    typingTimer = null
  }
}

function startCarousel() {
  startTypingAnimation()
}

function stopCarousel() {
  stopTypingAnimation()
  isUserTyping.value = false
}

function selectExample(hint) {
  inputText.value = hint
  displayText.value = ''
  stopTypingAnimation()
  isUserTyping.value = true
  if (inputRef.value) {
    inputRef.value.focus()
    inputRef.value.setSelectionRange(hint.length, hint.length)
  }
}

function handleInputFocus() {
  if (inputText.value) {
    isUserTyping.value = true
    stopTypingAnimation()
  }
}

function handleInputBlur() {
  // Small delay to allow click events to fire first
  setTimeout(() => {
    if (!inputText.value && !processing.value) {
      isUserTyping.value = false
      startTypingAnimation()
    }
  }, 200)
}

// Focus the input field
function focusInput() {
  if (inputRef.value) {
    inputRef.value.focus()
  }
}

function handleInputChange() {
  if (inputText.value) {
    isUserTyping.value = true
    stopTypingAnimation()
  }
}

// Play audio for a character
function playAudio(char) {
  const pinyin = cnchar.spell(char)
  const toneInfo = cnchar.transformTone(pinyin)
  let pinyinForAudio = toneInfo?.tone ? `${pinyin.toLowerCase()}${toneInfo.tone}` : pinyin.toLowerCase()
  const audioUrl = `https://zidian.gushici.net/d/mp3/${encodeURIComponent(pinyinForAudio)}.mp3`

  // Fetch as blob to avoid COEP blocking
  fetch(audioUrl)
    .then(res => res.blob())
    .then(blob => {
      const blobUrl = URL.createObjectURL(blob)
      const audio = new Audio(blobUrl)
      audio.play().catch(err => console.log('Audio play failed:', err))
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000)
    })
    .catch(err => console.log('Audio fetch failed:', err))
}

function playAudioUrl(url) {
  // If it's a cross-origin URL, fetch as blob to avoid COEP blocking
  if (url.startsWith('http')) {
    fetch(url)
      .then(res => res.blob())
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob)
        const audio = new Audio(blobUrl)
        audio.play().catch(err => console.log('Audio play failed:', err))
        // Clean up blob URL after a delay
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60000)
      })
      .catch(err => console.log('Audio fetch failed:', err))
  } else {
    const audio = new Audio(url)
    audio.play().catch(err => console.log('Audio play failed:', err))
  }
}

// Navigate to path
function navigateTo(path) {
  router.push(path)
}

// Render markdown content
function renderMarkdown(content) {
  if (!content) return ''
  try {
    return marked.parse(content)
  } catch {
    return content
  }
}

// Initialize model
async function initModel() {
  try {
    const modelType = currentModel.value
    loadingText.value = `Loading ${modelType}...`
    const schemas = getToolSchemas()
    const toolsJson = JSON.stringify(schemas)

    await loadModel(modelType, toolsJson, (msg) => {
      loadingText.value = msg
      if (msg.includes('Step 1')) loadingProgress.value = 10
      else if (msg.includes('Step 2')) loadingProgress.value = 30
      else if (msg.includes('Step 3')) loadingProgress.value = 60
      else if (msg.includes('Step 4')) loadingProgress.value = 80
      else if (msg.includes('Model ready')) loadingProgress.value = 100
    })

    modelReady.value = true
    loading.value = false
    startCarousel()
  } catch (e) {
    console.error('Failed to load model:', e)
    loadingText.value = '加载失败: ' + e.message
  }
}

// Reset conversation
function resetConversation() {
  reset()
  messages.value = []
}

// Handle input
function handleKeyDown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage(inputText.value)
  }
}

// Auto-resize textarea
watch(inputText, () => {
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.style.height = 'auto'
      inputRef.value.style.height = Math.min(inputRef.value.scrollHeight, 120) + 'px'
    }
  })
})

// Send message
async function sendMessage(text) {
  const trimmed = text.trim()
  if (!trimmed || !modelReady.value) return

  inputText.value = ''
  isUserTyping.value = false
  stopTypingAnimation()

  if (inputRef.value) {
    inputRef.value.style.height = 'auto'
    inputRef.value.blur()
  }

  // Reset conversation history before new query
  reset()

  // Add user message
  messages.value.push({ type: 'user', content: trimmed })

  processing.value = true
  scrollToBottom()

  try {
    await runAgentLoop(trimmed)
  } catch (e) {
    messages.value.push({ type: 'error', content: 'Error: ' + e.message })
  } finally {
    processing.value = false
    scrollToBottom()
    // Resume carousel after short delay
    setTimeout(() => {
      if (!inputText.value && !isUserTyping.value) {
        startTypingAnimation()
      }
    }, 500)
  }
}

// Parse result for display
function parseResult(result) {
  if (!result) return null
  if (Array.isArray(result)) return result
  if (result.char || result.translated || result.explanation || result.audio_url || result.navigation || result.total !== undefined) return [result]
  if (result.results) return [result]
  return [{ content: typeof result === 'string' ? result : JSON.stringify(result) }]
}

// Clean reasoning - remove corrupted JSON fragments
function cleanReasoning(text) {
  if (!text) return ''
  let cleaned = text

  // Remove JSON object tails that are incomplete
  const jsonTailMatch = cleaned.match(/[\s\S]*(\{[\s\S]*)$/)
  if (jsonTailMatch) {
    // Find the last complete property
    const lastProp = cleaned.lastIndexOf(',"')
    if (lastProp > 50) {
      cleaned = cleaned.substring(0, lastProp)
    }
  }

  // Remove trailing escape sequences
  cleaned = cleaned.replace(/\\[nrtb\\/"'u]+$/, '')

  // Remove repeated character sequences (indicates corruption)
  cleaned = cleaned.replace(/(.)\1{4,}/g, '$1$1$1')

  // Truncate at last period if still too long and looks like JSON
  if (cleaned.length > 200) {
    const lastPeriod = cleaned.lastIndexOf('.')
    if (lastPeriod > 100) {
      cleaned = cleaned.substring(0, lastPeriod + 1)
    }
  }

  return cleaned.trim()
}

// Truncate result for model - only include essential fields
function truncateResultForModel(result) {
  if (!result) return '{}'

  // Handle array results
  if (Array.isArray(result)) {
    // If array has single item (like from hanzi), process it
    if (result.length === 1) {
      return truncateResultForModel(result[0])
    }
    // For multi-item arrays (like search results), summarize
    return JSON.stringify({
      total: result.length,
      summary: result.slice(0, 5).map(r => r.word || r.char || '').join(', ')
    })
  }

  // For hanzi info, simplify
  if (result.char) {
    const simplified = {
      char: result.char,
      pinyin: result.pinyin,
      tone: result.tone,
      stroke_count: result.stroke_count,
      radical: result.radical,
      words_count: result.words_count || 0,
      idioms_count: result.idioms_count || 0
    }
    return JSON.stringify(simplified)
  }

  // For translation
  if (result.translated) {
    return JSON.stringify({
      original: result.original,
      translated: result.translated,
      target_lang: result.target_lang
    })
  }

  // For audio
  if (result.audio_url) {
    return JSON.stringify({
      text: result.text,
      pinyin: result.pinyin,
      played: result.played
    })
  }

  // For search results
  if (result.results) {
    return JSON.stringify({
      total: result.total,
      results: result.results.slice(0, 10).map(r => ({ word: r.word, pinyin: r.pinyin }))
    })
  }

  // For explanation/navigation
  if (result.explanation || result.navigation) {
    return JSON.stringify({ success: true })
  }

  // For error
  if (result.error) {
    return JSON.stringify({ error: result.error })
  }

  return JSON.stringify({ success: true })
}

// Agent loop
async function runAgentLoop(query) {
  const maxSteps = 8
  let currentQuery = query

  for (let step = 0; step < maxSteps; step++) {
    // Show thinking status
    messages.value.push({ type: 'status', content: `Thinking (step ${step + 1})...` })
    scrollToBottom()

    await new Promise(r => requestAnimationFrame(r))
    await new Promise(r => setTimeout(r, 50))

    const response = await complete(currentQuery)
    const rtype = response.type

    // Remove thinking status
    const statusIdx = messages.value.findIndex(m => m.type === 'status')
    if (statusIdx !== -1) messages.value.splice(statusIdx, 1)

    if (rtype === 'respond') {
      // AI has finished, show result message
      const reasoning = cleanReasoning(response.reasoning || '')
      const confidence = response.confidence ?? 0

      // Check if reasoning is corrupted or confidence is too low
      if (confidence < 0.001 && reasoning.length > 500) {
        // Likely corrupted output, don't show garbled reasoning
        messages.value.push({
          type: 'result',
          content: 'Processing complete.',
          parsedResult: null
        })
      } else if (reasoning) {
        messages.value.push({ type: 'result', content: reasoning, parsedResult: null })
      }
      break
    }

    if (rtype === 'call') {
      const calls = response.function_calls || []
      if (calls.length === 0) {
        messages.value.push({ type: 'error', content: 'No matching tool found' })
        break
      }

      for (const call of calls) {
        const { name, arguments: args } = call

        // Show calling status
        messages.value.push({ type: 'status', content: `Calling ${name}...` })
        scrollToBottom()

        // Execute tool
        const result = await executeTool(name, args)

        // Remove calling status
        const statusIdx = messages.value.findIndex(m => m.type === 'status')
        if (statusIdx !== -1) messages.value.splice(statusIdx, 1)

        // Parse result for display
        const parsedResult = parseResult(result)

        // Add tool call card (collapsed by default)
        messages.value.push({
          type: 'tool',
          tool: name,
          args,
          result,
          parsedResult,
          expanded: step === 0 // First one expanded
        })

        // Also add a result message with the parsed data
        messages.value.push({
          type: 'result',
          content: '',
          parsedResult
        })

        // Truncate result for model (prevent corrupted output from large JSON)
        currentQuery = truncateResultForModel(result)
        scrollToBottom()
      }
      // Continue to next step of outer loop
      continue
    }

    messages.value.push({ type: 'error', content: `Unknown response type: ${rtype}` })
    break
  }
}

// Scroll to bottom of chat
function scrollToBottom() {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

// Format args for display
function formatArgs(args) {
  if (typeof args === 'string') return args
  try {
    return JSON.stringify(args, null, 2)
  } catch {
    return String(args)
  }
}

// Format result for display
function formatResult(result) {
  if (typeof result === 'string') return result
  try {
    return JSON.stringify(result, null, 2)
  } catch {
    return String(result)
  }
}

// Initialize on mount
onMounted(() => {
  initModel()
})

onUnmounted(() => {
  stopCarousel()
})
</script>

<style scoped>
.ai-assistant {
  @apply p-5 bg-white rounded-2xl shadow-lg border border-gray-100;
}

.chat-messages {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: transparent;
}

.chat-messages::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 3px;
}

.message {
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tool-card {
  @apply rounded-xl overflow-hidden border border-amber-200;
}

/* Input wrapper styles */
.input-wrapper {
  @apply bg-white rounded-xl border-2 border-gray-200 transition-colors;
}

.input-container {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  position: relative;
}

.input-container:focus-within {
  @apply border-violet-400;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.input-field {
  flex: 1;
  @apply bg-transparent text-sm resize-none outline-none disabled:opacity-50 disabled:cursor-not-allowed;
  text-align: left;
  min-height: 1.5rem;
  max-height: 6rem;
  line-height: 1.5;
  padding-right: 0.5rem;
}

/* Placeholder layer */
.placeholder-layer {
  position: absolute;
  left: 1rem;
  right: 3.5rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  pointer-events: auto;
  cursor: text;
}

.placeholder-text {
  @apply text-gray-400 text-sm whitespace-nowrap overflow-hidden;
  cursor: pointer;
  max-width: calc(100% - 1.5rem);
}

.placeholder-text:hover {
  @apply text-violet-500;
}

/* Typing cursor animation */
.placeholder-cursor {
  @apply text-violet-500 ml-0.5 select-none flex-shrink-0;
  animation: blink 0.8s step-end infinite;
  font-weight: 100;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* Hint text below input */
.hint-text {
  @apply text-xs text-gray-400 text-center pb-2;
}

/* Send button */
.send-btn {
  @apply p-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors flex-shrink-0;
}
</style>