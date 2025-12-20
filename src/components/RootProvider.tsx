import { useUndoRedo } from '@/hooks/useUndoRedo.ts';
import { useValidate } from '@/hooks/useValidate';
import {
  HistoryData,
  refsData,
  setStore,
  stateData,
  type StateData,
  StoreContext,
  StoreData,
} from '@/store';
import { env } from '@/utils/env.ts';
import { emit, watch } from '@/utils/event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence } from 'motion/react';
import { ReactNode } from 'react';
import resso from 'resso';

const state = resso<StateData>(stateData);
const refs = refsData;

let rawStore: StoreData;
let windowId: number;

const setSingle = (partial: Partial<StoreData>) => {
  const next = { ...partial } as Record<string, unknown>;
  const keys = Object.keys(next);
  let count = keys.length;
  for (const key of keys) {
    if (key in refsData) {
      count--;
      (refs as Record<string, unknown>)[key] = next[key];
      delete next[key];
    }
  }
  if (count > 0) {
    state(next);
  }
};

watch({ setSingle });

const setData = (partial: Partial<StoreData>) => {
  setSingle(partial);
  setStore(partial, env.id);
};

const setHistory = async (partial: Partial<HistoryData>) => {
  setData(partial);
  const { historyList, historyIndex } = refs;
  const prev = historyList[historyIndex];

  let newIndex = historyIndex + 1;
  let newList = historyList.slice(0, newIndex);
  newList.push({ ...prev, ...partial });

  if (newList.length > 20) {
    newList = newList.slice(newList.length - 20);
    newIndex = newList.length - 1;
  }

  setData({
    historyList: newList,
    historyIndex: newIndex,
  });
};

Promise.all([emit('bg', 'onInit'), emit('bg', 'getCurTab')]).then(
  ([next, curTab]) => {
    emit('bg', 'onLock');

    rawStore = { ...next };
    windowId = curTab.windowId;
    next.isDone = true;

    setData(next);
    emit('bg', 'onUnlock');
  },
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

export const RootProvider = ({ children }: { children: ReactNode }) => {
  const { isDone } = state;

  if (isDone) {
    return (
      <QueryClientProvider client={queryClient}>
        <AnimatePresence initial={false}>
          <StoreContext value={{ windowId, state, refs, setData, setHistory }}>
            <Hooks />
            {children}
          </StoreContext>
        </AnimatePresence>
      </QueryClientProvider>
    );
  }
};

const Hooks = () => {
  useValidate();
  useUndoRedo(rawStore, refs, setData);

  return null;
};
