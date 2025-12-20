export type Pos = 'bg' | 'side' | 'tab';

export type Tab = chrome.tabs.Tab;
export type MessageSender = chrome.runtime.MessageSender;

export type LicenseData = {
  trial?: boolean; // for free trial, not in lemonsquezzy api
  error?: null | string;
  instance?: null | {
    created_at: string;
    id: string;
    name: string;
  };
  license_key?: null | {
    activation_limit: number;
    activation_usage: number;
    created_at: string;
    expires_at: null | string;
    id: number;
    key: string;
    status: 'inactive' | 'active' | 'expired' | 'disabled';
    test_mode: boolean;
  };
  meta?: null | {
    customer_email: string;
    customer_id: number;
    customer_name: string;
    order_id: number;
    order_item_id: number;
    store_id: number;
    product_id: number;
    product_name: string;
    storage_id: number;
    variant_id: number;
    variant_name: string;
  };
};
