const historyStack: any[] = [];
let historyIndex = -1;

export function pushHistoryState(target: any, type: string, oldVal: any, newVal: any) {
  if (historyIndex < historyStack.length - 1) {
    historyStack.splice(historyIndex + 1);
  }
  historyStack.push({ target, type, oldVal, newVal });
  historyIndex++;
}

export function executeUndo() {
  if (historyIndex < 0) return;
  console.log('Undoing action...');
  historyIndex--;
}

export function executeRedo() {
  if (historyIndex >= historyStack.length - 1) return;
  historyIndex++;
  console.log('Redoing action...');
}
