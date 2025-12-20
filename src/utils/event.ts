import { MessageSender, type Pos } from '@/types';
import { env } from './env';
import { getCurTab, getTabs } from './tab';

type Params = {
  from: Pos;
  to: Pos;
  name: string;
  data?: unknown;
  allTabs?: boolean;
  envId?: string;
};

const getList: typeof getTabs = env.isSide
  ? (all) => emit('bg', 'getTabs', all)
  : (all) => getTabs(all);

export const emit = async (
  to: Params['to'],
  name: Params['name'],
  data?: Params['data'],
  allTabs?: Params['allTabs'],
  envId?: Params['envId'],
) => {
  const from = env.pos;

  try {
    const params = { from, to, name, data, allTabs, envId };
    if (to === 'tab' && typeof chrome.tabs !== 'undefined') {
      if (typeof allTabs !== 'undefined') {
        const arr = await getList(allTabs);
        const pro = arr.map((tab) => chrome.tabs.sendMessage(tab.id!, params));
        const res = await Promise.allSettled(pro);
        return res.map((e) => (e.status === 'fulfilled' ? e.value : null));
      } else {
        const tab = await getCurTab();
        return await chrome.tabs.sendMessage(tab.id!, params);
      }
    }
    return await chrome.runtime.sendMessage(params);
  } catch (err) {
    return (err as Record<string, unknown>)?.undefined;
  }
};

const posMap: Record<string, any> = {};

export const watch = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  obj: Record<Params['name'], (data: any, sender: MessageSender) => any>,
) => {
  const myPos = env.pos;
  const myId = env.id;

  if (!(myPos in posMap)) {
    posMap[myPos] = {};
  }

  Object.assign(posMap[myPos], obj);

  const listener = (
    { from, to, name, data, allTabs, envId }: Params,
    sender: chrome.runtime.MessageSender,
    sendResponse: (res?: unknown) => void,
  ) => {
    if (myPos === to) {
      if (myId !== envId) {
        const handler = posMap[myPos][name];
        if (handler) {
          (async () => sendResponse(await handler(data, sender)))();
          return true;
        } else if (process.env.NODE_ENV === 'development' && myPos !== 'side') {
          console.error(`can not find '${name}' in '${myPos}'`);
        }
      }
    } else if (myPos === 'bg' && from === to) {
      (async () => sendResponse(await emit(to, name, data, allTabs, envId)))();
      return true;
    }
  };

  chrome.runtime.onMessage.addListener(listener);
  return () => {
    chrome.runtime.onMessage.removeListener(listener);
  };
};
