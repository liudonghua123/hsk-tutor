<template>
  <div class="container-custom py-8">
    <!-- Header -->
    <div class="flex items-center gap-4 mb-6 flex-wrap">
      <router-link
        to="/"
        class="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-primary-50 hover:to-primary-100 border border-gray-200 hover:border-primary-200 rounded-xl text-gray-700 hover:text-primary-700 transition-all duration-300 shadow-sm hover:shadow-md font-medium"
      >
        <svg class="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        返回 / Back
      </router-link>
      <div>
        <h1 class="text-2xl font-bold text-gray-800">❤️ 我的收藏 / Favorites</h1>
        <p class="text-sm text-gray-500">
          {{ userStore.isLocal ? '本地账号 / Local' : `账号: ${userStore.userId}` }}
        </p>
      </div>
      <div class="ml-auto flex items-center gap-2">
        <span v-if="userStore.syncing" class="text-sm text-primary-500 animate-pulse">
          同步中... / Syncing...
        </span>
        <button
          v-if="userStore.favorites.length > 0"
          @click="showClearConfirm = true"
          class="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors text-sm"
        >
          🗑️ Clear All / 清空全部
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 mb-6">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="activeTab = tab.key"
        class="px-4 py-2 rounded-lg font-medium transition-colors"
        :class="activeTab === tab.key ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
      >
        {{ tab.label }} ({{ getTabCount(tab.key) }})
      </button>
    </div>

    <!-- Content -->
    <div v-if="currentFavorites.length > 0" class="space-y-4">
      <!-- Hanzi/Handwritten -->
      <template v-if="activeTab === 'hanzi' || activeTab === 'handwritten'">
        <div class="hanzi-grid">
          <div
            v-for="fav in currentFavorites"
            :key="fav.item_id"
            class="hanzi-char card-hover favorited relative group"
          >
            <router-link
              :to="`/word/${fav.item_id}?type=${activeTab}`"
              class="block w-full h-full flex items-center justify-center"
            >
              {{ fav.item_id }}
            </router-link>
            <button
              @click="removeFavorite(fav)"
              class="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
            >
              ×
            </button>
          </div>
        </div>
      </template>

      <!-- Grammar -->
      <template v-else-if="activeTab === 'grammar'">
        <div
          v-for="fav in currentFavorites"
          :key="fav.item_id"
          class="card card-hover"
        >
          <div class="flex items-start justify-between">
            <div>
              <p class="font-medium text-gray-800">Grammar #{{ fav.item_id }}</p>
              <p class="text-sm text-gray-500 mt-1">
                {{ formatDate(fav.created_at) }}
              </p>
            </div>
            <button
              @click="removeFavorite(fav)"
              class="p-2 text-red-500 hover:bg-red-50 rounded-full"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </template>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <div class="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <span class="text-4xl">❤️</span>
      </div>
      <p class="text-gray-500 mb-2">No favorites yet / 还没有收藏</p>
      <router-link to="/read" class="btn-primary inline-block mt-4">开始学习 / Start Learning</router-link>
    </div>

    <!-- Clear Confirm Modal -->
    <div
      v-if="showClearConfirm"
      class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      @click.self="showClearConfirm = false"
    >
      <div class="bg-white rounded-2xl max-w-sm w-full p-6 animate-slide-up">
        <h3 class="text-xl font-bold text-gray-800 mb-2">确认清空？/ Clear All?</h3>
        <p class="text-gray-600 mb-4">
          {{ userStore.isLocal ? '将清空本地收藏。' : '将清空云端收藏。' }}
        </p>
        <div class="flex gap-3">
          <button @click="showClearConfirm = false" class="flex-1 btn-outline">
            取消 / Cancel
          </button>
          <button @click="clearAllFavorites" class="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">
            确认 / Confirm
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '../stores/user'
import { useApiStore } from '../stores/api'

const userStore = useUserStore()
const apiStore = useApiStore()

const activeTab = ref('hanzi')
const showClearConfirm = ref(false)

const tabs = [
  { key: 'hanzi', label: '认读 / Read' },
  { key: 'handwritten', label: '书写 / Write' },
  { key: 'grammar', label: '语法 / Grammar' }
]

const currentFavorites = computed(() => {
  return userStore.favorites.filter(f => f.item_type === activeTab.value)
})

function getTabCount(tab) {
  return userStore.favorites.filter(f => f.item_type === tab).length
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString('zh-CN')
}

async function removeFavorite(fav) {
  // Remove locally
  userStore.removeFavorite(fav.item_type, fav.item_id)

  // Sync to cloud if cloud user
  if (!userStore.isLocal) {
    try {
      await apiStore.removeFavorite(userStore.userId, fav.item_type, fav.item_id)
    } catch (error) {
      console.error('Failed to sync remove favorite to cloud:', error)
      // Revert local change if cloud sync failed
      userStore.addFavorite(fav.item_type, fav.item_id)
    }
  }
}

async function clearAllFavorites() {
  showClearConfirm.value = false

  const toRemove = currentFavorites.value.slice() // Copy array

  // Remove locally
  for (const fav of toRemove) {
    userStore.removeFavorite(fav.item_type, fav.item_id)
  }

  // Sync to cloud if cloud user
  if (!userStore.isLocal) {
    try {
      for (const fav of toRemove) {
        await apiStore.removeFavorite(userStore.userId, fav.item_type, fav.item_id)
      }
    } catch (error) {
      console.error('Failed to sync clear favorites to cloud:', error)
    }
  }
}
</script>