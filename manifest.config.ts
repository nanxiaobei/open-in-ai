import { defineManifest } from '@crxjs/vite-plugin';
import pkg from './package.json';
import { BRAND_NAME } from './src/config';

export default defineManifest({
  manifest_version: 3,
  name: `${BRAND_NAME} - One Click to Rule Them All!`,
  short_name: BRAND_NAME,
  version: pkg.version,
  description: '',
  icons: {
    48: 'public/logo.png',
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
