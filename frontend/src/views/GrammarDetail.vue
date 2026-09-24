<template>
  <div class="container-custom py-6">
    <!-- Loading Skeleton -->
    <div v-if="loading" class="max-w-3xl mx-auto space-y-6">
      <!-- Fishbone Loading -->
      <div class="flex flex-col items-center py-12">
        <div class="relative">
          <!-- Fish skeleton -->
          <svg class="w-64 h-32" viewBox="0 0 256 64">
            <!-- Main spine -->
            <line x1="20" y1="32" x2="236" y2="32" stroke="#e2e8f0" stroke-width="3" stroke-linecap="round"/>
            <!-- Upper ribs -->
            <line x1="60" y1="32" x2="70" y2="8" stroke="#e2e8f0" stroke-width="2" stroke-linecap="round"/>
            <line x1="80" y1="32" x2="90" y2="8" stroke="#e2e8f0" stroke-width="2" stroke-linecap="round"/>
            <line x1="100" y1="32" x2="110" y2="12" stroke="#e2e8f0" stroke-width="2" stroke-linecap="round"/>
            <line x1="120" y1="32" x2="130" y2="8" stroke="#e2e8f0" stroke-width="2" stroke-linecap="round"/>
            <line x1="140" y1="32" x2="150" y2="12" stroke="#e2e8f0" stroke-width="2" stroke-linecap="round"/>
            <line x1="160" y1="32" x2="170" y2="8" stroke="#e2e8f0" stroke-width="2" stroke-linecap="round"/>
            <line x1="180" y1="32" x2="190" y2="12" stroke="#e2e8f0" stroke-width="2" stroke-linecap="round"/>
            <!-- Lower ribs -->
            <line x1="60" y1="32" x2="70" y2="56" stroke="#e2e8f0" stroke-width="2" stroke-linecap="round"/>
            <line x1="80" y1="32" x2="90" y2="56" stroke="#e2e8f0" stroke-width="2" stroke-linecap="round"/>
            <line x1="100" y1="32" x2="110" y2="52" stroke="#e2e8f0" stroke-width="2" stroke-linecap="round"/>
            <line x1="120" y1="32" x2="130" y2="56" stroke="#e2e8f0" stroke-width="2" stroke-linecap="round"/>
            <line x1="140" y1="32" x2="150" y2="52" stroke="#e2e8f0" stroke-width="2" stroke-linecap="round"/>
            <line x1="160" y1="32" x2="170" y2="56" stroke="#e2e8f0" stroke-width="2" stroke-linecap="round"/>
            <line x1="180" y1="32" x2="190" y2="52" stroke="#e2e8f0" stroke-width="2" stroke-linecap="round"/>
            <!-- Head -->
            <circle cx="16" cy="32" r="10" fill="#e2e8f0"/>
          </svg>
          <!-- Animated wave overlay -->
          <div class="absolute inset-0 flex items-center">
            <div class="h-1 bg-gradient-to-r from-green-200 via-green-400 to-green-200 rounded-full animate-pulse" style="width: 200px; margin-left: 28px;"></div>
          </div>
        </div>
        <p class="mt-6 text-gray-500">正在加载语法解析...</p>
      </div>

      <!-- Content skeleton -->
      <div class="card p-6 space-y-4">
        <div class="skeleton h-6 w-1/4"></div>
        <div class="skeleton h-8 w-2/3"></div>
        <div class="skeleton h-24 w-full"></div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="max-w-3xl mx-auto text-center py-12">
      <div class="card p-8">
        <svg class="w-16 h-16 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p class="text-red-500 mb-4">{{ error }}</p>
        <button @click="fetchExplanation" class="btn-primary px-5 py-2">重试</button>
      </div>
    </div>

    <!-- Grammar Detail Content -->
    <div v-else-if="grammarData" class="max-w-3xl mx-auto space-y-6">
      <!-- Breadcrumb Navigation -->
      <nav class="flex items-center gap-2 text-sm flex-wrap">
        <router-link
          to="/grammar"
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-gray-600 hover:text-green-600 hover:bg-green-50"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          语法 / Grammar
        </router-link>
        <span class="text-gray-400">/</span>
        <router-link
          :to="`/grammar/${level}`"
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-gray-600 hover:text-green-600 hover:bg-green-50"
        >
          {{ formatLevel(level) }}
        </router-link>
        <span class="text-gray-400">/</span>
        <span class="px-3 py-1.5 rounded-lg bg-green-50 text-green-600 font-semibold">{{ grammarItem.category_name }}</span>
      </nav>

      <!-- Header Card -->
      <div class="card p-6">
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <span class="badge badge-primary">{{ grammarData.level || level.toUpperCase() }}</span>
            <span class="badge badge-secondary">{{ grammarData.category }}</span>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="refreshExplanation"
              :disabled="refreshing"
              class="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="重新生成"
            >
              <svg class="w-6 h-6 text-gray-400 hover:text-gray-600" :class="{ 'animate-spin': refreshing }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              @click="toggleFavorite"
              class="p-2 rounded-full hover:bg-red-50 transition-colors"
              :class="isFavorited ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500'"
            >
              <svg class="w-6 h-6" :fill="isFavorited ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
        </div>

        <h1 class="text-3xl font-bold text-gray-800 mb-3">{{ grammarData.grammar_point }}</h1>
        <p class="text-lg text-gray-600">{{ grammarData.definition }}</p>
      </div>

      <!-- Structure Card -->
      <div v-if="grammarData.structure && grammarData.structure.length" class="card p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span class="w-1 h-5 bg-gradient-to-b from-green-500 to-teal-500 rounded-full"></span>
          结构 / Structure
        </h2>
        <div class="flex flex-wrap gap-3">
          <span
            v-for="(s, i) in grammarData.structure"
            :key="i"
            class="grammar-clickable px-4 py-2 bg-gradient-to-r from-green-50 to-teal-50 text-green-700 rounded-full font-medium cursor-pointer hover:from-green-100 hover:to-teal-100 transition-colors"
            @click="showWordPopupAt(s, $event)"
          >
            {{ s }}
          </span>
        </div>
      </div>

      <!-- Rules Card -->
      <div v-if="grammarData.rules && grammarData.rules.length" class="card p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span class="w-1 h-5 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></span>
          规则 / Rules
        </h2>
        <div class="space-y-4">
          <div
            v-for="(rule, i) in grammarData.rules"
            :key="i"
            class="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl"
          >
            <h3 class="font-semibold text-gray-800 mb-2">{{ i + 1 }}. {{ rule.title }}</h3>
            <p class="text-gray-600 mb-2">{{ rule.desc }}</p>
            <p v-if="rule.example" class="text-sm text-gray-500 italic bg-white/60 p-2 rounded-lg">
              {{ rule.example }}
            </p>
          </div>
        </div>
      </div>

      <!-- Examples Card -->
      <div v-if="grammarData.examples && grammarData.examples.length" class="card p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span class="w-1 h-5 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></span>
          例句 / Examples
        </h2>
        <div class="space-y-3">
          <div
            v-for="(ex, i) in grammarData.examples"
            :key="i"
            class="grammar-clickable p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl cursor-pointer hover:shadow-md transition-shadow"
            @click="showWordPopupAt(ex.cn, $event)"
          >
            <p class="text-lg text-gray-800 font-medium">{{ ex.cn }}</p>
            <p class="text-sm text-gray-500 mt-1">{{ ex.pinyin }}</p>
            <p class="text-sm text-gray-600 mt-1">{{ ex.en }}</p>
          </div>
        </div>
      </div>

      <!-- Common Mistakes Card -->
      <div v-if="grammarData.common_mistakes && grammarData.common_mistakes.length" class="card p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span class="w-1 h-5 bg-gradient-to-b from-red-500 to-pink-500 rounded-full"></span>
          常见错误 / Common Mistakes
        </h2>
        <div class="space-y-3">
          <div
            v-for="(mistake, i) in grammarData.common_mistakes"
            :key="i"
            class="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl"
          >
            <div class="flex items-center gap-3 mb-2 flex-wrap">
              <span class="grammar-clickable px-2 py-1 bg-red-100 text-red-700 rounded text-sm line-through cursor-pointer hover:bg-red-200" @click="showWordPopupAt(mistake.wrong, $event)">✗ {{ mistake.wrong }}</span>
              <span class="text-gray-400">→</span>
              <span class="grammar-clickable px-2 py-1 bg-green-100 text-green-700 rounded text-sm cursor-pointer hover:bg-green-200">✓ {{ mistake.right }}</span>
            </div>
            <p class="text-sm text-gray-600">{{ mistake.reason }}</p>
          </div>
        </div>
      </div>

      <!-- Practice Card -->
      <div v-if="grammarData.practice && grammarData.practice.length" class="card p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span class="w-1 h-5 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></span>
          练习 / Practice
        </h2>
        <div class="space-y-4">
          <div
            v-for="(p, i) in grammarData.practice"
            :key="i"
            class="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl"
          >
            <div class="flex items-center gap-2 mb-2">
              <span class="badge badge-secondary">{{ p.type }}</span>
            </div>
            <p class="text-gray-800 mb-2">{{ p.question }}</p>
            <details class="group">
              <summary class="cursor-pointer text-sm text-green-600 hover:text-green-700">
                <span class="group-open:hidden">显示答案</span>
                <span class="hidden group-open:inline">答案：</span>
              </summary>
              <p class="mt-2 p-2 bg-green-50 rounded text-green-700">{{ p.answer }}</p>
            </details>
          </div>
        </div>
      </div>

      <!-- Related Points Card -->
      <div v-if="grammarData.related_points && grammarData.related_points.length" class="card p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span class="w-1 h-5 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></span>
          相关语法点 / Related Points
        </h2>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="(rp, i) in grammarData.related_points"
            :key="i"
            class="grammar-clickable px-3 py-1.5 bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-700 rounded-full text-sm cursor-pointer hover:from-cyan-100 hover:to-blue-100 transition-colors"
            @click="showWordPopupAt(rp, $event)"
          >
            {{ rp }}
          </span>
        </div>
      </div>
    </div>

    <!-- Not Found -->
    <div v-else class="text-center py-12">
      <p class="text-gray-500">Grammar point not found</p>
      <router-link :to="`/grammar/${level}`" class="btn-primary mt-4 inline-block">返回 / Back</router-link>
    </div>

    <!-- Shared Word Popup Component -->
    <WordPopup
      :visible="showPopup"
      :title="popupTitle"
      :content="popupContent"
      :translation="popupTranslation"
      :loading="popupLoading"
      :position="popupPosition"
      @close="showPopup = false"
      @play-tts="playTTS"
      @translate="(text) => { translateText(text); loadExplanation(text) }"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import WordPopup from '../components/WordPopup.vue'
import { useWordPopup } from '../composables/useWordPopup'

const route = useRoute()
const userStore = useUserStore()

// Use the shared word popup composable
const { showPopup, popupTitle, popupContent, popupTranslation, popupLoading, popupPosition, showPopupAt, loadExplanation, playTTS, translateText } = useWordPopup()

const loading = ref(true)
const error = ref('')
const grammarData = ref(null)
const grammarItem = ref(null)
const refreshing = ref(false)

// Route params
const level = computed(() => route.params.level)
const itemId = computed(() => route.params.id)

const isFavorited = computed(() => {
  return userStore.isFavorited('grammar', String(itemId.value))
})

function formatLevel(lvl) {
  if (!lvl) return ''
  return lvl.replace('hsk', 'HSK ').replace('-', ' ')
}

function toggleFavorite() {
  userStore.toggleFavorite('grammar', String(itemId.value))
}

// Show word popup at click position
function showWordPopupAt(word, event) {
  showPopupAt(word, event)
  loadExplanation(word)
}

async function fetchExplanation() {
  if (!grammarItem.value) return

  loading.value = true
  error.value = ''
  grammarData.value = null

  // Build grammar content object
  const content = JSON.stringify({
    "类别": grammarItem.value.category,
    "类别名称": grammarItem.value.category_name,
    "细目": grammarItem.value.detail || '',
    "语法内容": grammarItem.value.content
  })

  const prompt = `你是一位资深 HSK 汉语语法教师。请根据以下语法点，为 HSK 学习者生成一份结构化学习卡片。

【语法点】
{content}

【输出要求】
严格输出 JSON，不要任何额外文字、markdown 代码块标记或解释。字段如下：

{
  "grammar_point": "语法内容原文，如'小—、第—'",
  "category": "类别名称，如'前缀'",
  "level": "建议HSK等级，取值HSK1-6",
  "definition": "一句话定义，控制在50字以内，语言通俗",
  "structure": [
    "结构公式1，用+连接，如'小 + 名词'",
    "结构公式2"
  ],
  "rules": [
    {
      "title": "规则小标题",
      "desc": "规则说明，80字以内，避免术语堆砌",
      "example": "配套短句，含拼音和英文翻译"
    }
  ],
  "examples": [
    {
      "cn": "中文例句",
      "pinyin": "带声调拼音",
      "en": "英文翻译"
    }
  ],
  "common_mistakes": [
    {
      "wrong": "错误表达",
      "right": "正确表达",
      "reason": "错误原因，40字以内"
    }
  ],
  "practice": [
    {
      "type": "填空|改错|造句|选择",
      "question": "题目描述",
      "answer": "参考答案"
    }
  ],
  "related_points": ["关联语法点1", "关联语法点2"]
}

【约束】
- rules 至少 2 条，不超过 4 条
- examples 至少 3 条，覆盖不同结构
- common_mistakes 至少 1 条，不超过 3 条
- practice 至少 2 题
- 所有例句必须符合 HSK 对应等级词汇范围
- 拼音使用带声调符号的标准拼音
- 不要输出 JSON 以外的任何内容`

  try {
    const response = await fetch('https://omni-gen.app.ynu.edu.cn/api/v1/explain', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: content,
        prompt: prompt
      })
    })

    const result = await response.json()

    if (result.success && result.explained_text) {
      // Parse the JSON string from explained_text
      const parsed = typeof result.explained_text === 'string'
        ? JSON.parse(result.explained_text)
        : result.explained_text
      grammarData.value = parsed
    } else {
      error.value = '生成语法解析失败，请重试'
    }
  } catch (e) {
    console.error('Explain error:', e)
    error.value = '网络错误，请检查网络连接'
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

async function refreshExplanation() {
  refreshing.value = true
  await fetchExplanationWithRefresh()
}

async function fetchExplanationWithRefresh() {
  if (!grammarItem.value) return

  loading.value = true
  error.value = ''
  grammarData.value = null

  // Build grammar content object
  const content = JSON.stringify({
    "类别": grammarItem.value.category,
    "类别名称": grammarItem.value.category_name,
    "细目": grammarItem.value.detail || '',
    "语法内容": grammarItem.value.content
  })

  const prompt = `你是一位资深 HSK 汉语语法教师。请根据以下语法点，为 HSK 学习者生成一份结构化学习卡片。

【语法点】
{content}

【输出要求】
严格输出 JSON，不要任何额外文字、markdown 代码块标记或解释。字段如下：

{
  "grammar_point": "语法内容原文，如'小—、第—'",
  "category": "类别名称，如'前缀'",
  "level": "建议HSK等级，取值HSK1-6",
  "definition": "一句话定义，控制在50字以内，语言通俗",
  "structure": [
    "结构公式1，用+连接，如'小 + 名词'",
    "结构公式2"
  ],
  "rules": [
    {
      "title": "规则小标题",
      "desc": "规则说明，80字以内，避免术语堆砌",
      "example": "配套短句，含拼音和英文翻译"
    }
  ],
  "examples": [
    {
      "cn": "中文例句",
      "pinyin": "带声调拼音",
      "en": "英文翻译"
    }
  ],
  "common_mistakes": [
    {
      "wrong": "错误表达",
      "right": "正确表达",
      "reason": "错误原因，40字以内"
    }
  ],
  "practice": [
    {
      "type": "填空|改错|造句|选择",
      "question": "题目描述",
      "answer": "参考答案"
    }
  ],
  "related_points": ["关联语法点1", "关联语法点2"]
}

【约束】
- rules 至少 2 条，不超过 4 条
- examples 至少 3 条，覆盖不同结构
- common_mistakes 至少 1 条，不超过 3 条
- practice 至少 2 题
- 所有例句必须符合 HSK 对应等级词汇范围
- 拼音使用带声调符号的标准拼音
- 不要输出 JSON 以外的任何内容`

  try {
    const response = await fetch('https://omni-gen.app.ynu.edu.cn/api/v1/explain', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: content,
        prompt: prompt,
        refresh: true
      })
    })

    const result = await response.json()

    if (result.success && result.explained_text) {
      // Parse the JSON string from explained_text
      const parsed = typeof result.explained_text === 'string'
        ? JSON.parse(result.explained_text)
        : result.explained_text
      grammarData.value = parsed
    } else {
      error.value = '生成语法解析失败，请重试'
    }
  } catch (e) {
    console.error('Explain error:', e)
    error.value = '网络错误，请检查网络连接'
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

async function fetchGrammarItem() {
  try {
    const response = await fetch(`/api/grammar/${encodeURIComponent(level.value)}/${encodeURIComponent(itemId.value)}`)
    if (!response.ok) throw new Error('Failed to fetch grammar item')
    grammarItem.value = await response.json()
  } catch (e) {
    console.error('Failed to fetch grammar item:', e)
    error.value = '加载失败'
  }
}

onMounted(async () => {
  await fetchGrammarItem()
  if (grammarItem.value) {
    userStore.markVisited('grammar', String(itemId.value))
    await fetchExplanation()
  } else {
    loading.value = false
  }
})

watch([level, itemId], async () => {
  if (level.value && itemId.value) {
    await fetchGrammarItem()
    if (grammarItem.value) {
      userStore.markVisited('grammar', String(itemId.value))
      await fetchExplanation()
    }
  }
})
</script>

<style scoped>
details summary::-webkit-details-marker {
  display: none;
}
</style>