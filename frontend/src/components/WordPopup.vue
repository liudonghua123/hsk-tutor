<template>
  <Teleport to="body">
    <Transition name="popup">
      <div
        v-if="visible"
        ref="popupRef"
        class="fixed bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-[9999] max-w-sm w-[280px]"
        :style="{ left: position.x + 'px', top: position.y + 'px' }"
        @click.stop
      >
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-base font-bold text-gray-800">{{ title }}</h4>
          <button @click="$emit('close')" class="p-1 hover:bg-gray-100 rounded-full">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <!-- Action buttons -->
        <div class="flex items-center gap-2 mb-3">
          <button @click="$emit('play-tts', title)" class="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 text-sm rounded-full transition-colors">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            <span>TTS</span>
          </button>
          <button @click="$emit('translate', title)" class="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-sm rounded-full transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
            <span>翻译</span>
          </button>
        </div>
        <!-- Translation result -->
        <div v-if="translation" class="mb-3 p-3 bg-purple-50 rounded-xl">
          <p class="text-purple-700 text-sm">{{ translation }}</p>
        </div>
        <!-- Content -->
        <div v-if="loading" class="text-gray-400 text-sm">加载中...</div>
        <div v-else-if="content" class="text-gray-600 text-sm leading-relaxed">
          <p>{{ content }}</p>
        </div>
        <div v-else class="text-gray-400 text-sm">暂无释义</div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '' },
  content: { type: String, default: '' },
  translation: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  position: { type: Object, default: () => ({ x: 0, y: 0 }) }
})

const emit = defineEmits(['close', 'play-tts', 'translate'])

const popupRef = ref(null)

// Adjust position to stay within viewport
function adjustPosition(pos) {
  const popupWidth = 300
  const popupHeight = 200
  let x = pos.x
  let y = pos.y

  // Ensure horizontal bounds
  if (x + popupWidth > window.innerWidth - 10) {
    x = window.innerWidth - popupWidth - 10
  }
  if (x < 10) x = 10

  // Ensure vertical bounds - prefer above if not enough space below
  if (y + popupHeight > window.innerHeight - 10) {
    // Try to show above
    const aboveY = pos.y - popupHeight - 20
    if (aboveY > 10) {
      y = aboveY
    } else {
      y = window.innerHeight - popupHeight - 10
    }
  }
  if (y < 10) y = 10

  return { x, y }
}

// Watch for position changes and adjust
watch(() => props.position, (newPos) => {
  if (newPos && props.visible) {
    const adjusted = adjustPosition(newPos)
    // Update via event
    emit('update:position', adjusted)
  }
}, { deep: true })
</script>

<style scoped>
.popup-enter-active,
.popup-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.popup-enter-from,
.popup-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>