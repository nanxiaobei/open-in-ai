import { BRAND_NAME, TRIAL_ENDED } from '@/config';
import { type StateData, useStore } from '@/store';
import { type LicenseData } from '@/types';
import { fetchApi } from '@/utils/fetchApi';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useRef } from 'react';

export const onValidate = async (authKey: StateData['authKey']) => {
  if (!authKey) {
    return Promise.reject();
  }

  let data;

  if (typeof authKey === 'string') {
    data = await fetchApi<LicenseData>('POST /v1/licenses/validate', {
      license_key: authKey,
      instance_name: BRAND_NAME,
    });
  } else {
    const isAuthed = +dayjs() < +dayjs(authKey);
    data = isAuthed ? { trial: true } : { error: TRIAL_ENDED };
  }

  return data;
};

export const useValidate = () => {
  const { state, setData } = useStore();
  const { authKey, authData } = state;

  const { data } = useQuery({
    queryKey: ['license'],
    queryFn: () => onValidate(authKey),
  });

  const dataRef = useRef(data);

  if (dataRef.current !== data) {
    dataRef.current = data;
    if (JSON.stringify(data) !== JSON.stringify(authData)) {
      setData({ authData: data });
    }
  }
};
