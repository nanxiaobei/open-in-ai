import {
  historyKeys,
  type HistoryData,
  type RefsData,
  type StoreData,
} from '@/store';
import { useEffect } from 'react';

export const useUndoRedo = (
  rawStore: StoreData,
  refs: RefsData,
  setData: (partial: Partial<StoreData>) => void,
) => {
  if (refs.historyList.length === 0) {
    refs.historyList = [{} as HistoryData];
    for (const key of historyKeys) {
      (refs.historyList[0] as Record<string, unknown>)[key] = rawStore[key];
    }
    setData({ historyList: refs.historyList, historyIndex: 0 });
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const cmdKey = event.ctrlKey || event.metaKey;
      const zKey = event.key.toLowerCase() === 'z';

      if (cmdKey && zKey) {
        const { historyList, historyIndex } = refs;
        let isUndo;
        let isRedo;

        if (!event.shiftKey && historyIndex > 0) {
          isUndo = true;
        } else if (event.shiftKey && historyIndex < historyList.length - 1) {
          isRedo = true;
        }

        if (isUndo || isRedo) {
          event.preventDefault();
          const newIndex = historyIndex + (isUndo ? -1 : 1);

          const data = historyList[newIndex];
          setData({ ...data, historyIndex: newIndex });
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [refs, setData]);
};
