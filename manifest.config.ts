import { defineManifest } from '@crxjs/vite-plugin';
import { version } from './package.json';
import { BRAND_NAME } from './src/config';

export default defineManifest({
  manifest_version: 3,
  name: `${BRAND_NAME}`,
  short_name: BRAND_NAME,
  version,
  description:
    'Select text and click to search with your AI services, one click to rule them all!',
  icons: {
    48: 'icon.png',
  },
  action: {
    default_title: BRAND_NAME,
  },
  permissions: ['sidePanel', 'storage', 'activeTab', 'tabs'],
  host_permissions: ['<all_urls>'],
  content_scripts: [
    {
      js: ['src/content/main.tsx'],
      matches: ['http://*/*', 'https://*/*'],
    },
  ],
  side_panel: {
    default_path: 'src/sidepanel/index.html',
  },
  background: {
    service_worker: 'src/background.ts',
    type: 'module',
  },
  commands: {
    'toggle-side': {
      suggested_key: {
        default: 'Ctrl+E',
        mac: 'Command+E',
      },
      description: 'Toggle Side',
    },
  },
});
