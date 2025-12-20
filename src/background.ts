import { onValidate } from '@/hooks/useValidate';
import { emit, watch } from '@/utils/event';
import { getBase64 } from '@/utils/getBase64';
import { getCurTab, getTabs } from '@/utils/tab';
import dayjs from 'dayjs';
import { bgUtils, initStore, setStore } from './store';

// 设置 store
chrome.storage.session.setAccessLevel({
  accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS',
});

const onInit = initStore();
let hasLock = false;
let onUnlock = () => {};

watch({
  ...bgUtils,
  onInit: () => onInit,
  onLock: () => (hasLock = true),
  onUnlock: () => {
    hasLock = false;
    onUnlock();
  },

  getCurTab: (_, sender) => sender.tab || getCurTab(),
  getTabs,
  getBase64,
  createTab: (url) => chrome.tabs.create({ url }),
  toggleSide: () => {
    getCurTab(({ windowId }) => {
      chrome.sidePanel.open({ windowId });
      emit('side', `closeSide_${windowId}`);
    });
  },
});

// 检查 active
onInit.then(({ authKey }) => {
  onValidate(authKey)
    .then((data) => {
      const onRun = () => setStore({ authData: data });
      hasLock ? (onUnlock = onRun) : onRun();
    })
    .catch(() => {});
});

// 监听 首次安装
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    onInit
      .then(() => {
        const authKey = +dayjs().add(3, 'day');
        const onRun = () => setStore({ authKey, authData: { trial: true } });
        hasLock ? (onUnlock = onRun) : onRun();
      })
      .catch(() => {});
  }
});

// 监听 sidePanel
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// 监听 快捷键
chrome.commands.onCommand.addListener((command, tab) => {
  if (!tab) return;
  if (command === 'toggle-tabs') {
    return emit('tab', 'togglePop', 'tabs');
  }
  if (command === 'toggle-bookmarks') {
    return emit('tab', 'togglePop', 'bookmarks');
  }
  if (command === 'toggle-add') {
    return emit('tab', 'togglePop', 'add');
  }
});
