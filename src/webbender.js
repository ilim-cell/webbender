function wbUI() {
  return {
    create(tag, options = {}) {
      const el = document.createElement(tag);
      if (options.textContent !== undefined) {
        el.textContent = options.textContent;
      }
      if (options.attrs) {
        Object.entries(options.attrs).forEach(([key, value]) => {
          el.setAttribute(key, value);
        });
      }
      if (options.style) {
        Object.assign(el.style, options.style);
      }
      return el;
    },
    append(parent, children) {
      children.forEach((child) => parent.appendChild(child));
      return parent;
    },
    button(text, style, handlers = {}) {
      const btn = this.create('button', { textContent: text, style });
      if (handlers.click) btn.onclick = handlers.click;
      if (handlers.mouseover) btn.onmouseover = handlers.mouseover;
      if (handlers.mouseout) btn.onmouseout = handlers.mouseout;
      return btn;
    },
  };
}

function wbGetStyleElement(id) {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('style');
    el.id = id;
    document.head.appendChild(el);
  }
  return el;
}

function wbInitState() {
  const ID = 'webbender-ui';
  const STORAGE_KEY = 'webbender-settings';
  const VERSION = '__WEBBENDER_VERSION__';
  const BUILD_DATE = '__WEBBENDER_BUILD_DATE__';
  const VERSION_URL = 'https://webbender.web.app/version.json';

  const existing = document.getElementById(ID);
  if (existing) {
    existing.remove();
    return null;
  }

  const settings = {
    editMode: false,
    moveMode: false,
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
    BUILD_DATE,
    VERSION_URL,
    settings,
    saveSettings,
  };
}

function wbCreateContainer(ui, id) {
  return ui.create('div', {
    attrs: { id },
    style: {
      position: 'fixed',
      top: '20px',
      right: '20px',
      width: '300px',
      backgroundColor: '#18181b',
      color: '#f4f4f5',
      padding: '16px',
      borderRadius: '12px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
      zIndex: '2147483647',
      fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
      fontSize: '13px',
      userSelect: 'none',
      boxSizing: 'border-box',
      border: '1px solid #27272a',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
    },
  });
}

function wbCreateHeader(ui, container) {
  const header = ui.create('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid #27272a',
      paddingBottom: '8px',
    },
  });

  const title = ui.create('span', {
    textContent: 'Webbender',
    style: { fontWeight: '700', fontSize: '14px' },
  });

  const closeBtn = ui.button(
    '✕',
    {
      cursor: 'pointer',
      color: '#71717a',
      fontWeight: 'bold',
      background: 'none',
      border: 'none',
      fontSize: '16px',
      padding: '0 4px',
      transition: 'color 0.2s',
    },
    {
      mouseover: () => {
        closeBtn.style.color = '#f4f4f5';
      },
      mouseout: () => {
        closeBtn.style.color = '#71717a';
      },
      click: () => {
        if (window._webbenderRemoveMode) {
          window._webbenderToggleRemove(false);
        }
        if (window._webbenderMoveMode) {
          window._webbenderToggleMove(false);
        }
        if (window._webbenderDrawMode && typeof window._webbenderToggleDraw === 'function') {
          window._webbenderToggleDraw(false);
        }
        container.remove();
      },
    }
  );

  ui.append(header, [title, closeBtn]);
  return { header };
}

function wbCreateUpdateBanner(ui) {
  const updateBanner = ui.create('div', {
    style: {
      display: 'none',
      flexDirection: 'column',
      gap: '4px',
      padding: '8px 10px',
      borderRadius: '8px',
      background: 'rgba(234, 179, 8, 0.12)',
      border: '1px solid rgba(234, 179, 8, 0.3)',
      fontSize: '12px',
      lineHeight: '1.5',
    },
  });

  const updateBannerRow = ui.create('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  });

  const updateText = ui.create('span', { style: { color: '#fde047' } });
  const updateDismiss = ui.button(
    '✕',
    {
      background: 'none',
      border: 'none',
      color: '#71717a',
      cursor: 'pointer',
      padding: '0',
      fontSize: '12px',
    },
    { click: () => (updateBanner.style.display = 'none') }
  );
  const updateLink = ui.create('a', {
    textContent: 'Re-install from webbender.web.app →',
    attrs: { href: 'https://webbender.web.app', target: '_blank', rel: 'noreferrer' },
    style: { color: '#93c5fd', fontSize: '11px', display: 'block' },
  });

  ui.append(updateBannerRow, [updateText, updateDismiss]);
  ui.append(updateBanner, [updateBannerRow, updateLink]);

  return { updateBanner, updateText };
}

function wbCreateEditRemoveSection(ui, container, state) {
  const { settings, saveSettings } = state;
  const MOVE_OUTLINE = '2px solid #22c55e';
  const REMOVE_OUTLINE = '2px solid #ef4444';
  const SELECT_OUTLINE = '2px dashed #60a5fa';

  function isBookmarkletElement(target) {
    return (
      !target ||
      target === container ||
      container.contains(target) ||
      target.tagName === 'HTML' ||
      target.tagName === 'BODY'
    );
  }

  function setOutline(target, outline) {
    if (!target || target.dataset.webbenderOutlineBackup !== undefined) return;
    target.dataset.webbenderOutlineBackup = target.style.outline || '';
    target.style.outline = outline;
  }

  function clearOutline(target) {
    if (!target || target.dataset.webbenderOutlineBackup === undefined) return;
    target.style.outline = target.dataset.webbenderOutlineBackup;
    delete target.dataset.webbenderOutlineBackup;
  }

  function applyMoveTransform(target, x, y) {
    const baseTransform = target.dataset.webbenderBaseTransform || '';
    const translate = `translate(${x}px, ${y}px)`;
    target.style.transform = baseTransform ? `${translate} ${baseTransform}` : translate;
    target.dataset.webbenderMoveX = String(x);
    target.dataset.webbenderMoveY = String(y);
  }

  const editSection = ui.create('div', {
    style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  });
  const editLabel = ui.create('label', {
    textContent: 'Edit Text (Design Mode)',
    style: { cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', flex: '1' },
  });
  const editToggle = ui.create('input', {
    attrs: { type: 'checkbox' },
    style: { cursor: 'pointer', width: '16px', height: '16px' },
  });
  editToggle.checked = document.designMode === 'on';

  function setEditMode(enabled) {
    if (enabled && window._webbenderRemoveMode) {
      window._webbenderToggleRemove(false);
    }
    if (enabled && window._webbenderMoveMode) {
      window._webbenderToggleMove(false);
    }
    if (enabled && window._webbenderDrawMode && typeof window._webbenderToggleDraw === 'function') {
      window._webbenderToggleDraw(false);
    }
    document.designMode = enabled ? 'on' : 'off';
    document.body.contentEditable = enabled ? 'true' : 'false';
    editToggle.checked = enabled;
    settings.editMode = enabled;
    saveSettings();
  }

  editToggle.onchange = (e) => setEditMode(e.target.checked);
  editLabel.appendChild(editToggle);
  editSection.appendChild(editLabel);

  const moveSection = ui.create('div', {
    style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  });
  const moveLabel = ui.create('label', {
    textContent: 'Grab & Move',
    style: { cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', flex: '1' },
  });
  const moveToggle = ui.create('input', {
    attrs: { type: 'checkbox' },
    style: { cursor: 'pointer', width: '16px', height: '16px' },
  });

  const removeSection = ui.create('div', {
    style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  });
  const removeLabel = ui.create('label', {
    textContent: 'Remove Elements',
    style: { cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', flex: '1' },
  });
  const removeToggle = ui.create('input', {
    attrs: { type: 'checkbox' },
    style: { cursor: 'pointer', width: '16px', height: '16px' },
  });

  let moveHoverTarget = null;
  let activeMoveTarget = null;
  window._webbenderMoveMode = false;
  window._webbenderRemoveMode = false;
  window._webbenderDrawMode = false;

  function setMoveHoverTarget(target) {
    if (moveHoverTarget === target) return;
    clearOutline(moveHoverTarget);
    moveHoverTarget = target;
    if (moveHoverTarget) {
      setOutline(moveHoverTarget, MOVE_OUTLINE);
    }
  }

  const moveHoverHandler = (e) => {
    if (activeMoveTarget || isBookmarkletElement(e.target)) return;
    setMoveHoverTarget(e.target);
  };
  const moveLeaveHandler = (e) => {
    if (activeMoveTarget || e.target !== moveHoverTarget) return;
    setMoveHoverTarget(null);
  };
  const moveDownHandler = (e) => {
    if (e.button !== 0 || isBookmarkletElement(e.target)) return;

    const rect = e.target.getBoundingClientRect();
    const moveX = parseFloat(e.target.dataset.webbenderMoveX || '0');
    const moveY = parseFloat(e.target.dataset.webbenderMoveY || '0');

    if (e.target.dataset.webbenderBaseTransform === undefined) {
      e.target.dataset.webbenderBaseTransform = e.target.style.transform || '';
    }

    activeMoveTarget = {
      target: e.target,
      startX: e.clientX,
      startY: e.clientY,
      moveX,
      moveY,
      minDeltaX: -rect.right + 1,
      maxDeltaX: window.innerWidth - rect.left - 1,
      minDeltaY: -rect.bottom + 1,
      maxDeltaY: window.innerHeight - rect.top - 1,
    };

    setMoveHoverTarget(e.target);
    e.preventDefault();
    e.stopPropagation();
  };
  const moveHandler = (e) => {
    if (!activeMoveTarget) return;

    const deltaX = Math.min(
      Math.max(e.clientX - activeMoveTarget.startX, activeMoveTarget.minDeltaX),
      activeMoveTarget.maxDeltaX
    );
    const deltaY = Math.min(
      Math.max(e.clientY - activeMoveTarget.startY, activeMoveTarget.minDeltaY),
      activeMoveTarget.maxDeltaY
    );

    applyMoveTransform(
      activeMoveTarget.target,
      activeMoveTarget.moveX + deltaX,
      activeMoveTarget.moveY + deltaY
    );

    e.preventDefault();
    e.stopPropagation();
  };
  const moveUpHandler = (e) => {
    if (!activeMoveTarget) return;
    setMoveHoverTarget(activeMoveTarget.target);
    activeMoveTarget = null;
    e.preventDefault();
    e.stopPropagation();
  };
  const moveClickHandler = (e) => {
    if (isBookmarkletElement(e.target)) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const hoverHandler = (e) => {
    if (isBookmarkletElement(e.target)) return;
    setOutline(e.target, REMOVE_OUTLINE);
  };
  const leaveHandler = (e) => {
    if (isBookmarkletElement(e.target)) return;
    clearOutline(e.target);
  };
  const clickHandler = (e) => {
    if (isBookmarkletElement(e.target)) return;
    e.preventDefault();
    e.stopPropagation();
    clearOutline(e.target);
    e.target.remove();
  };

  window._webbenderToggleMove = function (enabled) {
    if (enabled && document.designMode === 'on') {
      setEditMode(false);
    }
    if (enabled && window._webbenderRemoveMode) {
      window._webbenderToggleRemove(false);
    }
    if (enabled && window._webbenderDrawMode && typeof window._webbenderToggleDraw === 'function') {
      window._webbenderToggleDraw(false);
    }

    window._webbenderMoveMode = enabled;
    moveToggle.checked = enabled;
    settings.moveMode = enabled;
    saveSettings();

    if (enabled) {
      document.addEventListener('mouseover', moveHoverHandler);
      document.addEventListener('mouseout', moveLeaveHandler);
      document.addEventListener('mousedown', moveDownHandler, true);
      document.addEventListener('mousemove', moveHandler, true);
      document.addEventListener('mouseup', moveUpHandler, true);
      document.addEventListener('click', moveClickHandler, true);
    } else {
      document.removeEventListener('mouseover', moveHoverHandler);
      document.removeEventListener('mouseout', moveLeaveHandler);
      document.removeEventListener('mousedown', moveDownHandler, true);
      document.removeEventListener('mousemove', moveHandler, true);
      document.removeEventListener('mouseup', moveUpHandler, true);
      document.removeEventListener('click', moveClickHandler, true);
      setMoveHoverTarget(null);
      activeMoveTarget = null;
    }
  };

  window._webbenderToggleRemove = function (enabled) {
    if (enabled && document.designMode === 'on') {
      setEditMode(false);
    }
    if (enabled && window._webbenderMoveMode) {
      window._webbenderToggleMove(false);
    }
    if (enabled && window._webbenderDrawMode && typeof window._webbenderToggleDraw === 'function') {
      window._webbenderToggleDraw(false);
    }

    window._webbenderRemoveMode = enabled;
    removeToggle.checked = enabled;
    settings.removeMode = enabled;
    saveSettings();

    if (enabled) {
      document.addEventListener('mouseover', hoverHandler);
      document.addEventListener('mouseout', leaveHandler);
      document.addEventListener('click', clickHandler, true);
    } else {
      document.removeEventListener('mouseover', hoverHandler);
      document.removeEventListener('mouseout', leaveHandler);
      document.removeEventListener('click', clickHandler, true);
    }
  };

  moveToggle.onchange = (e) => window._webbenderToggleMove(e.target.checked);
  moveLabel.appendChild(moveToggle);
  moveSection.appendChild(moveLabel);

  removeToggle.onchange = (e) => window._webbenderToggleRemove(e.target.checked);
  removeLabel.appendChild(removeToggle);
  removeSection.appendChild(removeLabel);

  const immersiveSection = ui.create('div', {
    style: { display: 'flex', flexDirection: 'column', gap: '6px' },
  });
  const immersiveLabel = ui.create('span', {
    textContent: 'Immersive Edit',
    style: { color: '#a1a1aa', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' },
  });
  const immersiveHint = ui.create('span', {
    textContent: 'Tap Pick, then element tools. Draw mode supports undo/redo.',
    style: { color: '#71717a', fontSize: '10px' },
  });
  const immersiveGrid = ui.create('div', {
    style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' },
  });

  const immersiveButtonStyle = {
    background: '#27272a',
    color: '#f4f4f5',
    border: '1px solid #3f3f46',
    borderRadius: '6px',
    padding: '6px',
    fontSize: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  function createImmersiveButton(text, onClick) {
    return ui.button(
      text,
      { ...immersiveButtonStyle },
      {
        mouseover: (e) => (e.target.style.background = '#3f3f46'),
        mouseout: (e) => (e.target.style.background = '#27272a'),
        click: onClick,
      }
    );
  }

  function getSelectionElement() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    const node = selection.anchorNode;
    if (!node) return null;
    return node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
  }

  let selectedElement = null;
  let copiedElement = null;
  let pickModeEnabled = false;
  let drawCanvas = null;
  let drawCtx = null;
  let currentStroke = null;
  let drawStrokes = [];
  let drawRedoStrokes = [];

  function setSelectedElement(target) {
    clearOutline(selectedElement);
    selectedElement = isBookmarkletElement(target) ? null : target;
    if (selectedElement) {
      setOutline(selectedElement, SELECT_OUTLINE);
    }
  }

  function getActiveElement() {
    if (selectedElement && selectedElement.isConnected) return selectedElement;
    const selectionElement = getSelectionElement();
    return isBookmarkletElement(selectionElement) ? null : selectionElement;
  }

  function applyRoundedCorners(step) {
    const target = getActiveElement();
    if (!target) return;
    const radius = parseFloat(window.getComputedStyle(target).borderRadius || '0') || 0;
    const nextRadius = Math.max(0, radius + step);
    target.style.borderRadius = `${nextRadius}px`;
  }

  function execEditCommand(command, value) {
    if (document.designMode !== 'on') {
      setEditMode(true);
    }
    try {
      document.execCommand(command, false, value);
    } catch (e) {
      // Ignore unsupported commands.
    }
  }

  function renderDrawCanvas() {
    if (!drawCtx || !drawCanvas) return;
    drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
    drawCtx.lineCap = 'round';
    drawCtx.lineJoin = 'round';
    drawCtx.strokeStyle = '#f97316';
    drawCtx.lineWidth = 3;
    drawStrokes.forEach((stroke) => {
      if (stroke.length === 0) return;
      drawCtx.beginPath();
      drawCtx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        drawCtx.lineTo(stroke[i].x, stroke[i].y);
      }
      drawCtx.stroke();
    });
  }

  function ensureDrawCanvas() {
    if (drawCanvas) return;
    drawCanvas = ui.create('canvas', {
      style: {
        position: 'fixed',
        inset: '0',
        zIndex: '2147483646',
        cursor: 'crosshair',
      },
    });
    drawCanvas.width = window.innerWidth;
    drawCanvas.height = window.innerHeight;
    drawCtx = drawCanvas.getContext('2d');

    drawCanvas.onmousedown = (e) => {
      currentStroke = [{ x: e.clientX, y: e.clientY }];
      drawStrokes.push(currentStroke);
      drawRedoStrokes = [];
      renderDrawCanvas();
      e.preventDefault();
      e.stopPropagation();
    };
    drawCanvas.onmousemove = (e) => {
      if (!currentStroke) return;
      currentStroke.push({ x: e.clientX, y: e.clientY });
      renderDrawCanvas();
      e.preventDefault();
      e.stopPropagation();
    };
    const stopDrawing = (e) => {
      if (!currentStroke) return;
      currentStroke = null;
      renderDrawCanvas();
      e.preventDefault();
      e.stopPropagation();
    };
    drawCanvas.onmouseup = stopDrawing;
    drawCanvas.onmouseleave = stopDrawing;
  }

  window._webbenderToggleDraw = function (enabled) {
    if (enabled && document.designMode === 'on') {
      setEditMode(false);
    }
    if (enabled && window._webbenderMoveMode) {
      window._webbenderToggleMove(false);
    }
    if (enabled && window._webbenderRemoveMode) {
      window._webbenderToggleRemove(false);
    }
    if (enabled) {
      ensureDrawCanvas();
      drawCanvas.width = window.innerWidth;
      drawCanvas.height = window.innerHeight;
      document.body.appendChild(drawCanvas);
      renderDrawCanvas();
    } else if (drawCanvas && drawCanvas.parentNode) {
      drawCanvas.parentNode.removeChild(drawCanvas);
      currentStroke = null;
    }
    window._webbenderDrawMode = enabled;
    drawBtn.textContent = enabled ? 'Draw: On' : 'Draw';
  };

  const pickBtn = createImmersiveButton('Pick', () => {
    if (pickModeEnabled) return;
    pickModeEnabled = true;
    pickBtn.textContent = 'Tap...';
    const pickHandler = (e) => {
      if (isBookmarkletElement(e.target)) return;
      setSelectedElement(e.target);
      pickModeEnabled = false;
      pickBtn.textContent = 'Pick';
      document.removeEventListener('click', pickHandler, true);
      e.preventDefault();
      e.stopPropagation();
    };
    document.addEventListener('click', pickHandler, true);
  });
  const boldBtn = createImmersiveButton('Bold', () => execEditCommand('bold'));
  const italicBtn = createImmersiveButton('Italic', () => execEditCommand('italic'));
  const underlineBtn = createImmersiveButton('Underline', () => execEditCommand('underline'));
  const imageBtn = createImmersiveButton('Image', () => {
    const url = prompt('Image URL:', 'https://');
    if (url) execEditCommand('insertImage', url);
  });
  const buttonBtn = createImmersiveButton('Button', () => {
    const label = prompt('Button text:', 'Button');
    if (!label) return;
    execEditCommand(
      'insertHTML',
      `<button style="padding:8px 12px;border-radius:8px;border:1px solid #555;background:#2563eb;color:#fff;">${label}</button>`
    );
  });
  const roundPlusBtn = createImmersiveButton('Round +', () => applyRoundedCorners(4));
  const roundMinusBtn = createImmersiveButton('Round -', () => applyRoundedCorners(-4));
  const copyBtn = createImmersiveButton('Copy', () => {
    const target = getActiveElement();
    if (!target) return;
    copiedElement = target.cloneNode(true);
  });
  const pasteBtn = createImmersiveButton('Paste', () => {
    if (!copiedElement) return;
    const target = getActiveElement();
    const clone = copiedElement.cloneNode(true);
    if (target && target.parentNode) {
      target.parentNode.insertBefore(clone, target.nextSibling);
      setSelectedElement(clone);
    } else {
      document.body.appendChild(clone);
      setSelectedElement(clone);
    }
  });
  const deleteBtn = createImmersiveButton('Delete', () => {
    const target = getActiveElement();
    if (!target) return;
    setSelectedElement(null);
    target.remove();
  });
  const undoBtn = createImmersiveButton('Undo', () => {
    if (window._webbenderDrawMode && drawStrokes.length > 0) {
      drawRedoStrokes.push(drawStrokes.pop());
      renderDrawCanvas();
      return;
    }
    execEditCommand('undo');
  });
  const redoBtn = createImmersiveButton('Redo', () => {
    if (window._webbenderDrawMode && drawRedoStrokes.length > 0) {
      drawStrokes.push(drawRedoStrokes.pop());
      renderDrawCanvas();
      return;
    }
    execEditCommand('redo');
  });
  const clearDrawBtn = createImmersiveButton('Clear Draw', () => {
    drawStrokes = [];
    drawRedoStrokes = [];
    renderDrawCanvas();
  });
  const drawBtn = createImmersiveButton('Draw', () =>
    window._webbenderToggleDraw(!window._webbenderDrawMode)
  );

  ui.append(immersiveGrid, [
    pickBtn,
    boldBtn,
    italicBtn,
    underlineBtn,
    imageBtn,
    buttonBtn,
    roundPlusBtn,
    roundMinusBtn,
    copyBtn,
    pasteBtn,
    deleteBtn,
    drawBtn,
    undoBtn,
    redoBtn,
    clearDrawBtn,
  ]);
  ui.append(immersiveSection, [immersiveLabel, immersiveHint, immersiveGrid]);

  return { editSection, moveSection, removeSection, immersiveSection, setEditMode };
}

function wbGetThemeCss(bgColor, fgColor) {
  return `* { background: ${bgColor} !important; color: ${fgColor} !important; border-color: rgba(128, 128, 128, 0.2) !important; background-image: none !important; } html, body { background: ${bgColor} !important; background-image: none !important; }`;
}

function wbCreateFontThemeSection(ui, state) {
  const { settings, saveSettings } = state;

  const fontSection = ui.create('div', {
    style: { display: 'flex', flexDirection: 'column', gap: '6px' },
  });
  const fontLabel = ui.create('span', {
    textContent: 'Typography',
    style: { color: '#a1a1aa', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' },
  });
  const fontSelect = ui.create('select', {
    style: {
      background: '#27272a',
      color: '#f4f4f5',
      border: '1px solid #3f3f46',
      borderRadius: '6px',
      padding: '6px',
      fontSize: '13px',
      cursor: 'pointer',
    },
  });

  const fonts = [
    ['Default', ''],
    ['Sans-Serif', '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif'],
    ['Serif', 'Georgia, Times New Roman, serif'],
    ['Monospace', 'Courier New, monospace'],
    ['Comic Sans', 'Comic Sans MS, Arial, sans-serif'],
  ];

  fonts.forEach(([name, value]) => {
    const option = ui.create('option', { textContent: name });
    option.value = value;
    fontSelect.appendChild(option);
  });

  const customFontInput = ui.create('input', {
    attrs: { type: 'text', placeholder: 'Custom font...' },
    style: {
      background: '#27272a',
      color: '#f4f4f5',
      border: '1px solid #3f3f46',
      borderRadius: '6px',
      padding: '6px',
      fontSize: '12px',
    },
  });

  function applyFont(fontFamily) {
    const styleEl = wbGetStyleElement('webbender-font-style');
    styleEl.textContent = fontFamily ? `* { font-family: "${fontFamily}" !important; }` : '';
  }

  fontSelect.onchange = (e) => {
    customFontInput.value = '';
    applyFont(e.target.value);
    settings.customFont = e.target.value;
    saveSettings();
  };

  customFontInput.oninput = (e) => {
    fontSelect.value = '';
    applyFont(e.target.value);
    settings.customFont = e.target.value;
    saveSettings();
  };

  ui.append(fontSection, [fontLabel, fontSelect, customFontInput]);

  const themeSection = ui.create('div', {
    style: { display: 'flex', flexDirection: 'column', gap: '6px' },
  });
  const themeLabel = ui.create('span', {
    textContent: 'Color Theme',
    style: { color: '#a1a1aa', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' },
  });
  const themeRow = ui.create('div', {
    style: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' },
  });

  const themes = [
    { name: 'Default', bg: '', fg: '' },
    { name: 'Dark', bg: '#121212', fg: '#e4e4e7' },
    { name: 'Light', bg: '#ffffff', fg: '#18181b' },
    { name: 'Sepia', bg: '#f4ecd8', fg: '#433422' },
  ];

  themes.forEach((theme) => {
    const btn = ui.button(
      theme.name,
      {
        background: '#27272a',
        color: '#f4f4f5',
        border: '1px solid #3f3f46',
        borderRadius: '6px',
        padding: '6px',
        fontSize: '11px',
        cursor: 'pointer',
        transition: 'all 0.2s',
      },
      {
        mouseover: () => (btn.style.background = '#3f3f46'),
        mouseout: () => (btn.style.background = '#27272a'),
        click: () => {
          const styleEl = wbGetStyleElement('webbender-theme-style');
          if (!theme.bg) {
            styleEl.textContent = '';
            settings.theme = 'default';
          } else {
            styleEl.textContent = wbGetThemeCss(theme.bg, theme.fg);
            settings.theme = theme.name.toLowerCase();
          }
          saveSettings();
        },
      }
    );
    themeRow.appendChild(btn);
  });

  ui.append(themeSection, [themeLabel, themeRow]);

  return {
    fontSection,
    themeSection,
    fontSelect,
    customFontInput,
    applyFont,
    themes,
  };
}

function wbCreateDialogsActions(ui, state, controls) {
  const { settings, saveSettings } = state;
  const { setEditMode, fontSelect, customFontInput, container } = controls;

  const dialogSection = ui.create('div', {
    style: { display: 'flex', flexDirection: 'column', gap: '6px' },
  });
  const dialogLabel = ui.create('span', {
    textContent: 'Dialogs',
    style: { color: '#a1a1aa', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' },
  });
  const dialogRow = ui.create('div', {
    style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' },
  });

  const buttonStyle = {
    background: '#27272a',
    color: '#f4f4f5',
    border: '1px solid #3f3f46',
    borderRadius: '6px',
    padding: '6px',
    fontSize: '11px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  function makeDialogButton(text, onClick) {
    return ui.button(
      text,
      { ...buttonStyle },
      {
        mouseover: (e) => (e.target.style.background = '#3f3f46'),
        mouseout: (e) => (e.target.style.background = '#27272a'),
        click: onClick,
      }
    );
  }

  function runWithPanelHidden(dialogAction) {
    if (!container) {
      dialogAction();
      return;
    }

    const previousDisplay = container.style.display;
    container.style.display = 'none';
    // Force a reflow so the panel visually hides before the native dialog opens.
    void container.offsetHeight;

    try {
      dialogAction();
    } finally {
      container.style.display = previousDisplay || 'flex';
    }
  }

  const alertBtn = makeDialogButton('Alert', () => {
    const msg = prompt('Alert message:', 'This is a test alert.');
    if (msg !== null) runWithPanelHidden(() => alert(msg));
  });
  const confirmBtn = makeDialogButton('Confirm', () => {
    const msg = prompt('Confirm message:', 'Are you sure?');
    if (msg !== null) runWithPanelHidden(() => confirm(msg));
  });
  const promptBtn = makeDialogButton('Prompt', () => {
    const question = prompt('Prompt question:', 'Your question?');
    if (question !== null) runWithPanelHidden(() => prompt(question, ''));
  });

  ui.append(dialogRow, [alertBtn, confirmBtn, promptBtn]);
  ui.append(dialogSection, [dialogLabel, dialogRow]);

  const actionRow = ui.create('div', {
    style: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', marginTop: '6px' },
  });

  const resetBtn = ui.button(
    'Reset',
    {
      background: '#dc2626',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      padding: '8px',
      fontSize: '11px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    {
      mouseover: () => (resetBtn.style.background = '#991b1b'),
      mouseout: () => (resetBtn.style.background = '#dc2626'),
      click: () => {
        setEditMode(false);
        window._webbenderToggleRemove(false);
        window._webbenderToggleMove(false);
        if (window._webbenderDrawMode && typeof window._webbenderToggleDraw === 'function') {
          window._webbenderToggleDraw(false);
        }
        const fontStyle = document.getElementById('webbender-font-style');
        if (fontStyle) fontStyle.textContent = '';
        const themeStyle = document.getElementById('webbender-theme-style');
        if (themeStyle) themeStyle.textContent = '';
        fontSelect.value = '';
        customFontInput.value = '';
        settings.editMode = false;
        settings.moveMode = false;
        settings.removeMode = false;
        settings.customFont = '';
        settings.theme = 'default';
        saveSettings();
      },
    }
  );

  const updateBtn = ui.button(
    'Check Updates',
    {
      background: '#2563eb',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      padding: '8px',
      fontSize: '11px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    {
      mouseover: () => (updateBtn.style.background = '#1d4ed8'),
      mouseout: () => (updateBtn.style.background = '#2563eb'),
      click: () => {
        if (typeof window._webbenderCheckUpdates === 'function') {
          window._webbenderCheckUpdates();
        }
      },
    }
  );

  ui.append(actionRow, [resetBtn, updateBtn]);
  return { dialogSection, actionRow };
}

function wbRestoreAndAssemble(state, controls) {
  const {
    settings,
    VERSION,
    BUILD_DATE,
    VERSION_URL,
    container,
    header,
    updateBanner,
    updateText,
    editSection,
    moveSection,
    removeSection,
    immersiveSection,
    fontSection,
    themeSection,
    dialogSection,
    actionRow,
    themes,
    setEditMode,
    applyFont,
    customFontInput,
  } = controls;

  if (settings.theme && settings.theme !== 'default') {
    const themeObj = themes.find((t) => t.name.toLowerCase() === settings.theme);
    if (themeObj && themeObj.bg) {
      const styleEl = wbGetStyleElement('webbender-theme-style');
      styleEl.textContent = wbGetThemeCss(themeObj.bg, themeObj.fg);
    }
  }
  if (settings.editMode) setEditMode(true);
  if (settings.moveMode) window._webbenderToggleMove(true);
  if (settings.removeMode) window._webbenderToggleRemove(true);
  if (settings.customFont) {
    customFontInput.value = settings.customFont;
    applyFont(settings.customFont);
  }

  const ui = wbUI();
  ui.append(container, [
    header,
    editSection,
    moveSection,
    removeSection,
    immersiveSection,
    fontSection,
    themeSection,
    dialogSection,
    actionRow,
    updateBanner,
  ]);
  document.body.appendChild(container);

  function isNewerVersion(remote, local) {
    const remoteParts = remote.split('.').map(Number);
    const localParts = local.split('.').map(Number);
    for (let i = 0; i < 3; i++) {
      if ((remoteParts[i] || 0) > (localParts[i] || 0)) return true;
      if ((remoteParts[i] || 0) < (localParts[i] || 0)) return false;
    }
    return false;
  }

  function hasNewerBuildDate(remoteDate, localDate) {
    const remoteTs = Date.parse(remoteDate);
    const localTs = Date.parse(localDate);
    if (!Number.isFinite(remoteTs) || !Number.isFinite(localTs)) return false;
    return remoteTs > localTs;
  }

  function showUpdateAlert(data) {
    const sameVersionUpdate = data.version === VERSION;
    updateText.textContent = sameVersionUpdate
      ? `Update available on main (newer build for v${VERSION})`
      : `Update available: v${data.version} (you have v${VERSION})`;
    updateBanner.style.display = 'flex';
  }

  function checkUpdates() {
    try {
      fetch(VERSION_URL, { cache: 'no-store' })
        .then((res) => res.json())
        .then((data) => {
          if (!data || !data.version) return;

          if (isNewerVersion(data.version, VERSION)) {
            showUpdateAlert(data);
            return;
          }

          if (data.version === VERSION && hasNewerBuildDate(data.buildDate, BUILD_DATE)) {
            showUpdateAlert(data);
          }
        })
        .catch(() => {});
    } catch (e) {
      // fetch not available or blocked — no update notification, tool still works
    }
  }

  window._webbenderCheckUpdates = checkUpdates;
  checkUpdates();
}

(function () {
  const state = wbInitState();
  if (!state) {
    return;
  }

  const ui = wbUI();
  const container = wbCreateContainer(ui, state.ID);

  const { header } = wbCreateHeader(ui, container);
  const { updateBanner, updateText } = wbCreateUpdateBanner(ui);
  const { editSection, moveSection, removeSection, immersiveSection, setEditMode } =
    wbCreateEditRemoveSection(ui, container, state);
  const { fontSection, themeSection, fontSelect, customFontInput, applyFont, themes } =
    wbCreateFontThemeSection(ui, state);
  const { dialogSection, actionRow } = wbCreateDialogsActions(ui, state, {
    setEditMode,
    fontSelect,
    customFontInput,
    container,
  });

  wbRestoreAndAssemble(state, {
    ...state,
    container,
    header,
    updateBanner,
    updateText,
    editSection,
    moveSection,
    removeSection,
    immersiveSection,
    fontSection,
    themeSection,
    dialogSection,
    actionRow,
    themes,
    setEditMode,
    applyFont,
    customFontInput,
  });
})();
