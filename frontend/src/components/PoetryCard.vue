<template>
  <div class="relative overflow-hidden rounded-2xl">
    <!-- Background gradient -->
    <div class="absolute inset-0 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50"></div>

    <!-- Decorative elements -->
    <div class="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-200/40 to-pink-200/40 rounded-full blur-3xl"></div>
    <div class="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-indigo-200/40 to-purple-200/40 rounded-full blur-2xl"></div>

    <!-- Loading state -->
    <div v-if="loading" class="relative p-5">
      <div class="flex items-center gap-3 mb-4">
        <div class="skeleton w-10 h-10 rounded-xl"></div>
        <div class="flex-1 space-y-2">
          <div class="skeleton h-5 w-40 rounded"></div>
          <div class="skeleton h-4 w-28 rounded"></div>
        </div>
      </div>
      <div class="space-y-2 ml-4">
        <div class="skeleton h-6 w-full rounded"></div>
        <div class="skeleton h-6 w-2/3 rounded"></div>
      </div>
    </div>

    <!-- Content -->
    <div v-else-if="poetry" class="relative">
      <!-- Compact header (always visible) -->
      <div class="flex items-center gap-3 p-4 cursor-pointer" @click="toggleExpand">
        <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
          <span class="text-white text-lg">📜</span>
        </div>
        <div class="flex-1">
          <h3 class="font-bold text-gray-800">{{ poetry.data.origin.title }}</h3>
          <p class="text-sm text-gray-500">{{ poetry.data.origin.dynasty }} · {{ poetry.data.origin.author }}</p>
        </div>
        <button class="p-2 hover:bg-white/50 rounded-xl transition-colors">
          <svg class="w-5 h-5 text-gray-400 transition-transform duration-300" :class="{ 'rotate-180': expanded }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <!-- Main quote (always visible) -->
      <div class="px-4 pb-4">
        <div class="pl-4 border-l-2 border-gradient-to-b from-purple-400 to-pink-400">
          <p class="text-xl font-medium text-gray-800 leading-relaxed">
            {{ poetry.data.content }}
          </p>
        </div>
      </div>

      <!-- Expanded content -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 max-h-0"
        enter-to-class="opacity-100 max-h-[800px]"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 max-h-[800px]"
        leave-to-class="opacity-0 max-h-0"
      >
        <div v-if="expanded" class="overflow-hidden">
          <!-- Divider -->
          <div class="h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent mx-4"></div>

          <!-- Full poem -->
          <div class="p-4 space-y-2">
            <h4 class="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
              <span class="w-1 h-4 bg-purple-500 rounded-full"></span>
              原文
            </h4>
            <div class="space-y-1 pl-3">
              <p v-for="(line, index) in poetry.data.origin.content" :key="index"
                 class="text-gray-700 text-sm leading-relaxed">
                {{ line }}
              </p>
            </div>
          </div>

          <!-- Translation -->
          <div v-if="poetry.data.origin.translate && poetry.data.origin.translate.length > 0" class="p-4 pt-2">
            <h4 class="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
              <span class="w-1 h-4 bg-pink-500 rounded-full"></span>
              译文
            </h4>
            <div class="space-y-2 pl-3">
              <p v-for="(t, index) in poetry.data.origin.translate" :key="index"
                 class="text-gray-600 text-sm leading-relaxed border-l-2 border-pink-200 pl-3">
                {{ t }}
              </p>
            </div>
          </div>

          <!-- Tags -->
          <div v-if="poetry.data.matchTags && poetry.data.matchTags.length > 0" class="px-4 pb-4 flex items-center gap-2">
            <span v-for="tag in poetry.data.matchTags" :key="tag"
                  class="px-2 py-0.5 bg-purple-50 text-purple-600 text-xs rounded-full">
              #{{ tag }}
            </span>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Fallback -->
    <div v-else class="relative p-5">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
          <span class="text-lg">📜</span>
        </div>
        <div>
          <p class="text-gray-700 font-medium">滕王阁序</p>
          <p class="text-sm text-gray-400">唐代 · 王勃</p>
        </div>
      </div>
      <p class="mt-3 text-gray-500 italic pl-3 border-l-2 border-gray-200">
        落霞与孤鹜齐飞，秋水共长天一色。
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const poetry = ref(null)
const loading = ref(true)
const expanded = ref(false)

function toggleExpand() {
  expanded.value = !expanded.value
}

onMounted(async () => {
  try {
    const response = await fetch('https://v2.jinrishici.com/one.json?client=npm-sdk/1.0')
    if (response.ok) {
      poetry.value = await response.json()
    }
  } catch (error) {
    console.error('Failed to fetch poetry:', error)
  } finally {
    loading.value = false
  }
})
</script>