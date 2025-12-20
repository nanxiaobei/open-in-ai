import { Tab } from '@/types';

export const getTabs = async (allTabs?: boolean) => {
  return await chrome.tabs.query({
    currentWindow: allTabs ? undefined : true,
  });
};

export function getCurTab(callback: (tab: Tab) => void): void;
export function getCurTab(): Promise<Tab>;
export function getCurTab(callback?: (tab: Tab) => void): unknown {
  if (callback) {
    chrome.tabs.query({ currentWindow: true, active: true }, ([tab]) => {
      callback(tab);
    });
    return;
  }

  return chrome.tabs
    .query({ currentWindow: true, active: true })
    .then(([tab]) => tab);
}
