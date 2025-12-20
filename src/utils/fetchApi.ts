import { getError } from '@/utils/getError';
import qs from 'qs';
import { toast } from 'sonner';

// https://docs.lemonsqueezy.com/help/licensing/license-api#requests
export const fetchApi = async <T extends null | Record<string, unknown>>(
  mixApi: `${'GET' | 'POST'} /${string}`,
  params?: Record<string, unknown>,
): Promise<T> => {
  const [method, path] = mixApi.split(' ');

  const init: RequestInit = {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  };

  let newPath = path;

  if (params) {
    if (method === 'GET') {
      newPath = `${newPath}?${qs.stringify(params, { skipNulls: true })}`;
    } else {
      init.body = JSON.stringify(params);
    }
  }

  try {
    const response = await fetch(
      `https://api.lemonsqueezy.com${newPath}`,
      init,
    );

    const data = await response.json();
    const error = getError(data);

    return error ? { ...data, error } : data;
  } catch (err) {
    if (typeof chrome.tabs !== 'undefined') {
      const errMsg = (err as { message?: string }).message;
      toast.error(errMsg, { duration: 3000 });
    }
    return Promise.reject();
  }
};
