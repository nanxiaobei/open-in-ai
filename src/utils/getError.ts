import { PRODUCT_ID, STORE_ID } from '@/config.ts';
import { LicenseData } from '@/types.ts';

const KEY_IS = 'This license key is';

export const getError = (data: LicenseData) => {
  const isMatch =
    data.meta?.store_id === STORE_ID && data.meta?.product_id === PRODUCT_ID;

  if (!isMatch) {
    return `${KEY_IS} invalid.`;
  }

  if (data.error) {
    return data.error;
  }

  const status = data.license_key?.status;
  if (status !== 'active') {
    return `${KEY_IS} ${status || 'invalid'}.`;
  }

  return null; // is valid
};
