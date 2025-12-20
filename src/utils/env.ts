const id = crypto.randomUUID();

export const env = {
  pos: '',
  id,
  isBg: false,
  isSide: false,
  isTab: false,
};

if (location.protocol === 'chrome-extension:') {
  if (location.pathname.includes('sidepanel')) {
    env.pos = 'side';
    env.isSide = true;
  } else {
    env.pos = 'bg';
    env.isBg = true;
  }
} else {
  env.pos = 'tab';
  env.isTab = true;
}
