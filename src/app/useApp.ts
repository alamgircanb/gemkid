import { useSyncExternalStore } from 'react';
import { store, type AppState } from './store.ts';

export function useApp(): AppState {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}
