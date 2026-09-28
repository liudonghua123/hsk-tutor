import { ref, onMounted, onUnmounted } from 'vue'
import { useConfigStore } from '../stores/config'

export function useWordPopup() {
  const configStore = useConfigStore()

  const showPopup = ref(false)
  const popupTitle = ref('')
  const popupContent = ref('')
  const popupTranslation = ref('')
  const popupLoading = ref(false)
  const popupPosition = ref({ x: 0, y: 0 })
  const popupRef = ref(null)

  // Show popup near click/touch position
  function showPopupAt(text, event, content = '') {
    popupTitle.value = text
    popupContent.value = content
    popupTranslation.value = ''
    popupLoading.value = true

    // Get position from event
    const clientX = event.clientX ?? event.touches?.[0]?.clientX ?? event.pageX
    const clientY = event.clientY ?? event.touches?.[0]?.clientY ?? event.pageY

    const x = Math.min(clientX + 15, window.innerWidth - 320)
    const y = Math.min(clientY + 15, window.innerHeight - 200)

    popupPosition.value = { x: Math.max(10, x), y: Math.max(10, y) }
    showPopup.value = true

    // Auto-play TTS and load explanation
    if (text) {
      playTTS(text)
      loadExplanation(text)
      translateText(text)
    }
  }

  // Fetch explanation from API using configured prompt
  async function fetchExplain(text) {
    if (!text) return ''

    // Get the prompt template from config
    const promptTemplate = configStore.wordPrompt
    const prompt = promptTemplate.replace('{content}', text)

    try {
      const response = await fetch(configStore.getEndpoint('/api/v1/explain'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: text,
          prompt: prompt
        })
      })
      if (!response.ok) throw new Error('Failed to fetch')
      const text_response = await response.text()
      // Try to parse as JSON and extract explained_text
      try {
        const json = JSON.parse(text_response)
        return json.explained_text || json.explanation || json.definition || text_response
      } catch {
        return text_response
      }
    } catch (e) {
      console.error('Explain error:', e)
      return '获取释义失败'
    }
  }

  // Load explanation and update popup
  async function loadExplanation(text) {
    popupContent.value = ''
    popupLoading.value = true
    popupContent.value = await fetchExplain(text)
    popupLoading.value = false
  }

  // Play TTS
  function playTTS(text) {
    if (!text) return
    const url = configStore.getEndpoint(`/tts/${encodeURIComponent(text)}.mp3`)
    const audio = new Audio(url)
    audio.play().catch(e => console.error('TTS error:', e))
  }

  // Translate text using configurable prompt
  async function translateText(text, targetLang = 'English') {
    if (!text) return
    popupTranslation.value = '翻译中...'
    try {
      const prompt = configStore.buildTranslatePrompt(text, targetLang)
      const response = await fetch(configStore.getEndpoint('/api/v1/translate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text, prompt: prompt })
      })
      const result = await response.json()
      popupTranslation.value = result.translated_text || result.translation || '暂无翻译'
    } catch (e) {
      popupTranslation.value = '翻译失败'
      console.error('Translate error:', e)
    }
  }

  // Close popup
  function closePopup() {
    showPopup.value = false
  }

  // Handle click outside - use setTimeout to allow event to propagate to popup first
  let clickTimeout = null
  function handleClickOutside(event) {
    // Use setTimeout to ensure the click event has propagated
    if (clickTimeout) clearTimeout(clickTimeout)
    clickTimeout = setTimeout(() => {
      if (!showPopup.value) return
      const popupEl = document.querySelector('.fixed.z-\[9999\]')
      if (popupEl && !popupEl.contains(event.target)) {
        const target = event.target
        if (!target.closest('.word-item') && !target.closest('.idiom-item') && !target.closest('.xhy-item') && !target.closest('.grammar-clickable')) {
          showPopup.value = false
        }
      }
    }, 10)
  }

  // Handle escape key
  function handleEscapeKey(event) {
    if (event.key === 'Escape') {
      showPopup.value = false
    }
  }

  onMounted(async () => {
    // Fetch configs if not initialized
    if (!configStore.initialized) {
      await configStore.fetchConfigs()
    }

    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleEscapeKey)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
    document.removeEventListener('keydown', handleEscapeKey)
  })

  return {
    showPopup,
    popupTitle,
    popupContent,
    popupTranslation,
    popupLoading,
    popupPosition,
    popupRef,
    showPopupAt,
    loadExplanation,
    playTTS,
    translateText,
    closePopup
  }
}