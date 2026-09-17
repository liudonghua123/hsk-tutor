<template>
  <div class="container-custom py-6">
    <!-- Header -->
    <div class="flex items-center gap-4 mb-6">
      <div class="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center text-white text-xl shadow-md">
        ✍️
      </div>
      <div>
        <h1 class="text-2xl font-bold text-gray-800">书写练习 / Write</h1>
        <p class="text-sm text-gray-500">使用 HanziWriter 练习汉字书写 / Practice Chinese character writing</p>
      </div>
    </div>

    <!-- Level Selection (when no level selected) -->
    <div v-if="!currentLevel">
      <div class="card mb-4">
        <h2 class="text-lg font-semibold text-gray-700 mb-4">选择 HSK 级别 / Select Level</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <router-link
            v-for="level in levels"
            :key="level.level"
            :to="`/write/${level.level}`"
            class="p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl text-center hover:shadow-lg transition-all hover:-translate-y-1"
          >
            <div class="text-xl font-bold text-purple-600 mb-1">
              {{ formatLevel(level.level) }}
            </div>
            <div class="text-sm text-gray-500">{{ level.count }} chars</div>
          </router-link>
        </div>
      </div>

      <!-- Favorites quick access -->
      <router-link to="/favorites" class="block card card-hover bg-gradient-to-r from-amber-50 to-orange-50">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-2xl">❤️</span>
            <div>
              <h3 class="font-semibold text-gray-800">我的收藏 / Favorites</h3>
              <p class="text-sm text-gray-500">View favorited characters</p>
            </div>
          </div>
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </router-link>
    </div>

    <!-- Level Content (when level selected) -->
    <div v-else>
      <!-- Breadcrumb Navigation -->
      <nav class="flex items-center gap-2 text-sm mb-6 flex-wrap">
        <router-link
          :to="`/write`"
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-gray-600 hover:text-purple-600 hover:bg-purple-50"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          书写 / Write
        </router-link>
        <span class="text-gray-400">/</span>
        <span class="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-600 font-semibold">{{ formatLevel(currentLevel) }}</span>
      </nav>

      <!-- Loading -->
      <div v-if="loading" class="hanzi-grid">
        <div v-for="i in 30" :key="i" class="skeleton h-16 w-full"></div>
      </div>

      <!-- Hanzi Grid -->
      <div v-else>
        <div class="flex items-center justify-between mb-4">
          <p class="text-gray-600">{{ hanziList.length }} chars</p>
          <router-link
            to="/write"
            class="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-purple-50 hover:to-purple-100 border border-gray-200 hover:border-purple-200 rounded-xl text-gray-700 hover:text-purple-700 transition-all duration-300 shadow-sm hover:shadow-md text-sm font-medium"
          >
            <svg class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            返回 / Back
          </router-link>
        </div>
        <div class="hanzi-grid">
          <router-link
            v-for="char in hanziList"
            :key="char.word"
            :to="`/word/${char.word}?type=write&level=${currentLevel}`"
            class="hanzi-char card-hover"
            :class="{ favorited: isFavorited(char.word), visited: isVisited(char.word) }"
          >
            {{ char.word }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useApiStore } from '../stores/api'
import { useUserStore } from '../stores/user'

const route = useRoute()
const apiStore = useApiStore()
const userStore = useUserStore()

const hanziList = ref([])
const levels = ref([])
const loading = ref(false)

const currentLevel = computed(() => route.params.level || null)

function formatLevel(level) {
  if (!level) return ''
  return level.replace('hsk', 'HSK ').replace('-', ' ')
}

function isFavorited(word) {
  return userStore.isFavorited('handwritten', word)
}

function isVisited(word) {
  return userStore.isVisited('handwritten', word)
}

async function fetchLevels() {
  try {
    levels.value = await apiStore.fetchHandwrittenLevels()
  } catch (error) {
    console.error('Failed to fetch levels:', error)
  }
}

async function fetchHanzi() {
  loading.value = true
  try {
    hanziList.value = await apiStore.fetchHandwrittenList(currentLevel.value)
  } catch (error) {
    console.error('Failed to fetch hanzi:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (currentLevel.value) {
    fetchHanzi()
  } else {
    fetchLevels()
  }
})

watch(currentLevel, (newLevel) => {
  if (newLevel) {
    fetchHanzi()
  } else {
    hanziList.value = []
    fetchLevels()
  }
})
</script>