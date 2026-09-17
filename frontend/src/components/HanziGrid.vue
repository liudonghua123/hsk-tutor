<template>
  <div class="grid gap-6">
    <!-- Hanzi Card -->
    <div class="hanzi-grid">
      <div
        v-for="char in hanzi"
        :key="char.word"
        class="hanzi-char card-hover"
        :class="{ favorited: isFavorited(char.word) }"
        @click="$emit('select', char.word)"
      >
        {{ char.word }}
      </div>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="hanzi-grid">
      <div v-for="i in 20" :key="i" class="skeleton h-16 w-full"></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  hanzi: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  favorites: {
    type: Array,
    default: () => []
  }
})

defineEmits(['select'])

function isFavorited(word) {
  // This would be handled by the parent component
  return false
}
</script>