import { defineStore } from 'pinia'
import { ref } from 'vue'

const API_BASE = '/api'

export const useApiStore = defineStore('api', () => {
  // Fetch poetry (direct from external API)
  async function fetchPoetry() {
    try {
      const response = await fetch('https://v2.jinrishici.com/one.json?client=npm-sdk/1.0')
      if (!response.ok) throw new Error('Failed to fetch poetry')
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch poetry:', error)
      return null
    }
  }

  // Fetch hanzi list
  async function fetchHanziList(level = null) {
    const params = new URLSearchParams()
    if (level) params.append('level', level)
    const url = params.toString() ? `${API_BASE}/hanzi?${params}` : `${API_BASE}/hanzi`

    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch hanzi')
    return response.json()
  }

  // Fetch hanzi detail
  async function fetchHanziDetail(word) {
    const response = await fetch(`${API_BASE}/hanzi/${encodeURIComponent(word)}`)
    if (!response.ok) throw new Error('Failed to fetch hanzi detail')
    return response.json()
  }

  // Fetch hanzi levels
  async function fetchHanziLevels() {
    const response = await fetch(`${API_BASE}/hanzi/levels`)
    if (!response.ok) throw new Error('Failed to fetch levels')
    return response.json()
  }

  // Fetch handwritten list
  async function fetchHandwrittenList(level = null) {
    const params = new URLSearchParams()
    if (level) params.append('level', level)
    const url = params.toString() ? `${API_BASE}/handwritten?${params}` : `${API_BASE}/handwritten`

    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch handwritten')
    return response.json()
  }

  // Fetch handwritten detail
  async function fetchHandwrittenDetail(word) {
    const response = await fetch(`${API_BASE}/handwritten/${encodeURIComponent(word)}`)
    if (!response.ok) throw new Error('Failed to fetch handwritten detail')
    return response.json()
  }

  // Fetch handwritten levels
  async function fetchHandwrittenLevels() {
    const response = await fetch(`${API_BASE}/handwritten/levels`)
    if (!response.ok) throw new Error('Failed to fetch levels')
    return response.json()
  }

  // Fetch grammar list
  async function fetchGrammarList(level = null) {
    const params = new URLSearchParams()
    if (level) params.append('level', level)
    const url = params.toString() ? `${API_BASE}/grammar?${params}` : `${API_BASE}/grammar`

    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch grammar')
    return response.json()
  }

  // Fetch grammar levels
  async function fetchGrammarLevels() {
    const response = await fetch(`${API_BASE}/grammar/levels`)
    if (!response.ok) throw new Error('Failed to fetch levels')
    return response.json()
  }

  // Fetch user favorites (cloud only)
  async function fetchFavorites(userId) {
    const response = await fetch(`${API_BASE}/favorites?user=${userId}`)
    if (!response.ok) throw new Error('Failed to fetch favorites')
    return response.json()
  }

  // Add favorite (cloud only)
  async function addFavorite(userId, type, itemId) {
    const response = await fetch(`${API_BASE}/favorites?user=${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_type: type, item_id: itemId })
    })
    if (!response.ok) throw new Error('Failed to add favorite')
    return response.json()
  }

  // Remove favorite (cloud only)
  async function removeFavorite(userId, type, itemId) {
    const response = await fetch(
      `${API_BASE}/favorites?user=${userId}&item_type=${type}&item_id=${itemId}`,
      { method: 'DELETE' }
    )
    if (!response.ok) throw new Error('Failed to remove favorite')
    return response.json()
  }

  // Sync favorites from cloud
  async function syncFavoritesFromCloud(userId) {
    try {
      const cloudFavorites = await fetchFavorites(userId)
      return cloudFavorites.map(f => ({
        item_type: f.item_type,
        item_id: f.item_id,
        created_at: f.created_at
      }))
    } catch (error) {
      console.error('Failed to sync favorites:', error)
      return null
    }
  }

  // Sync visited from cloud
  async function syncVisitedFromCloud(userId) {
    try {
      const response = await fetch(`${API_BASE}/visited?user=${userId}`)
      if (!response.ok) throw new Error('Failed to fetch visited')
      return await response.json()
    } catch (error) {
      console.error('Failed to sync visited:', error)
      return null
    }
  }

  // Add visited to cloud
  async function addVisitedToCloud(userId, itemType, itemId) {
    try {
      const response = await fetch(`${API_BASE}/visited?user=${userId}&item_type=${itemType}&item_id=${itemId}`, {
        method: 'POST'
      })
      if (!response.ok) throw new Error('Failed to add visited')
      return await response.json()
    } catch (error) {
      console.error('Failed to add visited to cloud:', error)
      return null
    }
  }

  return {
    fetchPoetry,
    fetchHanziList,
    fetchHanziDetail,
    fetchHanziLevels,
    fetchHandwrittenList,
    fetchHandwrittenDetail,
    fetchHandwrittenLevels,
    fetchGrammarList,
    fetchGrammarLevels,
    fetchFavorites,
    addFavorite,
    removeFavorite,
    syncFavoritesFromCloud,
    syncVisitedFromCloud,
    addVisitedToCloud,
  }
})