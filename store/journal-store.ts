import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, AuthChangeEvent } from '@supabase/supabase-js';
import { AppState } from 'react-native';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { MAX_MOOD_SELECTIONS, MoodType } from '~/app/journal/utils/constants';
import { supabase } from '~/utils/supabase';

export type Attachment = {
  uri: string;
  type: string;
  name: string;
};

interface JournalEntry {
  content: string;
  title: string;
  moods: string[];
  files?: Attachment[];
  id?: string;
  created_at?: string;
  updated_at?: string;
  synced?: boolean;
}

interface AuthState {
  session: Session | null;
  loading: boolean;
  initialized: boolean;
}

interface AuthActions {
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  signOut: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

interface SyncActions {
  syncToSupabase: (day: string) => Promise<void>;
  syncFromSupabase: () => Promise<void>;
  syncEntry: (day: string, entry: JournalEntry) => Promise<void>;
  setupRealtimeSync: () => void;
  cleanupRealtimeSync: () => void;
}

interface JournalStore extends AuthState, AuthActions, SyncActions {
  entries: Record<string, JournalEntry>;
  syncing: boolean;
  lastSync: string | null;
  realtimeChannel: any;
  setEntry: (
    day: string,
    content: string,
    title: string,
    moods: string[],
    files?: Attachment[]
  ) => void;
  setAttachments: (day: string, files: Attachment[]) => void;
  removeEntry: (day: string) => void;
  selectMood: (day: string, mood: MoodType) => void;
}

const _journalStore = create<JournalStore>()(
  persist(
    (set, get) => ({
      entries: {},
      session: null,
      loading: true,
      initialized: false,
      syncing: false,
      lastSync: null,
      realtimeChannel: null,
      setEntry: (day, content, title, moods, files) => {
        set((state) => ({
          entries: {
            ...state.entries,
            [day]: {
              content,
              title,
              moods,
              files: files ?? state.entries[day]?.files ?? [],
              id: state.entries[day]?.id,
              created_at: state.entries[day]?.created_at,
              updated_at: new Date().toISOString(),
              synced: false,
            },
          },
        }));

        // Auto-sync if authenticated
        const { session } = get();
        if (session) {
          get().syncToSupabase(day);
        }
      },
      setAttachments: (day, files) => {
        set((state) => ({
          entries: {
            ...state.entries,
            [day]: {
              ...state.entries[day],
              files,
              updated_at: new Date().toISOString(),
              synced: false,
            },
          },
        }));

        // Auto-sync if authenticated
        const { session } = get();
        if (session) {
          get().syncToSupabase(day);
        }
      },
      removeEntry: (day) =>
        set((state) => {
          const updatedEntries = { ...state.entries };
          delete updatedEntries[day];
          return { entries: updatedEntries };
        }),
      selectMood: (day, mood) =>
        set((state) => {
          const entry = state.entries[day] || { content: '', title: '', moods: [] };
          const moods = entry.moods.includes(mood.key)
            ? entry.moods.filter((key) => key !== mood.key)
            : entry.moods.length >= MAX_MOOD_SELECTIONS
              ? [...entry.moods.slice(1), mood.key]
              : [...entry.moods, mood.key];
          return {
            entries: {
              ...state.entries,
              [day]: { ...entry, moods },
            },
          };
        }),
      setSession: (session) => set({ session }),
      setLoading: (loading) => set({ loading }),
      setInitialized: (initialized) => set({ initialized }),
      signOut: async () => {
        await supabase.auth.signOut();
        set({ session: null });
      },
      initializeAuth: async () => {
        try {
          set({ loading: true });
          const {
            data: { session },
          } = await supabase.auth.getSession();
          set({ session, loading: false, initialized: true });

          supabase.auth.onAuthStateChange((_event, session) => {
            const prevSession = get().session;
            set({ session });

            // Setup/cleanup realtime based on auth state
            if (session && !prevSession) {
              // User just logged in
              get().syncFromSupabase();
              get().setupRealtimeSync();
            } else if (!session && prevSession) {
              // User just logged out
              get().cleanupRealtimeSync();
            }
          });

          AppState.addEventListener('change', (state) => {
            if (state === 'active') {
              supabase.auth.startAutoRefresh();
            } else {
              supabase.auth.stopAutoRefresh();
            }
          });

          // Sync data and setup realtime when user logs in
          if (session) {
            get().syncFromSupabase();
            get().setupRealtimeSync();
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({ loading: false, initialized: true });
        }
      },

      syncToSupabase: async (day: string) => {
        const { session, entries } = get();
        if (!session) return;

        const entry = entries[day];
        if (!entry || entry.synced) return;

        try {
          const entryData = {
            user_id: session.user.id,
            date: day,
            title: entry.title,
            content: entry.content,
            moods: entry.moods,
            files: entry.files || [],
          };

          if (entry.id) {
            // Update existing entry
            const { error } = await supabase
              .from('journal_entries')
              .update(entryData)
              .eq('id', entry.id);

            if (error) throw error;
          } else {
            // Create new entry
            const { data, error } = await supabase
              .from('journal_entries')
              .insert(entryData)
              .select()
              .single();

            if (error) throw error;

            // Update local entry with server ID
            set((state) => ({
              entries: {
                ...state.entries,
                [day]: {
                  ...state.entries[day],
                  id: data.id,
                  created_at: data.created_at,
                },
              },
            }));
          }

          // Mark as synced
          set((state) => ({
            entries: {
              ...state.entries,
              [day]: {
                ...state.entries[day],
                synced: true,
              },
            },
          }));
        } catch (error) {
          console.error('Error syncing to Supabase:', error);
        }
      },

      syncFromSupabase: async () => {
        const { session } = get();
        if (!session) return;

        try {
          set({ syncing: true });

          const { data, error } = await supabase
            .from('journal_entries')
            .select('*')
            .eq('user_id', session.user.id);

          if (error) throw error;

          // Convert server data to local format
          const serverEntries: Record<string, JournalEntry> = {};
          data.forEach((item) => {
            serverEntries[item.date] = {
              content: item.content,
              title: item.title,
              moods: item.moods,
              files: item.files,
              id: item.id,
              created_at: item.created_at,
              updated_at: item.updated_at,
              synced: true,
            };
          });

          // Merge with local entries (server takes precedence for synced data)
          set((state) => {
            const mergedEntries = { ...state.entries };

            Object.keys(serverEntries).forEach((day) => {
              const serverEntry = serverEntries[day];
              const localEntry = mergedEntries[day];

              // If no local entry or server is newer, use server data
              if (
                !localEntry ||
                (localEntry.synced &&
                  new Date(serverEntry.updated_at!) > new Date(localEntry.updated_at!))
              ) {
                mergedEntries[day] = serverEntry;
              }
            });

            return {
              entries: mergedEntries,
              lastSync: new Date().toISOString(),
            };
          });
        } catch (error) {
          console.error('Error syncing from Supabase:', error);
        } finally {
          set({ syncing: false });
        }
      },

      syncEntry: async (day: string, entry: JournalEntry) => {
        set((state) => ({
          entries: {
            ...state.entries,
            [day]: {
              ...entry,
              synced: true,
            },
          },
        }));
      },

      setupRealtimeSync: () => {
        const { session, realtimeChannel } = get();
        if (!session || realtimeChannel) return;

        const channel = supabase
          .channel('journal_entries_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'journal_entries',
              filter: `user_id=eq.${session.user.id}`,
            },
            (payload) => {
              console.log('Real-time change received:', payload);

              if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                const data = payload.new;
                set((state) => ({
                  entries: {
                    ...state.entries,
                    [data.date]: {
                      content: data.content,
                      title: data.title,
                      moods: data.moods,
                      files: data.files,
                      id: data.id,
                      created_at: data.created_at,
                      updated_at: data.updated_at,
                      synced: true,
                    },
                  },
                }));
              } else if (payload.eventType === 'DELETE') {
                const data = payload.old;
                set((state) => {
                  const updatedEntries = { ...state.entries };
                  delete updatedEntries[data.date];
                  return { entries: updatedEntries };
                });
              }
            }
          )
          .subscribe();

        set({ realtimeChannel: channel });
      },

      cleanupRealtimeSync: () => {
        const { realtimeChannel } = get();
        if (realtimeChannel) {
          supabase.removeChannel(realtimeChannel);
          set({ realtimeChannel: null });
        }
      },
    }),
    {
      name: 'journal-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        entries: state.entries,
      }),
    }
  )
);

export const useJournalStore = _journalStore;
export const journalStoreInstance = _journalStore;
