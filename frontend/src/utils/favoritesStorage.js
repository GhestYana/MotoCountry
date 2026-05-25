import { normalizeProductCategory } from './productCategory';

const GUEST_KEY = 'guestFavorites';
const USER_CACHE_PREFIX = 'userFavorites_';
const LEGACY_KEY = 'favorites';

function migrateLegacyFavorites() {
  const legacy = localStorage.getItem(LEGACY_KEY);
  if (!legacy) return;
  if (!localStorage.getItem(GUEST_KEY)) {
    localStorage.setItem(GUEST_KEY, legacy);
  }
  localStorage.removeItem(LEGACY_KEY);
}
migrateLegacyFavorites();

export function isAuthenticated() {
  return !!(localStorage.getItem('token') && getAuthUserId());
}

export function getAuthUserId() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user?.id) return user.id;
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1])).id ?? null;
  } catch {
    return null;
  }
}

export function getGuestFavorites() {
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY)) || [];
  } catch {
    return [];
  }
}

export function setGuestFavorites(favorites, emit = true) {
  localStorage.setItem(GUEST_KEY, JSON.stringify(favorites));
  if (emit) window.dispatchEvent(new Event('favoritesUpdated'));
}

export function getUserFavoritesCache(userId) {
  if (!userId) return [];
  try {
    return JSON.parse(localStorage.getItem(`${USER_CACHE_PREFIX}${userId}`)) || [];
  } catch {
    return [];
  }
}

export function setUserFavoritesCache(userId, favorites, emit = true) {
  if (!userId) return;
  localStorage.setItem(`${USER_CACHE_PREFIX}${userId}`, JSON.stringify(favorites));
  if (emit) window.dispatchEvent(new Event('favoritesUpdated'));
}

/** Кеш обраного акаунта (не показується після виходу) */
export function clearUserFavoritesCache(userId = getAuthUserId()) {
  if (userId) {
    localStorage.removeItem(`${USER_CACHE_PREFIX}${userId}`);
  } else {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(USER_CACHE_PREFIX)) localStorage.removeItem(key);
    });
  }
  localStorage.removeItem(LEGACY_KEY);
  window.dispatchEvent(new Event('favoritesUpdated'));
}

export function setFavorites(favorites) {
  if (isAuthenticated()) {
    setUserFavoritesCache(getAuthUserId(), favorites);
  } else {
    setGuestFavorites(favorites);
  }
}

export function mergeFavorites(serverList, localList) {
  const merged = new Map();
  [...(Array.isArray(localList) ? localList : []), ...(Array.isArray(serverList) ? serverList : [])].forEach((item) => {
    if (item?.id != null) merged.set(`${normalizeProductCategory(item.category) || 'unknown'}:${String(item.id)}`, item);
  });
  return Array.from(merged.values());
}

export function isProductFavorite(productId, category) {
  const normalizedCategory = normalizeProductCategory(category);
  return getFavorites().some((fav) => (
    String(fav.id) === String(productId)
    && (!normalizedCategory || normalizeProductCategory(fav.category) === normalizedCategory)
  ));
}

/** Поточний список для UI: гість — localStorage, авторизований — кеш + гостеве (до злиття) */
export function getFavorites() {
  if (isAuthenticated()) {
    const userId = getAuthUserId();
    return mergeFavorites(getUserFavoritesCache(userId), getGuestFavorites());
  }
  return getGuestFavorites();
}

async function uploadFavoritesList(list, token) {
  if (!list.length) return;
  await Promise.all(
    list.map(async (item) => {
      const cat = normalizeProductCategory(item.category);
      if (!cat) return;
      try {
        await fetch('/api/favorites/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ prodId: item.id, category: cat }),
        });
      } catch {
        /* best effort */
      }
    })
  );
}

async function fetchFavoritesFromServer(token) {
  const res = await fetch('/api/favorites', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    clearUserFavoritesCache();
    window.dispatchEvent(new Event('authUpdated'));
    return [];
  }

  if (!res.ok) return [];
  const serverData = await res.json();
  return Array.isArray(serverData) ? serverData : [];
}

/** Злити гостеве + серверне, зберегти в кеш користувача */
function applyMergedFavorites(serverList, guestList, userId) {
  const merged = mergeFavorites(serverList, guestList);
  setUserFavoritesCache(userId, merged, false);
  if (guestList.length > 0) setGuestFavorites([], false);
  return merged;
}

/** Завантажити обране з сервера та об'єднати з гостевим localStorage */
export async function syncFavoritesFromServer(token = localStorage.getItem('token')) {
  if (!token) return [];

  const userId = getAuthUserId();
  if (!userId) return [];

  const guest = getGuestFavorites();

  try {
    const serverList = await fetchFavoritesFromServer(token);
    return applyMergedFavorites(serverList, guest, userId);
  } catch {
    return applyMergedFavorites([], guest, userId);
  }
}

export async function onLoginFavorites(token) {
  const guest = [...getGuestFavorites()];

  if (guest.length > 0) {
    await uploadFavoritesList(guest, token);
  }

  return syncFavoritesFromServer(token);
}

export function onLogoutFavorites() {
  clearUserFavoritesCache();
}
