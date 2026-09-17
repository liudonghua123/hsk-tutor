<template>
  <footer class="bg-gradient-to-b from-gray-100 to-gray-200 border-t border-gray-300/50 mt-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div class="grid md:grid-cols-3 gap-8">
        <!-- Brand -->
        <div>
          <div class="flex items-center gap-3 mb-4">
            <div class="relative">
              <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                <span class="text-white text-lg font-bold">汉</span>
              </div>
              <div class="absolute inset-0 w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl blur-lg opacity-30"></div>
            </div>
            <div>
              <span class="text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">HSK Tutor</span>
              <p class="text-xs text-gray-400">学习汉字，传承文化</p>
            </div>
          </div>
          <p class="text-gray-500 text-sm leading-relaxed">
            Learn Chinese characters, writing, and grammar.
          </p>
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wider">快速链接 / Quick Links</h4>
          <nav class="space-y-2">
            <router-link
              v-for="link in quickLinks"
              :key="link.to"
              :to="link.to"
              class="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors"
            >
              <span>{{ link.icon }}</span>
              <span>{{ link.label }}</span>
            </router-link>
          </nav>
        </div>

        <!-- Stats -->
        <div>
          <h4 class="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wider">学习统计 / Stats</h4>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 bg-white rounded-xl">
              <span class="text-sm text-gray-600 flex items-center gap-2">
                <span class="w-2 h-2 bg-primary-500 rounded-full"></span>
                访问 / Visited
              </span>
              <span class="font-bold text-primary-600">{{ visitedCount }}</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-white rounded-xl">
              <span class="text-sm text-gray-600 flex items-center gap-2">
                <span class="w-2 h-2 bg-pink-500 rounded-full"></span>
                收藏 / Favorites
              </span>
              <span class="font-bold text-pink-600">{{ favoriteCount }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom -->
      <div class="mt-8 pt-6 border-t border-gray-300/50">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="text-center sm:text-left">
            <p class="text-gray-500 text-sm">
              © {{ currentYear }} HSK Tutor
            </p>
          </div>
          <p class="text-gray-400 text-sm flex items-center gap-2">
            <span>学习汉语，拥抱文化</span>
            <span class="text-primary-400">•</span>
            <span>Learn Chinese, Embrace Culture</span>
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()

const quickLinks = [
  { to: '/read', label: '认读学习 / Read', icon: '📖' },
  { to: '/write', label: '书写练习 / Write', icon: '✍️' },
  { to: '/grammar', label: '语法学习 / Grammar', icon: '📝' },
  { to: '/favorites', label: '我的收藏 / Favorites', icon: '❤️' },
]

const visitedCount = computed(() => userStore.visitedCount)
const favoriteCount = computed(() => userStore.favoriteCount)
const currentYear = new Date().getFullYear()
</script>