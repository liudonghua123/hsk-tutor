<template>
  <header class="sticky top-0 z-50">
    <!-- Animated Background -->
    <div class="absolute inset-0 bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 -z-10">
      <!-- Animated gradient overlay -->
      <div class="absolute inset-0 bg-gradient-to-r from-primary-600/90 via-purple-600/90 to-pink-600/90 animate-gradient"></div>

      <!-- Floating orbs -->
      <div class="absolute top-0 left-1/4 w-64 h-64 bg-primary-400/20 rounded-full blur-3xl animate-float-1 pointer-events-none"></div>
      <div class="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-float-2 pointer-events-none"></div>
      <div class="absolute bottom-0 left-1/3 w-72 h-72 bg-pink-400/20 rounded-full blur-3xl animate-float-3 pointer-events-none"></div>

      <!-- Subtle grid pattern -->
      <div class="absolute inset-0 opacity-10" style="background-image: url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23ffffff&quot; fill-opacity=&quot;0.4&quot;%3E%3Cpath d=&quot;M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"></div>
    </div>

    <!-- Gradient accent line -->
    <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-white/50 via-yellow-300 to-white/50"></div>

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-3 group flex-shrink-0 z-10">
          <div class="relative">
            <div class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300 border border-white/30">
              <span class="text-white text-xl font-bold">汉</span>
            </div>
            <div class="absolute inset-0 w-10 h-10 bg-white/30 rounded-xl blur-lg group-hover:opacity-75 transition-opacity"></div>
          </div>
          <div class="hidden sm:block">
            <span class="text-xl font-bold text-white drop-shadow-lg">
              HSK Tutor
            </span>
            <span class="block text-xs text-white/70 -mt-0.5">学习汉语</span>
          </div>
        </router-link>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center gap-1 z-10">
          <router-link
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="group relative px-4 py-2 text-sm font-medium text-white/90 hover:text-white rounded-xl transition-all duration-300 overflow-hidden"
            active-class="text-white"
          >
            <!-- Hover/Active background -->
            <span class="absolute inset-0 bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 group-[.router-link-active]:opacity-100 transition-opacity duration-300 rounded-xl border border-white/20"></span>

            <span class="relative flex items-center gap-2">
              <span class="text-lg">{{ link.icon }}</span>
              <span>{{ link.label }}</span>
            </span>
          </router-link>
        </nav>

        <!-- Right side -->
        <div class="flex items-center gap-2 z-10">
          <!-- Favorites Badge -->
          <router-link
            to="/favorites"
            class="relative group flex items-center gap-2 px-3 py-2 text-sm font-medium text-white/90 hover:text-white rounded-xl transition-all duration-300"
            active-class="text-white"
          >
            <span class="absolute inset-0 bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 group-[.router-link-active]:opacity-100 transition-opacity duration-300 rounded-xl border border-white/20"></span>
            <span class="relative flex items-center gap-2">
              <div class="relative">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span
                  v-if="favoriteCount > 0"
                  class="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-gradient-to-r from-rose-400 to-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-md animate-bounce-subtle"
                >
                  {{ favoriteCount > 99 ? '99+' : favoriteCount }}
                </span>
              </div>
              <span class="hidden lg:inline font-medium">收藏</span>
            </span>
          </router-link>

          <!-- User Menu -->
          <div class="relative">
            <button
              @click="showUserMenu = !showUserMenu"
              class="group flex items-center gap-2 px-3 py-2 text-sm text-white/90 hover:text-white rounded-xl transition-all duration-300 hover:bg-white/20 backdrop-blur-sm"
            >
              <div class="relative">
                <div class="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow border border-white/30">
                  <span class="text-white text-sm font-bold">
                    {{ userStore.userId === 'local' ? 'L' : userStore.userId[0].toUpperCase() }}
                  </span>
                </div>
                <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white/50" :class="userStore.isLocal ? 'bg-gray-400' : 'bg-green-400'"></span>
              </div>
              <span class="hidden sm:inline max-w-[100px] truncate font-medium">
                {{ userStore.isLocal ? '本地' : userStore.userId }}
              </span>
              <svg class="w-4 h-4 text-white/70 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Dropdown Menu -->
            <Transition
              enter-active-class="transition ease-out duration-200"
              enter-from-class="transform opacity-0 scale-95 -translate-y-2"
              enter-to-class="transform opacity-100 scale-100 translate-y-0"
              leave-active-class="transition ease-in duration-150"
              leave-from-class="transform opacity-100 scale-100 translate-y-0"
              leave-to-class="transform opacity-0 scale-95 -translate-y-2"
            >
              <div
                v-if="showUserMenu"
                @click.stop
                class="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
              >
                <!-- Header gradient -->
                <div class="h-2 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500"></div>

                <!-- Current user -->
                <div class="p-4 border-b border-gray-100">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-gradient-to-br from-primary-400 to-purple-500 rounded-full flex items-center justify-center">
                      <span class="text-white font-bold">{{ userStore.userId === 'local' ? 'L' : userStore.userId[0].toUpperCase() }}</span>
                    </div>
                    <div>
                      <div class="font-medium text-gray-800">{{ userStore.isLocal ? '本地账号' : userStore.userId }}</div>
                      <div class="text-xs text-gray-400">{{ userStore.isLocal ? 'Local Account' : 'Cloud Account' }}</div>
                    </div>
                  </div>
                </div>

                <!-- Account list -->
                <div class="p-2 max-h-48 overflow-y-auto">
                  <div class="text-xs text-gray-400 px-2 py-1">切换账号 / Switch Account</div>
                  <div
                    v-if="userStore.availableAccounts.length === 0"
                    class="text-sm text-gray-400 text-center py-4"
                  >
                    无可用账号
                  </div>
                  <button
                    v-for="account in userStore.availableAccounts"
                    :key="account.id"
                    @click.stop="switchToAccount(account.id)"
                    class="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-gray-100 transition-colors"
                    :class="{ 'bg-primary-50': account.id === userStore.userId }"
                  >
                    <div class="w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center">
                      <span class="text-white text-xs font-bold">{{ account.id === 'local' ? 'L' : account.id[0].toUpperCase() }}</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="text-sm font-medium text-gray-700 truncate">{{ account.name || account.id }}</div>
                      <div class="text-xs text-gray-400">{{ account.isCloud ? '云端' : '本地' }}</div>
                    </div>
                    <svg v-if="account.id === userStore.userId" class="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>

                <!-- Info -->
                <div class="p-3 border-t border-gray-100 text-xs text-gray-400 text-center">
                  账号切换仅支持已有账号<br/>
                  <span class="text-gray-300">Use ?user=xxx in URL to add cloud account</span>
                </div>

                <!-- Remove account (if cloud and not current) -->
                <div v-if="!userStore.isLocal" class="p-3 border-t border-gray-100">
                  <button
                    @click="removeAccount"
                    class="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    删除当前账号 / Remove Account
                  </button>
                </div>
              </div>
            </Transition>
          </div>

          <!-- Mobile Menu Toggle -->
          <button
            @click="showMobileMenu = !showMobileMenu"
            class="md:hidden p-2 text-white/90 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-300 backdrop-blur-sm"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="!showMobileMenu" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <Transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 -translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-4"
      >
        <div v-if="showMobileMenu" class="md:hidden pb-4 border-t border-white/20 mt-1">
          <nav class="space-y-1 pt-4">
            <router-link
              v-for="link in navLinks"
              :key="link.to"
              :to="link.to"
              class="flex items-center gap-3 px-4 py-3 text-white/90 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-300 backdrop-blur-sm"
              active-class="text-white bg-white/20"
              @click="showMobileMenu = false"
            >
              <span class="text-xl">{{ link.icon }}</span>
              <span class="font-medium">{{ link.label }}</span>
            </router-link>
            <router-link
              to="/favorites"
              class="flex items-center gap-3 px-4 py-3 text-white/90 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-300 backdrop-blur-sm"
              active-class="text-white bg-white/20"
              @click="showMobileMenu = false"
            >
              <span class="text-xl">❤️</span>
              <span class="font-medium">收藏 ({{ favoriteCount }})</span>
            </router-link>
          </nav>
        </div>
      </Transition>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()

const showMobileMenu = ref(false)
const showUserMenu = ref(false)

const navLinks = [
  { to: '/read', label: '认读', icon: '📖' },
  { to: '/write', label: '书写', icon: '✍️' },
  { to: '/grammar', label: '语法', icon: '📝' },
]

const favoriteCount = computed(() => userStore.favoriteCount)

function switchToAccount(userId) {
  userStore.switchUser(userId)
  showUserMenu.value = false
}

function removeAccount() {
  if (confirm('确定要删除当前账号吗？')) {
    userStore.removeAccount(userStore.userId)
    showUserMenu.value = false
  }
}
</script>

<style scoped>
/* Animated gradient background */
@keyframes gradient-shift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.animate-gradient {
  background-size: 200% 200%;
  animation: gradient-shift 15s ease infinite;
}

/* Floating orbs */
@keyframes float-1 {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -30px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

@keyframes float-2 {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(-40px, 30px) scale(1.05);
  }
  66% {
    transform: translate(20px, -40px) scale(1.1);
  }
}

@keyframes float-3 {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, 40px) scale(1.1);
  }
  66% {
    transform: translate(-30px, -20px) scale(0.9);
  }
}

.animate-float-1 {
  animation: float-1 20s ease-in-out infinite;
}

.animate-float-2 {
  animation: float-2 25s ease-in-out infinite;
}

.animate-float-3 {
  animation: float-3 18s ease-in-out infinite;
}

/* Subtle bounce for badge */
@keyframes bounce-subtle {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.animate-bounce-subtle {
  animation: bounce-subtle 2s ease-in-out infinite;
}
</style>