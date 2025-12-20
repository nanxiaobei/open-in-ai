import { createContext, use } from 'react';
import { type LicenseData } from './types';
import { env } from './utils/env';
import { emit } from './utils/event';

export type PopType =
  | 'copy'
  | 'google'
  | 'bing'
  | 'duckduckgo'
  | 'chatgpt'
  | 'claude'
  | 'perplexity';

type SyncData = typeof syncData;
export type StateData = typeof stateData;
export type RefsData = typeof refsData;
export type StoreData = StateData & RefsData;

export type HistoryData = Omit<SyncData, 'authKey'>;

export const historyResetData = {
  popList: [
    'copy',
    'google',
    'bing',
    'duckduckgo',
    'chatgpt',
    'claude',
    'perplexity',
  ] as PopType[],
  popMap: {
    copy: true,
    google: true,
    bing: false,
    duckduckgo: false,
    chatgpt: true,
    claude: false,
    perplexity: false,
  },
  popLarge: false,
  popDark: false,
  popText: false,
  popUppercase: false,
};

export const nameMap: Record<PopType, string> = {
  copy: 'Copy',
  google: 'Google',
  bing: 'Bing',
  duckduckgo: 'DuckDuckGo',
  chatgpt: 'ChatGPT',
  claude: 'Claude',
  perplexity: 'Perplexity',
};

export const urlMap: Record<Exclude<PopType, 'copy'>, string> = {
  google: 'https://www.google.com/search?q=',
  bing: 'https://www.bing.com/search?q=',
  duckduckgo: 'https://duckduckgo.com/?q=',
  chatgpt: 'https://chatgpt.com/?prompt=',
  claude: 'https://claude.ai/new?q=',
  perplexity: 'https://www.perplexity.ai/search?q=',
};

const syncData: {
  authKey: number | string;
  // history
  popList: PopType[];
  popMap: Record<PopType, boolean>;
  popLarge: boolean;
  popDark: boolean;
  popText: boolean;
  popUppercase: boolean;
} = {
  authKey: 0,
  ...historyResetData,
};

export const stateData: SyncData & {
  isDone: boolean;
  authData: null | LicenseData;
} = {
  ...syncData,
  isDone: false,
  authData: null,
};

export const refsData: {
  historyList: HistoryData[];
  historyIndex: number;
} = {
  historyList: [],
  historyIndex: -1,
};

const storeData: StoreData = {
  ...stateData,
  ...refsData,
};

const { authKey, ...rawHistory } = syncData;
export const historyKeys = Object.keys(rawHistory) as (keyof HistoryData)[];

let hasMemo = false;
let storageTimer: ReturnType<typeof setTimeout>;
let storePartial: Partial<StoreData> = {};
let syncPartial: Partial<SyncData> = {};

export const bgUtils = {
  getMemo: () => [hasMemo, storeData],
  setMemo: (partial: Partial<StoreData>) => {
    Object.assign(storeData, partial);
    hasMemo = true;
    return storeData;
  },
  setStorage: (partial: Partial<StoreData>) => {
    bgUtils.setMemo(partial);

    Object.assign(storePartial, partial);
    const keys = Object.keys(partial);
    for (const key of keys) {
      if (key in syncData) {
        (syncPartial as Record<string, unknown>)[key] = (
          partial as Record<string, unknown>
        )[key];
      }
    }

    clearTimeout(storageTimer);
    storageTimer = setTimeout(() => {
      chrome.storage.session.set(storePartial);
      chrome.storage.sync.set(syncPartial);
      storePartial = {};
      syncPartial = {};
    }, 1000);
  },
};

const emitBg = async (name: keyof typeof bgUtils, arg?: unknown) => {
  return env.isBg ? bgUtils[name](arg as never) : await emit('bg', name, arg);
};

export const initStore = async () => {
  const state = await chrome.storage.sync.get();
  state.popList = [
    ...new Set(Object.assign([], syncData.popList, state.popList)),
  ];
  state.popMap = Object.assign({}, syncData.popMap, state.popMap);
  const data = bgUtils.setMemo(state);
  chrome.storage.session.set(data);
  return data;
};

export const getStore = async () => {
  const [has, data] = await emitBg('getMemo');
  if (!has) {
    const prev = await chrome.storage.session.get();
    return await emitBg('setMemo', prev);
  }
  return data;
};

export const setStore = (partial: Partial<StoreData>, envId?: string) => {
  emit('tab', 'setSingle', partial, true, envId);
  emit('side', 'setSingle', partial, undefined, envId);
  emitBg('setStorage', partial);
};

export const StoreContext = createContext(
  {} as {
    windowId: number;
    state: StateData;
    refs: RefsData;
    setData: (partial: Partial<StoreData>) => void;
    setHistory: (payload: Partial<HistoryData>) => void;
  },
);

export const useStore = () => use(StoreContext);
