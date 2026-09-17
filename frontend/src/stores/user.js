import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const STORAGE_KEYS = {
  ACTIVE_USER: 'hsk_active_user',
  USER_ACCOUNTS: 'hsk_user_accounts',
  FAVORITES_PREFIX: 'hsk_favorites_',
  VISITED_PREFIX: 'hsk_visited_',
}

// Default local account
const LOCAL_ACCOUNT = 'local'

export const useUserStore = defineStore('user', () => {
  // Active user ID (default: 'local')
  const activeUserId = ref(localStorage.getItem(STORAGE_KEYS.ACTIVE_USER) || LOCAL_ACCOUNT)

  // All saved accounts
  const accounts = ref(loadAccounts())

  // Current user's favorites and visited
  const favorites = ref([])
  const visited = ref([])

  // Sync state
  const syncing = ref(false)

  // Computed
  const userId = computed(() => activeUserId.value)
  const isLocal = computed(() => activeUserId.value === LOCAL_ACCOUNT)
  const currentAccount = computed(() => accounts.value[activeUserId.value])
  const accountList = computed(() => Object.values(accounts.value))

  // Load all accounts from localStorage
  function loadAccounts() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_ACCOUNTS)
      if (data) {
        const parsed = JSON.parse(data)
        // Ensure local account exists
        if (!parsed[LOCAL_ACCOUNT]) {
          parsed[LOCAL_ACCOUNT] = { id: LOCAL_ACCOUNT, name: '本地 / Local', createdAt: Date.now() }
          localStorage.setItem(STORAGE_KEYS.USER_ACCOUNTS, JSON.stringify(parsed))
        }
        return parsed
      }
      return { [LOCAL_ACCOUNT]: { id: LOCAL_ACCOUNT, name: '本地 / Local', createdAt: Date.now() } }
    } catch {
      return { [LOCAL_ACCOUNT]: { id: LOCAL_ACCOUNT, name: '本地 / Local', createdAt: Date.now() } }
    }
  }

  // Save accounts to localStorage
  function saveAccounts() {
    localStorage.setItem(STORAGE_KEYS.USER_ACCOUNTS, JSON.stringify(accounts.value))
  }

  // Load data for active user
  function loadUserData() {
    const favKey = STORAGE_KEYS.FAVORITES_PREFIX + activeUserId.value
    const visKey = STORAGE_KEYS.VISITED_PREFIX + activeUserId.value

    try {
      const favData = localStorage.getItem(favKey)
      favorites.value = favData ? JSON.parse(favData) : []
    } catch {
      favorites.value = []
    }

    try {
      const visData = localStorage.getItem(visKey)
      visited.value = visData ? JSON.parse(visData) : []
    } catch {
      visited.value = []
    }
  }

  // Save favorites for active user
  function saveFavorites() {
    const key = STORAGE_KEYS.FAVORITES_PREFIX + activeUserId.value
    localStorage.setItem(key, JSON.stringify(favorites.value))
  }

  // Save visited for active user
  function saveVisited() {
    const key = STORAGE_KEYS.VISITED_PREFIX + activeUserId.value
    localStorage.setItem(key, JSON.stringify(visited.value))
  }

  // Sync cloud data to local
  async function syncCloudData() {
    if (isLocal.value || syncing.value) return

    syncing.value = true
    try {
      // Import api store dynamically to avoid circular dependency
      const { useApiStore } = await import('./api')
      const apiStore = useApiStore()

      // Fetch and sync favorites
      const cloudFavorites = await apiStore.syncFavoritesFromCloud(activeUserId.value)
      if (cloudFavorites) {
        favorites.value = cloudFavorites
        saveFavorites()
      }

      // Fetch and sync visited
      const cloudVisited = await apiStore.syncVisitedFromCloud(activeUserId.value)
      if (cloudVisited) {
        visited.value = cloudVisited
        saveVisited()
      }
    } catch (error) {
      console.error('Failed to sync cloud data:', error)
    } finally {
      syncing.value = false
    }
  }

  // Switch to a different user
  async function switchUser(userId) {
    if (!accounts.value[userId]) return

    // Save current user data before switching
    saveFavorites()
    saveVisited()

    activeUserId.value = userId
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, userId)
    loadUserData()

    // Sync cloud data for cloud user
    if (!isLocal.value) {
      await syncCloudData()
    }
  }

  // Set user (add to accounts if not exists)
  function setUser(id, name = null) {
    if (!id) return

    const userId = id.trim()
    if (!accounts.value[userId]) {
      accounts.value[userId] = {
        id: userId,
        name: name || userId,
        createdAt: Date.now(),
        isCloud: true
      }
      saveAccounts()
    }

    switchUser(userId)
  }

  // Clear current user (switch to local)
  function clearUser() {
    switchUser(LOCAL_ACCOUNT)
  }

  // Remove a user account
  function removeAccount(userId) {
    if (userId === LOCAL_ACCOUNT) return
    delete accounts.value[userId]
    // Also remove their data
    localStorage.removeItem(STORAGE_KEYS.FAVORITES_PREFIX + userId)
    localStorage.removeItem(STORAGE_KEYS.VISITED_PREFIX + userId)
    saveAccounts()
    if (activeUserId.value === userId) {
      switchUser(LOCAL_ACCOUNT)
    }
  }

  // Initialize: check URL for user param and load data
  function initFromUrl() {
    const params = new URLSearchParams(window.location.search)
    const urlUser = params.get('user')

    if (urlUser && urlUser !== activeUserId.value) {
      setUser(urlUser)
      // Clean URL
      const url = new URL(window.location.href)
      url.searchParams.delete('user')
      window.history.replaceState({}, '', url)
    } else if (urlUser) {
      // Same user, just clean URL
      const url = new URL(window.location.href)
      url.searchParams.delete('user')
      window.history.replaceState({}, '', url)
    }

    loadUserData()
  }

  // Initialize on store creation
  initFromUrl()

  // Watch for URL changes
  watch(() => window.location.search, () => {
    initFromUrl()
  })

  // Favorites actions
  function isFavorited(type, itemId) {
    return favorites.value.some(f => f.item_type === type && f.item_id === itemId)
  }

  function addFavorite(type, itemId) {
    if (isFavorited(type, itemId)) return

    const fav = {
      item_type: type,
      item_id: itemId,
      created_at: Date.now()
    }
    favorites.value.push(fav)
    saveFavorites()
  }

  function removeFavorite(type, itemId) {
    const index = favorites.value.findIndex(f => f.item_type === type && f.item_id === itemId)
    if (index > -1) {
      favorites.value.splice(index, 1)
      saveFavorites()
    }
  }

  function toggleFavorite(type, itemId) {
    if (isFavorited(type, itemId)) {
      removeFavorite(type, itemId)
      return false
    } else {
      addFavorite(type, itemId)
      return true
    }
  }

  // Visited actions
  function isVisited(type, itemId) {
    return visited.value.includes(`${type}:${itemId}`)
  }

  async function markVisited(type, itemId) {
    const key = `${type}:${itemId}`
    if (!visited.value.includes(key)) {
      visited.value.push(key)
      saveVisited()

      // Sync to cloud if cloud user
      if (!isLocal.value) {
        try {
          const { useApiStore } = await import('./api')
          const apiStore = useApiStore()
          await apiStore.addVisitedToCloud(activeUserId.value, type, itemId)
        } catch (error) {
          console.error('Failed to sync visited to cloud:', error)
        }
      }
    }
  }

  // Get visited count
  const visitedCount = computed(() => visited.value.length)

  // Get favorites count
  const favoriteCount = computed(() => favorites.value.length)

  // Sync cloud favorites to local (called after fetching from server)
  function syncCloudFavorites(cloudFavorites) {
    if (!isLocal.value && cloudFavorites) {
      favorites.value = cloudFavorites
      saveFavorites()
    }
  }

  // Sync cloud visited to local
  function syncCloudVisited(cloudVisited) {
    if (!isLocal.value && cloudVisited) {
      visited.value = cloudVisited
      saveVisited()
    }
  }

  // Get accounts that exist in localStorage (for dropdown)
  const availableAccounts = computed(() => {
    const result = []
    for (const id of Object.keys(accounts.value)) {
      // Check if this account has any data
      const hasData = localStorage.getItem(STORAGE_KEYS.FAVORITES_PREFIX + id)?.length > 2 ||
                      localStorage.getItem(STORAGE_KEYS.VISITED_PREFIX + id)?.length > 2
      if (hasData || id === LOCAL_ACCOUNT) {
        result.push(accounts.value[id])
      }
    }
    return result
  })

  return {
    userId,
    activeUserId,
    isLocal,
    currentAccount,
    accountList,
    availableAccounts,
    favorites,
    visited,
    syncing,
    favoriteCount,
    visitedCount,
    initFromUrl,
    switchUser,
    setUser,
    clearUser,
    removeAccount,
    syncCloudData,
    isFavorited,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isVisited,
    markVisited,
    syncCloudFavorites,
    syncCloudVisited,
  }
})