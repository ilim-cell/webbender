let hasUnsavedChanges = false;
let autosaveTimeout: number | null = null;

export function triggerAutosave() {
  hasUnsavedChanges = true;
  if (autosaveTimeout) {
    clearTimeout(autosaveTimeout);
  }

  autosaveTimeout = window.setTimeout(() => {
    console.log('Autosaving state...');
    // TODO: Capture DOM state and save to storage
  }, 1000);
}
