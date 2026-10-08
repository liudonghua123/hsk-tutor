<template>
  <div class="pinyin-annotator">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-4">
      <button @click="expanded = !expanded" class="flex items-center gap-3 w-full text-left group">
        <div class="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md transition-transform group-hover:scale-105">
          <span class="text-white text-lg font-bold">拼</span>
        </div>
        <div>
          <h3 class="text-lg font-bold text-gray-800">拼音标注 / Pinyin Annotator</h3>
          <p class="text-xs text-gray-500">输入中文文本，自动标注拼音</p>
        </div>
        <svg :class="['w-5 h-5 text-gray-400 ml-auto transition-transform', expanded ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>

    <div v-show="expanded" class="space-y-4">
      <!-- 1. Input -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-sm font-semibold text-gray-700">输入 / Input</h4>
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-400">{{ charCount }} 字</span>
            <button @click="clearInput" class="px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded-lg">清空</button>
          </div>
        </div>
        <textarea ref="inputRef" v-model="inputText" @input="handleInput" placeholder="在这里输入或粘贴中文文本..." class="w-full h-32 p-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-300 text-base"></textarea>
      </div>

      <!-- 2. Settings -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <button @click="settingsExpanded = !settingsExpanded" class="w-full flex items-center justify-between p-4 hover:bg-gray-50">
          <span class="text-sm font-medium text-gray-600">设置 / Settings</span>
          <svg :class="['w-4 h-4 text-gray-400 transition-transform', settingsExpanded ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div v-show="settingsExpanded" class="px-4 pb-4 space-y-4">
          <div class="flex items-center gap-3">
            <label class="text-xs text-gray-500 w-16">字号</label>
            <input type="range" v-model.number="fontSize" min="16" max="40" step="2" @change="renderPreview" class="flex-1 accent-orange-500" />
            <span class="text-xs text-gray-600 w-12 text-right">{{ fontSize }}px</span>
          </div>

          <div class="flex items-center gap-3">
            <label class="text-xs text-gray-500 w-16">字体</label>
            <select v-model="chineseFont" @change="renderPreview" class="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5">
              <option value="'KaiTi','STKaiti','楷体','Kaiti SC',serif">楷体（默认）</option>
              <option value="'SimSun','宋体',serif">宋体</option>
              <option value="'SimHei','PingFang SC','Microsoft YaHei',sans-serif">黑体</option>
            </select>
          </div>

          <div class="flex items-center gap-3">
            <label class="text-xs text-gray-500 w-16">音标</label>
            <div class="flex gap-1">
              <button @click="setPhoneticMode('py')" :class="['px-3 py-1 text-xs rounded-lg transition-colors', phoneticMode === 'py' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600']">拼音</button>
              <button @click="setPhoneticMode('zy')" :class="['px-3 py-1 text-xs rounded-lg transition-colors', phoneticMode === 'zy' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600']">注音</button>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <label class="text-xs text-gray-500 w-16">{{ phoneticMode === 'py' ? '拼音位置' : '注音方向' }}</label>
            <div class="flex gap-1">
              <button @click="setPositionMode('h')" :class="['px-3 py-1 text-xs rounded-lg transition-colors', positionMode === 'h' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600']">{{ phoneticMode === 'py' ? '上方' : '横排' }}</button>
              <button @click="setPositionMode('v')" :class="['px-3 py-1 text-xs rounded-lg transition-colors', positionMode === 'v' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600']">{{ phoneticMode === 'py' ? '右侧' : '直排' }}</button>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <label class="text-xs text-gray-500 w-16">字间距</label>
            <input type="range" v-model.number="charGap" min="0" max="8" step="1" @change="renderPreview" class="flex-1 accent-orange-500" />
            <span class="text-xs text-gray-600 w-12 text-right">{{ charGap }}px</span>
          </div>

          <div class="flex items-center gap-3">
            <label class="text-xs text-gray-500 w-16">行间距</label>
            <input type="range" v-model.number="lineHeightNum" min="16" max="36" step="1" @change="renderPreview" class="flex-1 accent-orange-500" />
            <span class="text-xs text-gray-600 w-12 text-right">{{ (lineHeightNum / 10).toFixed(1) }}</span>
          </div>

          <div class="flex items-center gap-3">
            <label class="text-xs text-gray-500 w-16">段间距</label>
            <input type="range" v-model.number="paraGap" min="0" max="30" step="2" @change="renderPreview" class="flex-1 accent-orange-500" />
            <span class="text-xs text-gray-600 w-12 text-right">{{ paraGap }}px</span>
          </div>

          <div class="flex items-center gap-3">
            <label class="text-xs text-gray-500 w-16">显示</label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="showPhonetics" @change="renderPreview" class="w-4 h-4 accent-orange-500 rounded" />
              <span class="text-xs text-gray-600">{{ phoneticMode === 'py' ? '在汉字上方显示拼音' : '在汉字上方显示注音' }}</span>
            </label>
          </div>

          <div class="flex items-center gap-3">
            <label class="text-xs text-gray-500 w-16">高亮</label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="highlightTricky" @change="handleInput" class="w-4 h-4 accent-orange-500 rounded" />
              <span class="text-xs text-gray-600">底纹标出多音字、儿化、的地得等易错字</span>
            </label>
          </div>

          <div class="flex items-center gap-3">
            <label class="text-xs text-gray-500 w-16">变调</label>
            <div class="flex gap-1">
              <button @click="toneSandhi = true; handleInput()" :class="['px-2 py-1 text-xs rounded-lg', toneSandhi ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600']">标实际读音</button>
              <button @click="toneSandhi = false; handleInput()" :class="['px-2 py-1 text-xs rounded-lg', !toneSandhi ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600']">标原调</button>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <label class="text-xs text-gray-500 w-16">儿化</label>
            <div class="flex gap-1">
              <button @click="erhuaMode = 'char'; handleInput()" :class="['px-2 py-1 text-xs rounded-lg', erhuaMode === 'char' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600']">逐字注音</button>
              <button @click="erhuaMode = 'merge'; handleInput()" :class="['px-2 py-1 text-xs rounded-lg', erhuaMode === 'merge' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600']">标准拼音</button>
            </div>
          </div>

          <div class="flex items-center gap-3 pt-2 border-t border-gray-100">
            <label class="text-xs text-gray-500 w-16">引擎</label>
            <span class="text-xs text-gray-400 flex-1">
              <template v-if="!engineLoaded && !engineLoading">未加载</template>
              <template v-else-if="engineLoading">加载中...</template>
              <template v-else>pinyin-pro v3.18.2</template>
            </span>
            <button v-if="!engineLoaded && !engineLoading" @click="loadEngine" class="text-xs px-2 py-1 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded">加载</button>
          </div>
        </div>
      </div>

      <!-- 3. Preview -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-sm font-semibold text-gray-700">预览 / Preview</h4>
        </div>

        <div ref="previewRef" :class="['py-preview', previewClasses]" :style="previewStyles">
          <div v-if="!inputText.trim()" class="empty-tip">输入文本后自动显示拼音标注</div>
          <div v-else-if="engineLoading" class="empty-tip">加载拼音引擎中...</div>
          <div v-else-if="previewContent" class="py-content" v-html="previewContent" @click="handlePreviewClick"></div>
        </div>
      </div>
    </div>

    <!-- Popover -->
    <Teleport to="body">
      <div v-if="popoverVisible" ref="popoverRef" class="pinyin-popover" :style="{ left: popoverX + 'px', top: popoverY + 'px' }">
        <div class="popover-header">
          <b class="popover-char">{{ popoverChar }}</b>
          <span>选择读音</span>
        </div>
        <div class="popover-options">
          <button v-for="(opt, i) in popoverOptions" :key="i" :class="['popover-option', { current: opt === popoverCurrent }]" @click="selectPinyin(opt)">{{ opt }}</button>
          <template v-if="isErhua">
            <button class="popover-option" @click="setErhua('merge')">前字加 r（儿化）</button>
            <button class="popover-option" @click="setErhua('char')">儿单独注音（非儿化）</button>
          </template>
        </div>
      </div>
      <div v-if="popoverVisible" class="popover-backdrop" @click="closePopover"></div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const expanded = ref(false)
const settingsExpanded = ref(false)
const inputText = ref('')
const previewContent = ref('')
const previewRef = ref(null)

const fontSize = ref(28)
const chineseFont = ref("'KaiTi','STKaiti','楷体','Kaiti SC',serif")
const phoneticMode = ref('py')
const positionMode = ref('h')
const charGap = ref(2)
const lineHeightNum = ref(23)
const paraGap = ref(12)
const showPhonetics = ref(true)
const highlightTricky = ref(false)
const toneSandhi = ref(true)
const erhuaMode = ref('char')

const popoverVisible = ref(false)
const popoverX = ref(0)
const popoverY = ref(0)
const popoverChar = ref('')
const popoverOptions = ref([])
const popoverCurrent = ref('')
const popoverIndex = ref(-1)
const isErhua = ref(false)

const popoverRef = ref(null)
const inputRef = ref(null)

const charCount = computed(() => inputText.value.replace(/\s/g, '').length)
const lineHeight = computed(() => (lineHeightNum.value / 10).toFixed(1))

const HAN_RE = /[㐀-䶿一-鿿豈-﫿]/
const TRICKY_CHARS = new Set(['的', '地', '得', '了', '着', '吗', '呢', '吧', '啊', '呀', '啦', '哇', '子', '头', '们', '么', '一', '不', '长', '行', '都', '只', '为', '还', '和'])
const PARTICLE = { '地': 'de', '得': 'de', '着': 'zhe', '了': 'le', '们': 'men', '头': 'tou', '么': 'me', '呢': 'ne', '吧': 'ba', '吗': 'ma', '呀': 'ya', '啦': 'la' }

const engineLoaded = ref(false)
const engineLoading = ref(false)
const pinyinLib = ref(null)

// Zhuyin conversion tables (matching plus.html)
const ZY_INITIALS = {
  '': '　', 'b': 'ㄅ', 'p': 'ㄆ', 'm': 'ㄇ', 'f': 'ㄈ',
  'd': 'ㄉ', 't': 'ㄊ', 'n': 'ㄋ', 'l': 'ㄌ',
  'g': 'ㄍ', 'k': 'ㄎ', 'h': 'ㄏ',
  'j': 'ㄐ', 'q': 'ㄑ', 'x': 'ㄒ',
  'zh': 'ㄓ', 'ch': 'ㄔ', 'sh': 'ㄕ', 'r': 'ㄖ',
  'z': 'ㄗ', 'c': 'ㄘ', 's': 'ㄙ',
  'y': 'ㄧ', 'w': 'ㄨ'
}

const ZY_FINALS = {
  'a': 'ㄚ', 'o': 'ㄛ', 'e': 'ㄜ', 'ê': 'ㄝ', 'i': 'ㄧ', 'u': 'ㄨ', 'ü': 'ㄩ',
  'ai': 'ㄞ', 'ei': 'ㄟ', 'ao': 'ㄠ', 'ou': 'ㄡ',
  'an': 'ㄢ', 'en': 'ㄣ', 'ang': 'ㄤ', 'eng': 'ㄥ', 'er': 'ㄦ',
  'ia': 'ㄧㄚ', 'ie': 'ㄧㄝ', 'iao': 'ㄧㄠ', 'iu': 'ㄧㄡ', 'ian': 'ㄧㄢ', 'in': 'ㄧㄣ', 'iang': 'ㄧㄤ', 'ing': 'ㄧㄥ',
  'ua': 'ㄨㄚ', 'uo': 'ㄨㄛ', 'uai': 'ㄨㄞ', 'ui': 'ㄨㄟ', 'uan': 'ㄨㄢ', 'un': 'ㄨㄣ', 'uang': 'ㄨㄤ', 'ong': 'ㄨㄥ',
  'üan': 'ㄩㄢ', 'üe': 'ㄩㄝ', 'ün': 'ㄩㄣ'
}

// Tone marks: [1, 2, 3, 4, 5(silent)] -> ˙ (light dot)
const TONE_MARKS = ['', '˙', 'ˊ', 'ˇ', 'ˋ', '']

function pinyinToZhuyin(pinyin) {
  if (!pinyin || pinyin === ' ') return pinyin
  // Handle erhua marker
  pinyin = pinyin.replace(/r$/, '')

  // Extract tone (last character if digit 1-5)
  let tone = 5
  let base = pinyin
  const toneMatch = pinyin.match(/(\d)$/)
  if (toneMatch) {
    tone = parseInt(toneMatch[1])
    base = pinyin.slice(0, -1)
  }

  // Remove special characters
  base = base.replace(/[．・]/g, '')

  // Handle "ü" variations
  base = base.replace(/ü/g, 'v').replace(/v/g, 'ü')

  // Match initial + final
  let initial = '', remainder = base
  const initials = Object.keys(ZY_INITIALS).sort((a, b) => b.length - a.length)
  for (const inl of initials) {
    if (base.startsWith(inl) && inl.length > initial.length) {
      initial = inl
      remainder = base.slice(inl.length)
    }
  }

  const zyInitial = ZY_INITIALS[initial] || ''
  let zyFinal = ''

  // Handle finals - check multi-char first
  const finals = Object.keys(ZY_FINALS).sort((a, b) => b.length - a.length)
  for (const fin of finals) {
    if (remainder === fin) {
      zyFinal = ZY_FINALS[fin]
      break
    }
  }

  if (!zyFinal) {
    // Try single char finals
    for (const fin of finals) {
      if (remainder.startsWith(fin)) {
        zyFinal = ZY_FINALS[fin]
        break
      }
    }
  }

  if (!zyFinal) {
    zyFinal = '　'
  }

  // Combine with tone mark
  const toneMark = TONE_MARKS[tone] || ''

  return zyInitial + zyFinal + toneMark
}

function convertToZhuyin(html) {
  // Convert pinyin HTML to zhuyin format
  return html.replace(/<rt[^>]*>([^<]*)<\/rt>/g, (match, pinyin) => {
    const zhuyin = pinyinToZhuyin(pinyin.trim())
    return `<rt>${zhuyin}</rt>`
  })
}

const previewClasses = computed(() => {
  const cls = []
  if (!showPhonetics.value) cls.push('no-show-pinyin')
  if (phoneticMode.value === 'zy') cls.push('zy-on')
  if (positionMode.value === 'v') cls.push('zy-dir-v')
  return cls.join(' ')
})

const previewStyles = computed(() => ({
  fontSize: fontSize.value + 'px',
  lineHeight: lineHeight.value,
  fontFamily: chineseFont.value,
  '--char-gap': charGap.value + 'px',
  '--para-gap': paraGap.value + 'px',
  '--py-font': chineseFont.value,
  '--accent-dark': '#d97706',
  '--accent-light': '#fef3c7'
}))

function isChinese(c) { return HAN_RE.test(c) }

function setPhoneticMode(mode) {
  if (phoneticMode.value === mode) return
  phoneticMode.value = mode
  if (mode === 'zy') positionMode.value = 'h'  // Reset position when switching to zhuyin
  if (engineLoaded.value) renderPreview()
}

function setPositionMode(mode) {
  if (positionMode.value === mode) return
  positionMode.value = mode
  if (engineLoaded.value) renderPreview()
}

async function loadEngine() {
  if (engineLoaded.value || engineLoading.value) return
  engineLoading.value = true
  try {
    let cachedCode = null
    try {
      const cached = localStorage.getItem('py-engine-cache')
      if (cached) {
        const data = JSON.parse(cached)
        if (data?.code) cachedCode = data.code
      }
    } catch (e) {}

    if (cachedCode) {
      const s = document.createElement('script')
      s.textContent = cachedCode
      document.head.appendChild(s)
      await waitForPinyinPro()
    } else {
      await new Promise((res, rej) => {
        const s = document.createElement('script')
        s.src = 'https://cdn.jsdelivr.net/npm/pinyin-pro@3.18.2/dist/index.js'
        s.onload = res
        s.onerror = rej
        document.head.appendChild(s)
      })
      await waitForPinyinPro()
    }
    engineLoaded.value = true
    if (inputText.value.trim()) renderPreview()
  } catch (e) {
    console.error('Failed to load:', e)
  } finally {
    engineLoading.value = false
  }
}

function waitForPinyinPro() {
  return new Promise(resolve => {
    const check = () => {
      if (window.pinyinPro) { pinyinLib.value = window.pinyinPro; resolve() }
      else setTimeout(check, 50)
    }
    check()
  })
}

function handleInput() {
  if (!engineLoaded.value) {
    if (!engineLoading.value) loadEngine()
    return
  }
  renderPreview()
}

function renderPreview() {
  const text = inputText.value.trim()
  if (!text || !engineLoaded.value || !pinyinLib.value) {
    previewContent.value = ''
    return
  }
  try {
    const paras = text.split('\n')
    const parts = []
    let offset = 0
    for (const par of paras) {
      if (par.trim()) {
        let html = pinyinLib.value.html(par, { toneSandhi: toneSandhi.value })
        html = processHtml(html, par, offset)
        // Convert to zhuyin if in zy mode
        if (phoneticMode.value === 'zy') {
          html = convertToZhuyin(html)
        }
        parts.push('<p>' + html + '</p>')
      } else {
        parts.push('<p>&nbsp;</p>')
      }
      offset += par.length + 1
    }
    previewContent.value = parts.join('')
  } catch (e) {
    console.error('Error:', e)
    previewContent.value = '<p>' + escapeHtml(text) + '</p>'
  }
}

function processHtml(html, text, offset) {
  const regex = /<span class="py-result-item">([\s\S]*?)<\/ruby><\/span>/g
  let result = html
  let pos = offset
  let match
  while ((match = regex.exec(html)) !== null) {
    const full = match[0]
    const chMatch = full.match(/>([㐀-䶿一-鿿豈-﫿])</)
    if (!chMatch) continue
    const char = chMatch[1]
    const idx = text.indexOf(char, pos)
    const absIdx = idx >= 0 ? idx : pos
    let cls = 'py-result-item'
    if (highlightTricky.value && TRICKY_CHARS.has(char)) cls += ' hi'
    const newSpan = full.replace('class="py-result-item"', `class="${cls}" data-ci="${absIdx}"`)
    result = result.replace(full, newSpan)
    pos = absIdx + char.length
  }
  return result
}

function handlePreviewClick(e) {
  const span = e.target.closest('.py-result-item')
  if (!span) { closePopover(); return }
  const ci = span.getAttribute('data-ci')
  if (ci === null) { closePopover(); return }
  const idx = parseInt(ci, 10)
  const text = inputText.value.replace(/\r\n?/g, '\n')
  const char = text[idx] || ''
  if (!char || !isChinese(char)) { closePopover(); return }
  const rt = span.querySelector('rt')
  const current = rt ? rt.textContent : ''
  const opts = getOptions(text, idx, char, current)
  showPopover(e, char, opts, current, idx)
}

function getOptions(text, idx, char, current) {
  const opts = new Set()
  if (current) opts.add(current)
  try {
    const poly = pinyinLib.value.polyphonic(text)
    if (poly?.[idx]) poly[idx].split(/\s+/).filter(Boolean).forEach(a => opts.add(a))
  } catch (e) {}
  if (PARTICLE[char]) opts.add(PARTICLE[char])
  if (char === '一') ['yī', 'yí', 'yì'].forEach(r => opts.add(r))
  if (char === '不') ['bù', 'bú'].forEach(r => opts.add(r))
  return Array.from(opts)
}

function showPopover(e, char, opts, current, idx) {
  const fullText = inputText.value.replace(/\r\n?/g, '\n')
  popoverChar.value = char
  popoverOptions.value = opts
  popoverCurrent.value = current
  popoverIndex.value = idx
  isErhua.value = char === '儿' && idx > 0 && isChinese(fullText[idx - 1])
  const rect = e.target.getBoundingClientRect()
  const popoverW = 150
  const popoverH = 200
  let x = rect.left + rect.width / 2
  let y = rect.top - 5
  if (x - popoverW / 2 < 10) x = popoverW / 2 + 10
  if (x + popoverW / 2 > window.innerWidth - 10) x = window.innerWidth - popoverW / 2 - 10
  if (y - popoverH < 0) y = rect.bottom + 10
  popoverX.value = x
  popoverY.value = y
  popoverVisible.value = true
}

function closePopover() {
  popoverVisible.value = false
}

function selectPinyin(option) {
  if (popoverIndex.value < 0) return
  const spans = previewRef.value?.querySelectorAll('.py-result-item')
  if (!spans) return
  for (const span of spans) {
    if (span.getAttribute('data-ci') === String(popoverIndex.value)) {
      const rt = span.querySelector('rt')
      if (rt) {
        rt.textContent = option
        span.classList.add('fixed')
      }
      break
    }
  }
  closePopover()
}

function setErhua(mode) {
  if (popoverIndex.value < 0) return
  const spans = previewRef.value?.querySelectorAll('.py-result-item')
  if (!spans) return
  const allSpans = Array.from(spans)
  const idx = allSpans.findIndex(s => s.getAttribute('data-ci') === String(popoverIndex.value))
  if (mode === 'merge' && idx > 0) {
    const prev = allSpans[idx - 1]
    const rt = prev.querySelector('rt')
    if (rt && !rt.textContent.endsWith('r')) {
      rt.textContent += 'r'
      prev.classList.add('erh-mark', 'fixed')
    }
  }
  if (idx >= 0) allSpans[idx].classList.add('erh-mark', 'fixed')
  closePopover()
}

function escapeHtml(t) {
  return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function clearInput() {
  inputText.value = ''
  previewContent.value = ''
  closePopover()
  inputRef.value?.focus()
}

function handleKeydown(e) {
  if (e.key === 'Escape') closePopover()
}

function handleClickOutside(e) {
  if (popoverVisible.value && popoverRef.value && !popoverRef.value.contains(e.target)) {
    closePopover()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('click', handleClickOutside, true)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('click', handleClickOutside, true)
})
</script>

<style scoped>
.pinyin-annotator {
  @apply p-5 bg-white rounded-2xl shadow-lg border border-gray-100;
}

/* Preview container - matches plus.html #preview */
.py-preview {
  padding: 20px 24px;
  min-height: 120px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  background: #faf8f5;
  border-radius: 8px;
}

/* Empty tip - matches plus.html */
:deep(.empty-tip) {
  color: #b9b2a3;
  text-align: center;
  padding-top: 150px;
  font-size: 16px;
}

/* Paragraphs - matches plus.html */
:deep(.py-content p) {
  margin-bottom: var(--para-gap);
  line-height: inherit;
}

:deep(.py-content p:last-child) {
  margin-bottom: 0;
}

/* Ruby elements - matches plus.html */
:deep(.py-content ruby) {
  display: ruby;
}

:deep(.py-content rt) {
  font-size: 0.42em;
  letter-spacing: 0.5px;
  color: #6b6558;
  font-family: var(--py-font), serif;
  user-select: none;
  text-align: center;
}

:deep(.py-content .py-pinyin-item) {
  font-family: var(--py-font), serif;
  color: #6b6558;
}

/* Result items - matches plus.html */
:deep(.py-content .py-result-item) {
  display: inline;
  margin: 0 var(--char-gap);
  cursor: pointer;
}

:deep(.py-content .py-result-item:hover .py-chinese-item) {
  background: var(--accent-light, #fef3c7);
}

:deep(.py-content .py-chinese-item) {
  display: inline;
  padding: 0 0.5px;
  border-radius: 3px;
}

/* Hi - highlight tricky characters - matches plus.html */
:deep(.py-content .py-result-item.hi .py-chinese-item) {
  background: #ffedbc;
  border-radius: 3px;
}

/* Fixed - manually set pinyin - matches plus.html */
:deep(.py-content .py-result-item.fixed .py-pinyin-item) {
  color: var(--accent-dark, #d97706);
  font-weight: 500;
}

/* Erh-mark - erhua - matches plus.html */
:deep(.py-content .py-result-item.erh-mark .py-chinese-item) {
  background: var(--accent-light, #fef3c7);
  border-radius: 3px;
}

/* No show pinyin - matches plus.html */
.no-show-pinyin :deep(rt),
.no-show-pinyin :deep(rp) {
  display: none;
}

.no-show-pinyin :deep(ruby) {
  display: inline;
}

/* Zhuyin mode - matches plus.html body.zy-on */
/* The zy-on class changes the font for zhuyin characters */
.zy-on :deep(rt) {
  font-family: "BpmfSubset", "Bopomofo", "Noto Sans TC", "Microsoft JhengHei", "PingFang TC", sans-serif;
}

/* Vertical mode - matches plus.html body.zy-dir-v */
/* Uses ruby-position: inter-character for zhuyin vertical or pinyin on right */
.zy-dir-v :deep(ruby) {
  ruby-position: inter-character;
  -webkit-ruby-position: inter-character;
}

.zy-dir-v :deep(rt) {
  ruby-position: inter-character;
  -webkit-ruby-position: inter-character;
}

/* Fallback for browsers that don't support inter-character */
@supports not (-webkit-ruby-position: inter-character) {
  .zy-dir-v :deep(ruby) {
    display: inline-flex;
    align-items: center;
  }

  .zy-dir-v :deep(rt) {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 0.42em;
  }
}

/* Popover */
.pinyin-popover {
  position: fixed;
  z-index: 1000;
  background: white;
  border: 1px solid #e5e0d5;
  border-radius: 10px;
  box-shadow: 0 4px 18px rgba(90, 70, 40, 0.14);
  padding: 10px;
  min-width: 132px;
  transform: translate(-50%, -100%);
}

.popover-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

.popover-header {
  font-size: 12px;
  color: #a89f8d;
  margin-bottom: 6px;
}

.popover-char {
  color: #1e1a12;
  font-size: 18px;
  margin-right: 6px;
}

.popover-options {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.popover-option {
  text-align: left;
  padding: 6px 10px;
  font-size: 14px;
  border-radius: 6px;
  border: none;
  background: white;
  cursor: pointer;
  font-family: inherit;
}

.popover-option:hover {
  background: #fef3c7;
}

.popover-option.current {
  background: #fef3c7;
  color: #d97706;
  font-weight: 500;
}
</style>