<template>
  <div class="container-custom py-6">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <div class="flex items-center gap-3 mb-2">
          <router-link to="/" class="text-gray-500 hover:text-gray-700">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </router-link>
          <h1 class="text-2xl font-bold text-gray-800">系统配置 / System Config</h1>
        </div>
        <p class="text-gray-500 text-sm">管理系统配置项，包括 API 地址和 Prompt 模板</p>
      </div>

      <!-- Password Gate -->
      <div v-if="!isAuthenticated" class="card p-8 max-w-md mx-auto">
        <div class="text-center mb-6">
          <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h2 class="text-xl font-bold text-gray-800 mb-2">管理员登录</h2>
          <p class="text-gray-500 text-sm">请输入管理员密码以访问配置页面</p>
        </div>
        <form @submit.prevent="checkPassword" class="space-y-4">
          <div>
            <input
              v-model="password"
              type="password"
              placeholder="输入密码..."
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              autofocus
            />
          </div>
          <p v-if="loginError" class="text-red-500 text-sm text-center">{{ loginError }}</p>
          <button type="submit" class="w-full btn-primary py-3">
            登录
          </button>
        </form>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="card p-6">
          <div class="skeleton h-6 w-1/4 mb-4"></div>
          <div class="skeleton h-24 w-full"></div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="card p-6 text-center">
        <p class="text-red-500 mb-4">{{ error }}</p>
        <button @click="fetchConfigs" class="btn-primary px-5 py-2">重试</button>
      </div>

      <!-- Config List -->
      <div v-else class="space-y-6">
        <div v-for="config in configs" :key="config.key" class="card p-6">
          <div class="flex items-start justify-between mb-3">
            <div>
              <h3 class="text-lg font-bold text-gray-800">{{ config.key }}</h3>
              <p v-if="config.description" class="text-sm text-gray-500 mt-1">{{ config.description }}</p>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="resetConfigItem(config.key)"
                :disabled="saving === config.key"
                class="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title="重置为默认值"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                @click="saveConfigItem(config.key)"
                :disabled="saving === config.key || !isDirty(config.key)"
                class="px-4 py-1.5 text-sm bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ saving === config.key ? '保存中...' : '保存' }}
              </button>
            </div>
          </div>

          <!-- Default Value -->
          <div class="text-xs text-gray-400 mb-2">
            默认值: <code class="bg-gray-100 px-1 rounded">{{ truncate(config.default_value, 100) }}</code>
          </div>

          <!-- Value Editor -->
          <textarea
            v-model="editValues[config.key]"
            :rows="getRowCount(config.key)"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y font-mono text-sm"
            :placeholder="'输入 ' + config.key + ' 的值...'"
          ></textarea>

          <!-- Dirty Indicator -->
          <div v-if="isDirty(config.key)" class="mt-2 text-xs text-amber-600 flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            已修改（未保存）
          </div>
        </div>

        <!-- Save All Button -->
        <div v-if="hasDirtyItems" class="flex justify-end gap-3">
          <button
            @click="resetAllChanges"
            class="px-5 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            放弃所有更改
          </button>
          <button
            @click="saveAllConfigs"
            :disabled="saving"
            class="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {{ saving ? '保存中...' : '保存所有更改' }}
          </button>
        </div>
      </div>

      <!-- Toast Notification -->
      <Transition name="toast">
        <div
          v-if="toast.show"
          class="fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 z-50"
          :class="toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'"
        >
          <svg v-if="toast.type === 'success'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>{{ toast.message }}</span>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useApiStore } from '../stores/api'
import { useConfigStore } from '../stores/config'

const apiStore = useApiStore()
const configStore = useConfigStore()

const password = ref('')
const isAuthenticated = ref(false)
const loginError = ref('')
const configs = ref([])
const loading = ref(true)
const error = ref('')
const saving = ref('')
const editValues = reactive({})
const originalValues = reactive({})
const toast = reactive({ show: false, message: '', type: 'success' })

// Check password
async function checkPassword() {
  loginError.value = ''
  try {
    const response = await fetch('/api/config/check-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: password.value })
    })
    const result = await response.json()
    if (result.success) {
      isAuthenticated.value = true
      fetchConfigs()
    } else {
      loginError.value = '密码错误'
    }
  } catch (e) {
    loginError.value = '验证失败，请重试'
  }
}

// Check if a config has been modified
function isDirty(key) {
  return editValues[key] !== originalValues[key]
}

// Check if there are any dirty items
const hasDirtyItems = computed(() => {
  return configs.value.some(c => isDirty(c.key))
})

// Get row count for textarea based on content length
function getRowCount(key) {
  const value = editValues[key] || ''
  const lines = value.split('\n').length
  const estimatedCharsPerLine = 80
  const estimatedLines = Math.max(1, Math.ceil(value.length / estimatedCharsPerLine))
  return Math.max(4, Math.min(20, Math.max(lines, estimatedLines)))
}

// Truncate long text for display
function truncate(text, maxLength) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Show toast notification
function showToast(message, type = 'success') {
  toast.message = message
  toast.type = type
  toast.show = true
  setTimeout(() => {
    toast.show = false
  }, 3000)
}

// Fetch all configs
async function fetchConfigs() {
  loading.value = true
  error.value = ''
  try {
    const data = await apiStore.fetchConfigs()
    configs.value = data

    // Initialize edit values
    configs.value.forEach(c => {
      editValues[c.key] = c.value || ''
      originalValues[c.key] = c.value || ''
    })
  } catch (e) {
    console.error('Failed to fetch configs:', e)
    error.value = '加载配置失败，请重试'
  } finally {
    loading.value = false
  }
}

// Save single config
async function saveConfigItem(key) {
  saving.value = key
  try {
    const result = await apiStore.updateConfig(key, editValues[key])
    originalValues[key] = editValues[key]

    // Update the config in the list
    const config = configs.value.find(c => c.key === key)
    if (config) {
      config.value = editValues[key]
    }

    // Update configStore cache to trigger computed property updates
    configStore.updateConfigValue(key, editValues[key])

    showToast(`${key} 保存成功`)
  } catch (e) {
    console.error('Failed to save config:', e)
    showToast(`保存 ${key} 失败`, 'error')
  } finally {
    saving.value = ''
  }
}

// Reset single config to default
async function resetConfigItem(key) {
  saving.value = key
  try {
    const result = await apiStore.resetConfig(key)
    editValues[key] = result.value || ''
    originalValues[key] = result.value || ''

    // Update the config in the list
    const config = configs.value.find(c => c.key === key)
    if (config) {
      config.value = result.value
    }

    // Update configStore cache to trigger computed property updates
    configStore.updateConfigValue(key, result.value)

    showToast(`${key} 已重置为默认值`)
  } catch (e) {
    console.error('Failed to reset config:', e)
    showToast(`重置 ${key} 失败`, 'error')
  } finally {
    saving.value = ''
  }
}

// Save all configs
async function saveAllConfigs() {
  const dirtyKeys = configs.value.filter(c => isDirty(c.key)).map(c => c.key)
  if (dirtyKeys.length === 0) return

  saving.value = 'all'
  let successCount = 0
  let failCount = 0

  for (const key of dirtyKeys) {
    try {
      await apiStore.updateConfig(key, editValues[key])
      originalValues[key] = editValues[key]

      // Update configStore cache to trigger computed property updates
      configStore.updateConfigValue(key, editValues[key])
      successCount++
    } catch (e) {
      console.error(`Failed to save ${key}:`, e)
      failCount++
    }
  }

  saving.value = ''

  if (failCount === 0) {
    showToast(`已保存 ${successCount} 项配置`)
  } else {
    showToast(`${successCount} 项保存成功，${failCount} 项失败`, 'error')
  }

  // Refresh configs
  await fetchConfigs()
}

// Reset all changes
function resetAllChanges() {
  configs.value.forEach(c => {
    editValues[c.key] = c.value || ''
  })
  showToast('已放弃所有更改')
}

onMounted(() => {
  fetchConfigs()
})
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>