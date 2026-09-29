import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useApiStore } from './api'

const DEFAULT_CONFIG = {
  OMNI_GEN_BASE_URL: 'https://omni-gen.app.ynu.edu.cn',
  NEEDLE_MODEL: 'needle2',
  EXPLAIN_WORD_PROMPT: '请解释以下中文词语、成语或歇后语，包括其中文含义、英文翻译、以及在句子中的用法示例。注意只输出解释内容，不要有其他说明：\n\n{content}',
  EXPLAIN_GRAMMAR_PROMPT: `你是一位资深 HSK 汉语语法教师。请根据以下语法点，为 HSK 学习者生成一份结构化学习卡片。

【语法点】
{content}

【输出要求】
严格输出 JSON，不要任何额外文字、markdown 代码块标记或解释。字段如下：

{
  "grammar_point": "语法内容原文",
  "category": "类别名称",
  "level": "建议HSK等级",
  "definition": "一句话定义",
  "structure": [],
  "rules": [],
  "examples": [],
  "common_mistakes": [],
  "practice": [],
  "related_points": []
}`,
  TRANSLATE_PROMPT: 'Translate the following text into {target_lang}. Note that you should only output the translated result without any additional explanation:\n\n{content}',
  PRACTISE_PROMPT: `你是一个专业的习题生成专家。请根据以下主题生成习题。

主题：{topic}
题目数量：{count}
题目类型：{types}

请严格按照以下JSON格式返回，不要包含任何其他内容。`
}

export const useConfigStore = defineStore('config', () => {
  // Use a plain reactive object for configs
  const configsMap = ref({})

  // Computed getters for each config
  const baseUrl = computed(() => configsMap.value.OMNI_GEN_BASE_URL || DEFAULT_CONFIG.OMNI_GEN_BASE_URL)
  const needleModel = computed(() => configsMap.value.NEEDLE_MODEL || DEFAULT_CONFIG.NEEDLE_MODEL)
  const wordPrompt = computed(() => configsMap.value.EXPLAIN_WORD_PROMPT || DEFAULT_CONFIG.EXPLAIN_WORD_PROMPT)
  const grammarPrompt = computed(() => configsMap.value.EXPLAIN_GRAMMAR_PROMPT || DEFAULT_CONFIG.EXPLAIN_GRAMMAR_PROMPT)
  const translatePrompt = computed(() => configsMap.value.TRANSLATE_PROMPT || DEFAULT_CONFIG.TRANSLATE_PROMPT)
  const practisePrompt = computed(() => configsMap.value.PRACTISE_PROMPT || DEFAULT_CONFIG.PRACTISE_PROMPT)

  const loading = ref(false)
  const initialized = ref(false)

  // Fetch all configs from backend
  async function fetchConfigs() {
    loading.value = true
    try {
      const apiStore = useApiStore()
      const data = await apiStore.fetchConfigs()

      // Update configs map
      const newMap = {}
      data.forEach(item => {
        if (item.key in DEFAULT_CONFIG) {
          newMap[item.key] = item.value || DEFAULT_CONFIG[item.key]
        }
      })

      // Use $patch for proper reactivity
      Object.assign(configsMap.value, newMap)
      initialized.value = true
    } catch (e) {
      console.error('Failed to fetch configs:', e)
      // Use default values
    } finally {
      loading.value = false
    }
  }

  // Update a single config value
  function updateConfigValue(key, value) {
    if (key in DEFAULT_CONFIG) {
      configsMap.value[key] = value
    }
  }

  // Get a specific config value
  function get(key) {
    return configsMap.value[key] || DEFAULT_CONFIG[key]
  }

  // Get API endpoints with base URL
  function getEndpoint(path) {
    return `${baseUrl.value}${path}`
  }

  // Build practise prompt with variables
  function buildPractisePrompt(topic, count, types) {
    return practisePrompt.value
      .replace('{topic}', topic)
      .replace('{count}', String(count))
      .replace('{types}', Array.isArray(types) ? types.join(', ') : types)
  }

  // Build translate prompt with variables
  function buildTranslatePrompt(content, targetLang = 'English') {
    return translatePrompt.value
      .replace('{target_lang}', targetLang)
      .replace('{content}', content)
  }

  return {
    configsMap,
    loading,
    initialized,
    baseUrl,
    needleModel,
    wordPrompt,
    grammarPrompt,
    translatePrompt,
    practisePrompt,
    fetchConfigs,
    updateConfigValue,
    get,
    getEndpoint,
    buildPractisePrompt,
    buildTranslatePrompt
  }
})