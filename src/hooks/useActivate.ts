import { BRAND_NAME, REACH_LIMIT } from '@/config';
import { useStore } from '@/store';
import { type LicenseData } from '@/types';
import { confetti } from '@/utils/confetti';
import { emit } from '@/utils/event.ts';
import { fetchApi } from '@/utils/fetchApi';
import { getError } from '@/utils/getError';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

const onActivate = async (authKey: string) => {
  return await fetchApi<LicenseData>('POST /v1/licenses/activate', {
    license_key: authKey,
    instance_name: BRAND_NAME,
  });
};

export const useActivate = () => {
  const { setData } = useStore();

  const { isPending, mutate } = useMutation({
    mutationFn: (authKey: string) => onActivate(authKey),
    onSuccess: (data) => {
      const error = getError(data);

      if (error) {
        let action;
        if (error === REACH_LIMIT) {
          action = {
            label: 'Check ↗',
            onClick: () =>
              emit('bg', 'createTab', 'https://app.lemonsqueezy.com/my-orders'),
          };
        }
        toast.error(error, { action, duration: 3000 });
        return;
      }

      toast.success('Activated!');
      confetti({ origin: { y: 0.85 } });
      setData({ authKey: data.license_key?.key, authData: data });
    },
  });

  return { isPending, mutate };
};
