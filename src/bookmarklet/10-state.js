function wbInitState() {
  const ID = 'webbender-ui';
  const STORAGE_KEY = 'webbender-settings';
  const VERSION = '__WEBBENDER_VERSION__';
  const VERSION_URL = 'https://webbender.web.app/version.json';

  const existing = document.getElementById(ID);
  if (existing) {
    existing.remove();
    return null;
  }

  const settings = {
    editMode: false,
    removeMode: false,
    customFont: '',
    theme: 'default',
  };

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      Object.assign(settings, JSON.parse(saved));
    }
  } catch (e) {
    console.warn('Failed to load webbender settings:', e);
  }

  function saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save webbender settings:', e);
    }
  }

  return {
    ID,
    STORAGE_KEY,
    VERSION,
    VERSION_URL,
    settings,
    saveSettings,
  };
}
