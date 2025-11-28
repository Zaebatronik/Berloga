import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Listing, Chat, Language } from '@/types';

// Версия хранилища - при изменении все пользователи будут разлогинены
const STORAGE_VERSION = 2; // Увеличили с 1 до 2 для сброса сессий

interface AppState {
  // User
  user: User | null;
  isRegistered: boolean;
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  clearUser: () => void;

  // Language
  language: Language;
  setLanguage: (lang: Language) => void;

  // Listings
  listings: Listing[];
  setListings: (listings: Listing[]) => void;
  addListing: (listing: Listing) => void;
  updateListing: (id: string, updates: Partial<Listing>) => void;
  deleteListing: (id: string) => void;

  // Favorites
  favorites: string[];
  addToFavorites: (listingId: string) => void;
  removeFromFavorites: (listingId: string) => void;
  isFavorite: (listingId: string) => boolean;

  // Chats
  chats: Chat[];
  setChats: (chats: Chat[]) => void;
  addChat: (chat: Chat) => void;
  updateChat: (chatId: string, updates: Partial<Chat>) => void;

  // All registered users (for admin)
  allUsers: User[];
  addUserToRegistry: (user: User) => void;

  // Filters
  filters: {
    category: string;
    minPrice: number | null;
    maxPrice: number | null;
    searchQuery: string;
  };
  setFilters: (filters: Partial<AppState['filters']>) => void;
  resetFilters: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // User
      user: null,
      isRegistered: false,
      setUser: (user) => set({ user, isRegistered: true }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      clearUser: () => set({ user: null, isRegistered: false }),

      // Language
      language: 'ru',
      setLanguage: (lang) => set({ language: lang }),

      // Listings
      listings: [],
      setListings: (listings) => set({ listings }),
      addListing: (listing) =>
        set((state) => ({ listings: [...state.listings, listing] })),
      updateListing: (id, updates) =>
        set((state) => ({
          listings: state.listings.map((l) =>
            l.id === id ? { ...l, ...updates } : l
          ),
        })),
      deleteListing: (id) =>
        set((state) => ({
          listings: state.listings.filter((l) => l.id !== id),
        })),

      // Favorites
      favorites: [],
      addToFavorites: (listingId) =>
        set((state) => ({
          favorites: [...state.favorites, listingId],
        })),
      removeFromFavorites: (listingId) =>
        set((state) => ({
          favorites: state.favorites.filter((id) => id !== listingId),
        })),
      isFavorite: (listingId) => get().favorites.includes(listingId),

      // Chats
      chats: [],
      setChats: (chats) => set({ chats }),
      addChat: (chat) => set((state) => ({ chats: [...state.chats, chat] })),
      updateChat: (chatId, updates) =>
        set((state) => ({
          chats: state.chats.map((c) =>
            c.id === chatId ? { ...c, ...updates } : c
          ),
        })),

      // All registered users
      allUsers: [],
      addUserToRegistry: (user) =>
        set((state) => {
          // Проверяем что пользователь еще не добавлен
          const exists = state.allUsers.some((u) => u.id === user.id);
          if (exists) return state;
          return { allUsers: [...state.allUsers, user] };
        }),

      // Filters
      filters: {
        category: 'all',
        minPrice: null,
        maxPrice: null,
        searchQuery: '',
      },
      setFilters: (filters) =>
        set((state) => ({ filters: { ...state.filters, ...filters } })),
      resetFilters: () =>
        set({
          filters: {
            category: 'all',
            minPrice: null,
            maxPrice: null,
            searchQuery: '',
          },
        }),
    }),
    {
      name: 'kupyprodai-storage',
      version: STORAGE_VERSION,
      // При изменении версии - очищаем все данные
      migrate: (persistedState: any, version: number) => {
        if (version !== STORAGE_VERSION) {
          console.log(`🔄 Версия изменилась (${version} → ${STORAGE_VERSION}), очищаем данные...`);
          return {
            user: null,
            isRegistered: false,
            language: 'ru',
            listings: [],
            favorites: [],
            chats: [],
            allUsers: [],
            filters: {
              category: 'all',
              minPrice: null,
              maxPrice: null,
              searchQuery: '',
            },
          };
        }
        return persistedState;
      },
      // Обработка ошибок переполнения localStorage
      storage: {
        getItem: (name) => {
          try {
            const str = localStorage.getItem(name);
            return str ? JSON.parse(str) : null;
          } catch (e) {
            console.error('❌ Ошибка чтения из localStorage:', e);
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            localStorage.setItem(name, JSON.stringify(value));
          } catch (e) {
            console.error('❌ Ошибка записи в localStorage (возможно переполнен):', e);
            // Очищаем старые объявления если переполнен
            if (e instanceof Error && e.message.includes('quota')) {
              console.warn('⚠️ localStorage переполнен! Очищаем старые данные...');
              try {
                const currentState = JSON.parse(localStorage.getItem(name) || '{}');
                // Сохраняем только пользователя и избранное, без объявлений
                const cleanState = {
                  state: {
                    user: currentState.state?.user,
                    isRegistered: currentState.state?.isRegistered,
                    favorites: currentState.state?.favorites,
                    language: currentState.state?.language,
                    allUsers: currentState.state?.allUsers,
                    listings: [], // Очищаем объявления
                    chats: [], // Очищаем чаты
                    filters: currentState.state?.filters
                  },
                  version: currentState.version
                };
                localStorage.setItem(name, JSON.stringify(cleanState));
                console.log('✅ localStorage очищен, пробуем снова...');
                // Пробуем сохранить снова
                localStorage.setItem(name, JSON.stringify(value));
              } catch (cleanError) {
                console.error('❌ Не удалось очистить localStorage:', cleanError);
              }
            }
          }
        },
        removeItem: (name) => {
          try {
            localStorage.removeItem(name);
          } catch (e) {
            console.error('❌ Ошибка удаления из localStorage:', e);
          }
        },
      },
    }
  )
);
