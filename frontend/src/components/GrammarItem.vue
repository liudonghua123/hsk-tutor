<template>
  <div>
    <!-- Loading skeleton -->
    <div v-if="loading" class="grid gap-4">
      <div class="skeleton h-8 w-1/4"></div>
      <div class="skeleton h-32 w-full"></div>
      <div class="skeleton h-8 w-1/3"></div>
      <div class="skeleton h-48 w-full"></div>
    </div>

    <!-- Content -->
    <div v-else-if="grammar" class="space-y-6">
      <div class="flex items-center gap-3">
        <span class="badge badge-primary">{{ grammar.level }}</span>
        <span class="badge badge-secondary">{{ grammar.category }} • {{ grammar.category_name }}</span>
      </div>

      <div class="card">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">{{ grammar.content }}</h2>
        <div v-if="grammar.detail" class="text-gray-600">
          <span class="font-medium">细目：</span>{{ grammar.detail }}
        </div>
      </div>
    </div>

    <!-- Not found -->
    <div v-else class="text-center py-12">
      <p class="text-gray-500">Grammar point not found</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  grammar: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})
</script>