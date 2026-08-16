// Global type augmentations for Webbender Playwright E2E tests

interface WebbenderDialogTestState {
  promptCalls: Array<{ message: string; defaultValue: string }>;
  displayDuringDialog: {
    alert: string | null;
    confirm: string | null;
    prompt: string | null;
  };
  finalDisplay: string | null;
  ready: boolean;
  cleanup: () => void;
}

declare global {
  interface Window {
    // Dialog interception state used by E2E tests
    dialogTestState: WebbenderDialogTestState;

    // Tool toggle functions exposed for testing
    _webbenderToggleTextEdit?: (forceState?: boolean) => void;
    _webbenderToggleRemove?: (forceState?: boolean) => void;
    _webbenderToggleSelect?: (forceState?: boolean) => void;
    _webbenderToggleBold?: () => void;
    _webbenderToggleItalic?: () => void;
    _webbenderToggleXray?: (forceState?: boolean) => void;

    // Runtime state exposed for testing
    _webbenderTextEditMode?: boolean;
    _webbenderSelectionTargets?: Element[];
  }

  // SVGElement is missing `click()` in some TS lib versions; re-declare it.
  interface SVGElement {
    click(): void;
  }
}

export {};
