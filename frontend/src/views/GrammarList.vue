<template>
  <div class="container-custom py-6">
    <!-- Header -->
    <div class="flex items-center gap-4 mb-6">
      <div class="w-12 h-12 bg-gradient-to-br from-green-400 to-teal-500 rounded-xl flex items-center justify-center text-white text-xl shadow-md">
        📝
      </div>
      <div>
        <h1 class="text-2xl font-bold text-gray-800">语法学习 / Grammar</h1>
        <p class="text-sm text-gray-500">学习 HSK 各级的语法知识点 / Learn HSK grammar points</p>
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
            :to="`/grammar/${level.level}`"
            class="p-5 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl text-center hover:shadow-lg transition-all hover:-translate-y-1"
          >
            <div class="text-xl font-bold text-green-600 mb-1">
              {{ formatLevel(level.level) }}
            </div>
            <div class="text-sm text-gray-500">{{ level.count }} items</div>
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
              <p class="text-sm text-gray-500">View favorited grammar</p>
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
          :to="`/grammar`"
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-gray-600 hover:text-green-600 hover:bg-green-50"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          语法 / Grammar
        </router-link>
        <span class="text-gray-400">/</span>
        <span class="px-3 py-1.5 rounded-lg bg-green-50 text-green-600 font-semibold">{{ formatLevel(currentLevel) }}</span>
      </nav>

      <!-- Loading -->
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 5" :key="i" class="skeleton h-24 w-full"></div>
      </div>

      <!-- Grammar List -->
      <div v-else>
        <div class="flex items-center justify-between mb-4">
          <p class="text-gray-600">{{ grammarList.length }} items</p>
          <router-link
            to="/grammar"
            class="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-green-50 hover:to-green-100 border border-gray-200 hover:border-green-200 rounded-xl text-gray-700 hover:text-green-700 transition-all duration-300 shadow-sm hover:shadow-md text-sm font-medium"
          >
            <svg class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            返回 / Back
          </router-link>
        </div>

        <div class="space-y-3">
          <div
            v-for="item in grammarList"
            :key="item.id"
            class="card card-hover relative"
            :class="{ 'visited-card': isVisited(item.id) }"
          >
            <div class="flex items-start gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2 flex-wrap">
                  <span class="badge badge-primary">{{ item.category }}</span>
                  <span class="text-sm text-gray-500">{{ item.category_name }}</span>
                  <span v-if="isVisited(item.id)" class="ml-auto">
                    <span class="check-indicator">
                      <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  </span>
                </div>
                <p class="text-gray-800 font-medium">{{ item.content }}</p>
                <p v-if="item.detail" class="text-sm text-gray-500 mt-1">{{ item.detail }}</p>
              </div>
              <button
                @click="toggleFavorite(item)"
                class="p-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
                :class="isFavorited(item.id) ? 'text-red-500' : 'text-gray-400'"
              >
                <svg class="w-5 h-5" :fill="isFavorited(item.id) ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
          </div>
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

const grammarList = ref([])
const levels = ref([])
const loading = ref(false)

const currentLevel = computed(() => route.params.level || null)

function formatLevel(level) {
  if (!level) return ''
  return level.replace('hsk', 'HSK ').replace('-', ' ')
}

function isFavorited(id) {
  return userStore.isFavorited('grammar', String(id))
}

function isVisited(id) {
  return userStore.isVisited('grammar', String(id))
}

function toggleFavorite(item) {
  userStore.toggleFavorite('grammar', String(item.id))
}

async function fetchLevels() {
  try {
    levels.value = await apiStore.fetchGrammarLevels()
  } catch (error) {
    console.error('Failed to fetch levels:', error)
  }
}

async function fetchGrammar() {
  loading.value = true
  try {
    grammarList.value = await apiStore.fetchGrammarList(currentLevel.value)
  } catch (error) {
    console.error('Failed to fetch grammar:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (currentLevel.value) {
    fetchGrammar()
  } else {
    fetchLevels()
  }
})

watch(currentLevel, (newLevel) => {
  if (newLevel) {
    fetchGrammar()
  } else {
    grammarList.value = []
    fetchLevels()
  }
})
</script>