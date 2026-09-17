<template>
  <div class="container-custom py-6">
    <!-- Header -->
    <div class="flex items-center gap-4 mb-8">
      <div class="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-md">
        <span class="text-white text-xl font-bold">汉</span>
      </div>
      <div>
        <h1 class="text-2xl font-bold text-gray-800">HSK Tutor</h1>
        <p class="text-sm text-gray-500">学习汉字、掌握书写技能和语法 / Learn Chinese characters</p>
      </div>
    </div>

    <!-- Daily Poetry -->
    <div class="mb-8">
      <PoetryCard />
    </div>

    <!-- Learning Modules -->
    <div class="mb-8">
      <h2 class="text-lg font-semibold text-gray-700 mb-4">学习模块 / Modules</h2>
      <div class="grid md:grid-cols-3 gap-4">
        <router-link
          v-for="feature in modules"
          :key="feature.to"
          :to="feature.to"
          class="card card-hover group"
        >
          <div class="flex items-center gap-4 mb-3">
            <div class="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform">
              {{ feature.icon }}
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-800">{{ feature.title }}</h3>
              <p class="text-sm text-gray-500">{{ feature.count }}</p>
            </div>
          </div>
          <p class="text-gray-600 text-sm">{{ feature.description }}</p>
        </router-link>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid md:grid-cols-2 gap-4 mb-8">
      <!-- Favorites -->
      <router-link
        to="/favorites"
        class="card card-hover bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 hover:border-amber-300"
      >
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white text-2xl shadow-md">
            ❤️
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-800">我的收藏 / Favorites</h3>
            <p class="text-gray-600 text-sm">{{ favoriteCount }} items</p>
          </div>
        </div>
      </router-link>

      <!-- Progress -->
      <div class="card bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-200">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-gradient-to-br from-green-400 to-teal-500 rounded-xl flex items-center justify-center text-white text-2xl shadow-md">
            📊
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-800">学习进度 / Progress</h3>
            <p class="text-gray-600 text-sm">{{ visitedCount }} visited</p>
          </div>
        </div>
      </div>
    </div>

    <!-- HSK Levels Overview -->
    <div class="card">
      <h2 class="text-lg font-semibold text-gray-700 mb-4">HSK 级别概览 / Levels Overview</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <router-link
          v-for="level in hskLevels"
          :key="level.key"
          :to="`/read/${level.key}`"
          class="p-3 bg-gray-50 hover:bg-primary-50 rounded-xl text-center transition-colors group"
        >
          <div class="text-xl font-bold text-gray-700 group-hover:text-primary-600">{{ level.name }}</div>
          <div class="text-sm text-gray-500 mt-1">{{ level.count }} chars</div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import PoetryCard from '../components/PoetryCard.vue'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()

const hskLevels = [
  { key: 'hsk1', name: 'HSK 1', count: '150' },
  { key: 'hsk2', name: 'HSK 2', count: '150' },
  { key: 'hsk3', name: 'HSK 3', count: '300' },
  { key: 'hsk4', name: 'HSK 4', count: '300' },
  { key: 'hsk5', name: 'HSK 5', count: '500' },
  { key: 'hsk6', name: 'HSK 6', count: '500' },
  { key: 'hsk7-9', name: 'HSK 7-9', count: '~1000' },
]

const modules = [
  {
    to: '/read',
    icon: '📖',
    title: '认读学习 / Read',
    description: '学习汉字的认读，包括拼音、释义和用法',
    count: '9000+ 汉字'
  },
  {
    to: '/write',
    icon: '✍️',
    title: '书写练习 / Write',
    description: '通过 HanziWriter 练习汉字书写，掌握笔顺',
    count: '2000+ 汉字'
  },
  {
    to: '/grammar',
    icon: '📝',
    title: '语法要点 / Grammar',
    description: '学习 HSK 各级的语法知识点',
    count: '500+ 语法点'
  }
]

const favoriteCount = computed(() => userStore.favoriteCount)
const visitedCount = computed(() => userStore.visitedCount)
</script>