import { ref } from "vue";
import { defineStore } from "pinia";

const TOKEN_STORAGE_KEY = "studio_admin_token";

const STUDIO_ID_STORAGE_KEY = "studio_admin_studio_id";

function loadToken() {
  return (
    localStorage.getItem(TOKEN_STORAGE_KEY) ||
    sessionStorage.getItem(TOKEN_STORAGE_KEY) ||
    ""
  );
}

function loadStudioId() {
  const val =
    localStorage.getItem(STUDIO_ID_STORAGE_KEY) ||
    sessionStorage.getItem(STUDIO_ID_STORAGE_KEY);
  return val ? parseInt(val) : null;
}

export const useUserStore = defineStore("user", () => {
  const token = ref(loadToken());
  const studioId = ref(loadStudioId());

  function setToken(nextToken, options = {}) {
    const {
      persist = true,
      storage = "local",
      studioId: nextStudioId = null,
    } = options;

    token.value = nextToken || "";
    studioId.value = nextStudioId;

    if (!persist) return;

    if (!token.value) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(STUDIO_ID_STORAGE_KEY);
      sessionStorage.removeItem(STUDIO_ID_STORAGE_KEY);
      return;
    }

    if (storage === "session") {
      sessionStorage.setItem(TOKEN_STORAGE_KEY, token.value);
      if (studioId.value)
        sessionStorage.setItem(STUDIO_ID_STORAGE_KEY, studioId.value);

      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(STUDIO_ID_STORAGE_KEY);
      return;
    }

    localStorage.setItem(TOKEN_STORAGE_KEY, token.value);
    if (studioId.value)
      localStorage.setItem(STUDIO_ID_STORAGE_KEY, studioId.value);
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(STUDIO_ID_STORAGE_KEY);
  }

  function logout() {
    token.value = "";
    studioId.value = null;
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(STUDIO_ID_STORAGE_KEY);
    sessionStorage.removeItem(STUDIO_ID_STORAGE_KEY);
  }

  return { token, studioId, setToken, logout };
});
