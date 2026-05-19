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

  return { editSection, moveSection, removeSection, setEditMode };
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
            styleEl.textContent = `* { background-color: ${theme.bg} !important; color: ${theme.fg} !important; border-color: rgba(128, 128, 128, 0.2) !important; }`;
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
  const { setEditMode, fontSelect, customFontInput } = controls;

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

  const alertBtn = makeDialogButton('Alert', () => {
    const msg = prompt('Alert message:', 'This is a test alert.');
    if (msg !== null) alert(msg);
  });
  const confirmBtn = makeDialogButton('Confirm', () => {
    const msg = prompt('Confirm message:', 'Are you sure?');
    if (msg !== null) confirm(msg);
  });
  const promptBtn = makeDialogButton('Prompt', () => {
    const question = prompt('Prompt question:', 'Your question?');
    if (question !== null) prompt(question, '');
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
      click: () => window.open('https://github.com/ilim-cell/webbender/releases', '_blank'),
    }
  );

  ui.append(actionRow, [resetBtn, updateBtn]);
  return { dialogSection, actionRow };
}

function wbRestoreAndAssemble(state, controls) {
  const {
    settings,
    VERSION,
    VERSION_URL,
    container,
    header,
    updateBanner,
    updateText,
    editSection,
    moveSection,
    removeSection,
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
      styleEl.textContent = `* { background-color: ${themeObj.bg} !important; color: ${themeObj.fg} !important; border-color: rgba(128, 128, 128, 0.2) !important; }`;
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
    updateBanner,
    editSection,
    moveSection,
    removeSection,
    fontSection,
    themeSection,
    dialogSection,
    actionRow,
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

  try {
    fetch(VERSION_URL, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.version && isNewerVersion(data.version, VERSION)) {
          updateText.textContent = `Update available: v${data.version} (you have v${VERSION})`;
          updateBanner.style.display = 'flex';
        }
      })
      .catch(() => {});
  } catch (e) {
    // fetch not available or blocked — no update notification, tool still works
  }
}
