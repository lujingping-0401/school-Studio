import { ref } from 'vue'
import { defineStore } from 'pinia'

const TOKEN_STORAGE_KEY = 'studio_admin_token'

function loadToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY) || sessionStorage.getItem(TOKEN_STORAGE_KEY) || ''
}

export const useUserStore = defineStore('user', () => {
  const token = ref(loadToken())

  function setToken(nextToken, options = {}) {
    const { persist = true, storage = 'local' } = options

    token.value = nextToken || ''

    if (!persist) return

    if (!token.value) {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
      sessionStorage.removeItem(TOKEN_STORAGE_KEY)
      return
    }

    if (storage === 'session') {
      sessionStorage.setItem(TOKEN_STORAGE_KEY, token.value)
      localStorage.removeItem(TOKEN_STORAGE_KEY)
      return
    }

    localStorage.setItem(TOKEN_STORAGE_KEY, token.value)
    sessionStorage.removeItem(TOKEN_STORAGE_KEY)
  }

  function logout() {
    token.value = ''
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    sessionStorage.removeItem(TOKEN_STORAGE_KEY)
  }

  return { token, setToken, logout }
})
