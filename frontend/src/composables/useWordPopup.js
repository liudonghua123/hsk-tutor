import { ref, onMounted, onUnmounted } from 'vue'

export function useWordPopup() {
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

  // Fetch explanation from API
  async function fetchExplain(text) {
    if (!text) return ''
    try {
      const response = await fetch(`https://omni-gen.app.ynu.edu.cn/explain/${encodeURIComponent(text)}`)
      if (!response.ok) throw new Error('Failed to fetch')
      return await response.text()
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
    const url = `https://omni-gen.app.ynu.edu.cn/tts/${encodeURIComponent(text)}.mp3`
    const audio = new Audio(url)
    audio.play().catch(e => console.error('TTS error:', e))
  }

  // Translate text
  async function translateText(text) {
    if (!text) return
    popupTranslation.value = '翻译中...'
    try {
      const response = await fetch('https://omni-gen.app.ynu.edu.cn/api/v1/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text })
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
      const popupEl = document.querySelector('.fixed.z-\\[9999\\]')
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

  onMounted(() => {
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