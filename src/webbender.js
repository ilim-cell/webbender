/**
 * Webbender - A powerful bookmarklet to bend the web to your will
 * @author ilim-cell
 * @version 1.0.2
 */

(function () {
  const ID = 'webbender-ui';
  const STORAGE_KEY = 'webbender-settings';

  // Remove existing instance
  const existing = document.getElementById(ID);
  if (existing) {
    existing.remove();
    return;
  }

  // Settings management
  const settings = {
    editMode: false,
    removeMode: false,
    customFont: '',
    theme: 'default',
  };

  // Load saved settings
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      Object.assign(settings, JSON.parse(saved));
    }
  } catch (e) {
    console.warn('Failed to load webbender settings:', e);
  }

  // Save settings to localStorage
  function saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save webbender settings:', e);
    }
  }

  // Create main container
  const container = document.createElement('div');
  container.id = ID;
  Object.assign(container.style, {
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
  });

  // Header
  const header = document.createElement('div');
  Object.assign(header.style, {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #27272a',
    paddingBottom: '8px',
  });

  const title = document.createElement('span');
  title.textContent = 'Webbender';
  Object.assign(title.style, {
    fontWeight: '700',
    fontSize: '14px',
  });

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕';
  Object.assign(closeBtn.style, {
    cursor: 'pointer',
    color: '#71717a',
    fontWeight: 'bold',
    background: 'none',
    border: 'none',
    fontSize: '16px',
    padding: '0 4px',
    transition: 'color 0.2s',
  });
  closeBtn.onmouseover = () => {
    closeBtn.style.color = '#f4f4f5';
  };
  closeBtn.onmouseout = () => {
    closeBtn.style.color = '#71717a';
  };
  closeBtn.onclick = () => {
    if (window._webbenderRemoveMode) {
      window._webbenderToggleRemove(false);
    }
    container.remove();
  };

  header.appendChild(title);
  header.appendChild(closeBtn);

  // Utility function to get or create style element
  function getStyleElement(id) {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('style');
      el.id = id;
      document.head.appendChild(el);
    }
    return el;
  }

  // Edit Mode Section
  const editSection = document.createElement('div');
  Object.assign(editSection.style, {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  });

  const editLabel = document.createElement('label');
  editLabel.textContent = 'Edit Text (Design Mode)';
  Object.assign(editLabel.style, {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: '1',
  });

  const editToggle = document.createElement('input');
  editToggle.type = 'checkbox';
  editToggle.checked = document.designMode === 'on';
  Object.assign(editToggle.style, {
    cursor: 'pointer',
    width: '16px',
    height: '16px',
  });

  function setEditMode(enabled) {
    document.designMode = enabled ? 'on' : 'off';
    document.body.contentEditable = enabled ? 'true' : 'false';
    editToggle.checked = enabled;
    settings.editMode = enabled;
    saveSettings();
  }

  editToggle.onchange = (e) => setEditMode(e.target.checked);
  editLabel.appendChild(editToggle);
  editSection.appendChild(editLabel);

  // Remove Mode Section
  const removeSection = document.createElement('div');
  Object.assign(removeSection.style, {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  });

  const removeLabel = document.createElement('label');
  removeLabel.textContent = 'Remove Elements';
  Object.assign(removeLabel.style, {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: '1',
  });

  const removeToggle = document.createElement('input');
  removeToggle.type = 'checkbox';
  Object.assign(removeToggle.style, {
    cursor: 'pointer',
    width: '16px',
    height: '16px',
  });

  window._webbenderRemoveMode = false;

  const hoverHandler = (e) => {
    if (e.target === container || container.contains(e.target)) return;
    e.target.style.outline = '2px solid #ef4444';
  };

  const leaveHandler = (e) => {
    if (e.target === container || container.contains(e.target)) return;
    e.target.style.outline = '';
  };

  const clickHandler = (e) => {
    if (
      e.target === container ||
      container.contains(e.target) ||
      e.target.tagName === 'HTML' ||
      e.target.tagName === 'BODY'
    )
      return;
    e.preventDefault();
    e.stopPropagation();
    e.target.remove();
  };

  window._webbenderToggleRemove = function (enabled) {
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

  removeToggle.onchange = (e) => window._webbenderToggleRemove(e.target.checked);
  removeLabel.appendChild(removeToggle);
  removeSection.appendChild(removeLabel);

  // Typography Section
  const fontSection = document.createElement('div');
  Object.assign(fontSection.style, {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  });

  const fontLabel = document.createElement('span');
  fontLabel.textContent = 'Typography';
  Object.assign(fontLabel.style, {
    color: '#a1a1aa',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
  });

  const fontSelect = document.createElement('select');
  Object.assign(fontSelect.style, {
    background: '#27272a',
    color: '#f4f4f5',
    border: '1px solid #3f3f46',
    borderRadius: '6px',
    padding: '6px',
    fontSize: '13px',
    cursor: 'pointer',
  });

  const fonts = [
    ['Default', ''],
    ['Sans-Serif', '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif'],
    ['Serif', 'Georgia, Times New Roman, serif'],
    ['Monospace', 'Courier New, monospace'],
    ['Comic Sans', 'Comic Sans MS, Arial, sans-serif'],
  ];

  fonts.forEach(([name, value]) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = name;
    fontSelect.appendChild(option);
  });

  const customFontInput = document.createElement('input');
  customFontInput.type = 'text';
  customFontInput.placeholder = 'Custom font...';
  Object.assign(customFontInput.style, {
    background: '#27272a',
    color: '#f4f4f5',
    border: '1px solid #3f3f46',
    borderRadius: '6px',
    padding: '6px',
    fontSize: '12px',
  });

  function applyFont(fontFamily) {
    const styleEl = getStyleElement('webbender-font-style');
    if (!fontFamily) {
      styleEl.innerHTML = '';
      return;
    }
    styleEl.innerHTML = `* { font-family: "${fontFamily}" !important; }`;
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

  fontSection.appendChild(fontLabel);
  fontSection.appendChild(fontSelect);
  fontSection.appendChild(customFontInput);

  // Theme Section
  const themeSection = document.createElement('div');
  Object.assign(themeSection.style, {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  });

  const themeLabel = document.createElement('span');
  themeLabel.textContent = 'Color Theme';
  Object.assign(themeLabel.style, {
    color: '#a1a1aa',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
  });

  const themeRow = document.createElement('div');
  Object.assign(themeRow.style, {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '6px',
  });

  const themes = [
    { name: 'Default', bg: '', fg: '' },
    { name: 'Dark', bg: '#121212', fg: '#e4e4e7' },
    { name: 'Light', bg: '#ffffff', fg: '#18181b' },
    { name: 'Sepia', bg: '#f4ecd8', fg: '#433422' },
  ];

  themes.forEach((theme) => {
    const btn = document.createElement('button');
    btn.textContent = theme.name;
    Object.assign(btn.style, {
      background: '#27272a',
      color: '#f4f4f5',
      border: '1px solid #3f3f46',
      borderRadius: '6px',
      padding: '6px',
      fontSize: '11px',
      cursor: 'pointer',
      transition: 'all 0.2s',
    });

    btn.onmouseover = () => {
      btn.style.background = '#3f3f46';
    };

    btn.onmouseout = () => {
      btn.style.background = '#27272a';
    };

    btn.onclick = () => {
      const styleEl = getStyleElement('webbender-theme-style');
      if (!theme.bg) {
        styleEl.innerHTML = '';
        settings.theme = 'default';
      } else {
        styleEl.innerHTML = `* { background-color: ${theme.bg} !important; color: ${theme.fg} !important; border-color: rgba(128, 128, 128, 0.2) !important; }`;
        settings.theme = theme.name.toLowerCase();
      }
      saveSettings();
    };

    themeRow.appendChild(btn);
  });

  themeSection.appendChild(themeLabel);
  themeSection.appendChild(themeRow);

  // Dialog Helpers Section
  const dialogSection = document.createElement('div');
  Object.assign(dialogSection.style, {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  });

  const dialogLabel = document.createElement('span');
  dialogLabel.textContent = 'Dialogs';
  Object.assign(dialogLabel.style, {
    color: '#a1a1aa',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
  });

  const dialogRow = document.createElement('div');
  Object.assign(dialogRow.style, {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '6px',
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

  const alertBtn = document.createElement('button');
  alertBtn.textContent = 'Alert';
  Object.assign(alertBtn.style, buttonStyle);
  alertBtn.onmouseover = () => {
    alertBtn.style.background = '#3f3f46';
  };
  alertBtn.onmouseout = () => {
    alertBtn.style.background = '#27272a';
  };
  alertBtn.onclick = () => {
    const msg = prompt('Alert message:', 'This is a test alert.');
    if (msg !== null) alert(msg);
  };

  const confirmBtn = document.createElement('button');
  confirmBtn.textContent = 'Confirm';
  Object.assign(confirmBtn.style, buttonStyle);
  confirmBtn.onmouseover = () => {
    confirmBtn.style.background = '#3f3f46';
  };
  confirmBtn.onmouseout = () => {
    confirmBtn.style.background = '#27272a';
  };
  confirmBtn.onclick = () => {
    const msg = prompt('Confirm message:', 'Are you sure?');
    if (msg !== null) confirm(msg);
  };

  const promptBtn = document.createElement('button');
  promptBtn.textContent = 'Prompt';
  Object.assign(promptBtn.style, buttonStyle);
  promptBtn.onmouseover = () => {
    promptBtn.style.background = '#3f3f46';
  };
  promptBtn.onmouseout = () => {
    promptBtn.style.background = '#27272a';
  };
  promptBtn.onclick = () => {
    const question = prompt('Prompt question:', 'Your question?');
    if (question !== null) {
      const answer = prompt(question, '');
    }
  };

  dialogRow.appendChild(alertBtn);
  dialogRow.appendChild(confirmBtn);
  dialogRow.appendChild(promptBtn);
  dialogSection.appendChild(dialogLabel);
  dialogSection.appendChild(dialogRow);

  // Action Buttons
  const actionRow = document.createElement('div');
  Object.assign(actionRow.style, {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '6px',
    marginTop: '6px',
  });

  const resetBtn = document.createElement('button');
  resetBtn.textContent = 'Reset';
  Object.assign(resetBtn.style, {
    background: '#dc2626',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '8px',
    fontSize: '11px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
  });
  resetBtn.onmouseover = () => {
    resetBtn.style.background = '#991b1b';
  };
  resetBtn.onmouseout = () => {
    resetBtn.style.background = '#dc2626';
  };
  resetBtn.onclick = () => {
    setEditMode(false);
    window._webbenderToggleRemove(false);
    const fontStyle = document.getElementById('webbender-font-style');
    if (fontStyle) fontStyle.innerHTML = '';
    const themeStyle = document.getElementById('webbender-theme-style');
    if (themeStyle) themeStyle.innerHTML = '';
    fontSelect.value = '';
    customFontInput.value = '';
    settings.editMode = false;
    settings.removeMode = false;
    settings.customFont = '';
    settings.theme = 'default';
    saveSettings();
  };

  const updateBtn = document.createElement('button');
  updateBtn.textContent = 'Check Updates';
  Object.assign(updateBtn.style, {
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '8px',
    fontSize: '11px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
  });
  updateBtn.onmouseover = () => {
    updateBtn.style.background = '#1d4ed8';
  };
  updateBtn.onmouseout = () => {
    updateBtn.style.background = '#2563eb';
  };
  updateBtn.onclick = () => {
    window.open('https://github.com/ilim-cell/webbender/releases', '_blank');
  };

  actionRow.appendChild(resetBtn);
  actionRow.appendChild(updateBtn);

  // Restore settings
  if (settings.theme && settings.theme !== 'default') {
    const themeObj = themes.find((t) => t.name.toLowerCase() === settings.theme);
    if (themeObj && themeObj.bg) {
      const styleEl = getStyleElement('webbender-theme-style');
      styleEl.innerHTML = `* { background-color: ${themeObj.bg} !important; color: ${themeObj.fg} !important; border-color: rgba(128, 128, 128, 0.2) !important; }`;
    }
  }
  if (settings.editMode) setEditMode(true);
  if (settings.removeMode) window._webbenderToggleRemove(true);
  if (settings.customFont) {
    customFontInput.value = settings.customFont;
    applyFont(settings.customFont);
  }

  // Assemble UI
  container.appendChild(header);
  container.appendChild(editSection);
  container.appendChild(removeSection);
  container.appendChild(fontSection);
  container.appendChild(themeSection);
  container.appendChild(dialogSection);
  container.appendChild(actionRow);

  document.body.appendChild(container);
})();
