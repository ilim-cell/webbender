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
    '',
    {
      cursor: 'pointer',
      color: '#71717a',
      fontWeight: 'bold',
      background: 'none',
      border: 'none',
      fontSize: '16px',
      padding: '0 4px',
      transition: 'color 0.2s',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
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
        if (typeof window._webbenderCloseImmersiveSheet === 'function') {
          const canClose = window._webbenderCloseImmersiveSheet();
          if (!canClose) return;
        }
        container.remove();
      },
    }
  );
  closeBtn.setAttribute('aria-label', 'Close panel');
  closeBtn.setAttribute('title', 'Close panel');
  closeBtn.appendChild(wbCreateMaterialIcon('close'));

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
    '',
    {
      background: 'none',
      border: 'none',
      color: '#71717a',
      cursor: 'pointer',
      padding: '0',
      fontSize: '12px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    { click: () => (updateBanner.style.display = 'none') }
  );
  updateDismiss.setAttribute('aria-label', 'Dismiss update notice');
  updateDismiss.setAttribute('title', 'Dismiss update notice');
  updateDismiss.appendChild(wbCreateMaterialIcon('close'));
  const updateLink = ui.create('a', {
    textContent: 'Re-install from webbender.web.app →',
    attrs: { href: 'https://webbender.web.app', target: '_blank', rel: 'noreferrer' },
    style: { color: '#93c5fd', fontSize: '11px', display: 'block' },
  });

  ui.append(updateBannerRow, [updateText, updateDismiss]);
  ui.append(updateBanner, [updateBannerRow, updateLink]);

  return { updateBanner, updateText };
}

function wbEnsureMaterialSymbols() {
  if (document.getElementById('webbender-material-symbols')) return;
  const link = document.createElement('link');
  link.id = 'webbender-material-symbols';
  link.rel = 'stylesheet';
  link.href =
    'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0';
  document.head.appendChild(link);
}

function wbCreateMaterialIcon(name) {
  wbEnsureMaterialSymbols();
  return wbUI().create('span', {
    textContent: name,
    attrs: { 'aria-hidden': 'true' },
    style: {
      fontFamily: '"Material Symbols Rounded"',
      fontSize: '20px',
      lineHeight: '1',
      fontWeight: 'normal',
      fontStyle: 'normal',
      letterSpacing: 'normal',
      textTransform: 'none',
      display: 'inline-block',
      whiteSpace: 'nowrap',
      direction: 'ltr',
      WebkitFontSmoothing: 'antialiased',
      fontFeatureSettings: 'normal',
      fontVariationSettings: '"FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24',
    },
  });
}

function wbCreateToolbarButton(ui, iconName, label, onClick) {
  const btn = ui.create('button', {
    attrs: { title: label, 'aria-label': label },
    style: {
      background: '#0f172a',
      color: '#cbd5e1',
      border: '1px solid #334155',
      borderRadius: '18px',
      width: '64px',
      minHeight: '64px',
      padding: '10px 8px',
      fontSize: '11px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.18s ease',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      boxSizing: 'border-box',
    },
  });
  btn.appendChild(wbCreateMaterialIcon(iconName));
  btn.onclick = onClick;
  return btn;
}

function wbStyleToolbarButton(btn, active) {
  btn.style.background = active ? '#2563eb' : '#0f172a';
  btn.style.borderColor = active ? '#60a5fa' : '#334155';
  btn.style.color = active ? '#eff6ff' : '#cbd5e1';
  btn.style.boxShadow = active ? '0 12px 24px rgba(37, 99, 235, 0.35)' : 'none';
  btn.style.transform = active ? 'translateY(-1px)' : 'none';
}

function wbCreatePillButton(ui, label, active = false) {
  return ui.create('button', {
    textContent: label,
    style: {
      background: active ? '#2563eb' : '#0f172a',
      color: active ? '#eff6ff' : '#cbd5e1',
      border: `1px solid ${active ? '#60a5fa' : '#334155'}`,
      borderRadius: '999px',
      padding: '6px 12px',
      fontSize: '11px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.18s ease',
    },
  });
}

function wbCreateEditRemoveSection(ui, container, state) {
  const { settings, saveSettings } = state;
  const SELECT_OUTLINE = '2px dashed #60a5fa';
  const immersiveSection = ui.create('div', {
    style: { display: 'flex', flexDirection: 'column', gap: '8px' },
  });
  const immersiveLabel = ui.create('span', {
    textContent: 'Immersive Edit',
    style: { color: '#a1a1aa', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' },
  });
  const startBtn = ui.button(
    'Start Immersive Edit',
    {
      background: '#22c55e',
      color: '#052e16',
      border: 'none',
      borderRadius: '8px',
      padding: '8px',
      fontSize: '12px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    {
      mouseover: () => (startBtn.style.background = '#4ade80'),
      mouseout: () => (startBtn.style.background = '#22c55e'),
      click: () => openImmersivePanel(),
    }
  );
  const immersiveHint = ui.create('span', {
    textContent: 'Paint-style sheet with icon tools appears at the bottom.',
    style: { color: '#71717a', fontSize: '10px' },
  });
  ui.append(immersiveSection, [immersiveLabel, startBtn, immersiveHint]);

  const editSection = ui.create('div', { style: { display: 'none' } });
  const moveSection = ui.create('div', { style: { display: 'none' } });
  const removeSection = ui.create('div', { style: { display: 'none' } });
  settings.editMode = false;
  settings.moveMode = false;
  settings.removeMode = false;
  saveSettings();

  let immersivePanel = null;
  let optionsBody = null;
  let selectedElement = null;
  let copiedElement = null;
  let activeTool = 'select';
  let unsavedChanges = false;
  let pointerDrag = null;
  const undoStack = [];
  const redoStack = [];
  const sessionStack = [];

  function isBookmarkletElement(target) {
    return (
      !target ||
      target === container ||
      container.contains(target) ||
      target === immersivePanel ||
      (immersivePanel && immersivePanel.contains(target)) ||
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

  function setSelectedElement(target) {
    clearOutline(selectedElement);
    selectedElement = isBookmarkletElement(target) ? null : target;
    if (selectedElement) setOutline(selectedElement, SELECT_OUTLINE);
    refreshOptions();
  }

  function markUnsaved(value) {
    unsavedChanges = value;
    if (saveBtn) {
      saveBtn.style.background = unsavedChanges ? '#22c55e' : '#14532d';
      saveBtn.style.color = unsavedChanges ? '#052e16' : '#86efac';
    }
  }

  function setEditMode(enabled) {
    document.designMode = enabled ? 'on' : 'off';
    document.body.contentEditable = enabled ? 'true' : 'false';
    settings.editMode = enabled;
    saveSettings();
  }

  window._webbenderMoveMode = false;
  window._webbenderRemoveMode = false;
  window._webbenderDrawMode = false;
  window._webbenderToggleMove = () => {
    window._webbenderMoveMode = false;
    settings.moveMode = false;
    saveSettings();
  };
  window._webbenderToggleRemove = () => {
    window._webbenderRemoveMode = false;
    settings.removeMode = false;
    saveSettings();
  };
  window._webbenderToggleDraw = () => {
    window._webbenderDrawMode = false;
  };

  function createOperation(doAction, undoAction) {
    doAction();
    undoStack.push({ doAction, undoAction });
    sessionStack.push({ doAction, undoAction });
    redoStack.length = 0;
    markUnsaved(true);
  }

  function undo() {
    const op = undoStack.pop();
    if (!op) return;
    op.undoAction();
    redoStack.push(op);
    markUnsaved(sessionStack.length > 0 && undoStack.length > 0);
  }

  function redo() {
    const op = redoStack.pop();
    if (!op) return;
    op.doAction();
    undoStack.push(op);
    markUnsaved(true);
  }

  function insertNodeAfter(target, node) {
    if (target && target.parentNode) {
      target.parentNode.insertBefore(node, target.nextSibling);
    } else {
      document.body.appendChild(node);
    }
  }

  function applyStyleWithUndo(target, prop, value) {
    if (!target) return;
    const previous = target.style[prop] || '';
    if (previous === value) return;
    createOperation(
      () => (target.style[prop] = value),
      () => (target.style[prop] = previous)
    );
  }

  function createFieldGroup(title, subtitle) {
    const group = ui.create('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '12px',
        borderRadius: '16px',
        background: '#0b1120',
        border: '1px solid #1e293b',
      },
    });
    const labelRow = ui.create('div', {
      style: { display: 'flex', flexDirection: 'column', gap: '2px' },
    });
    labelRow.appendChild(
      ui.create('span', {
        textContent: title,
        style: { color: '#e2e8f0', fontSize: '12px', fontWeight: '700' },
      })
    );
    if (subtitle) {
      labelRow.appendChild(
        ui.create('span', {
          textContent: subtitle,
          style: { color: '#64748b', fontSize: '10px', lineHeight: '1.4' },
        })
      );
    }
    group.appendChild(labelRow);
    return group;
  }

  function createControlRow(label, control, helperText) {
    const row = ui.create('div', {
      style: { display: 'flex', flexDirection: 'column', gap: '6px' },
    });
    row.appendChild(
      ui.create('span', {
        textContent: label,
        style: {
          color: '#cbd5e1',
          fontSize: '10px',
          fontWeight: '600',
          textTransform: 'uppercase',
        },
      })
    );
    row.appendChild(control);
    if (helperText) {
      row.appendChild(
        ui.create('span', {
          textContent: helperText,
          style: { color: '#64748b', fontSize: '10px', lineHeight: '1.4' },
        })
      );
    }
    return row;
  }

  function createSlider(value, onChange, options = {}) {
    const slider = ui.create('input', {
      attrs: {
        type: 'range',
        min: options.min || '0',
        max: options.max || '100',
        step: options.step || '1',
        value: String(value),
        'aria-label': options.label || 'Slider',
      },
      style: {
        width: '100%',
        accentColor: '#3b82f6',
      },
    });
    slider.oninput = (e) => onChange(e.target.value);
    return slider;
  }

  function createToggleGroup(labels, current, onChange) {
    const group = ui.create('div', {
      style: {
        display: 'grid',
        gridTemplateColumns: `repeat(${labels.length}, minmax(0, 1fr))`,
        gap: '6px',
      },
    });
    labels.forEach((label) => {
      const button = wbCreatePillButton(ui, label, label === current);
      button.onclick = () => onChange(label);
      group.appendChild(button);
    });
    return group;
  }

  function refreshOptions() {
    if (!optionsBody) return;
    optionsBody.innerHTML = '';
    if (!selectedElement) {
      const emptyState = ui.create('div', {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '16px',
          alignItems: 'flex-start',
        },
      });
      emptyState.appendChild(
        ui.create('span', {
          textContent: 'No element selected',
          style: { color: '#e2e8f0', fontSize: '13px', fontWeight: '700' },
        })
      );
      emptyState.appendChild(
        ui.create('span', {
          textContent: 'Choose Select, click an element, and edit formatting from here.',
          style: { color: '#64748b', fontSize: '11px', lineHeight: '1.5' },
        })
      );
      optionsBody.appendChild(emptyState);
      return;
    }

    const elementTag = selectedElement.tagName.toLowerCase();
    const computed = window.getComputedStyle(selectedElement);
    const isTextElement =
      selectedElement.isContentEditable ||
      ['p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'a'].includes(elementTag) ||
      (elementTag === 'div' && selectedElement.getAttribute('contenteditable') === 'true');

    const header = createFieldGroup(`Selected <${elementTag}>`, 'Formatting controls');
    const metaRow = ui.create('div', {
      style: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
    });
    metaRow.appendChild(
      ui.create('span', {
        textContent: selectedElement.isContentEditable ? 'Editable' : 'Static',
        style: {
          background: '#1d4ed8',
          color: '#eff6ff',
          borderRadius: '999px',
          padding: '4px 10px',
          fontSize: '10px',
          fontWeight: '700',
        },
      })
    );
    metaRow.appendChild(
      ui.create('span', {
        textContent: selectedElement.tagName === 'IMG' ? 'Media' : 'Layout',
        style: {
          background: '#1e293b',
          color: '#cbd5e1',
          borderRadius: '999px',
          padding: '4px 10px',
          fontSize: '10px',
          fontWeight: '600',
        },
      })
    );
    header.appendChild(metaRow);
    optionsBody.appendChild(header);

    if (isTextElement) {
      const typography = createFieldGroup('Typography', 'Fine-tune the selected text block.');
      typography.appendChild(
        createControlRow(
          'Font size',
          createSlider(
            parseFloat(computed.fontSize) || 16,
            (next) => {
              applyStyleWithUndo(selectedElement, 'fontSize', `${next}px`);
            },
            { min: '10', max: '72', label: 'Font size' }
          )
        )
      );
      typography.appendChild(
        createControlRow(
          'Line height',
          createSlider(
            parseFloat(computed.lineHeight) || 1.5,
            (next) => {
              applyStyleWithUndo(selectedElement, 'lineHeight', String(next));
            },
            { min: '1', max: '3', step: '0.1', label: 'Line height' }
          )
        )
      );

      const alignCurrent = (computed.textAlign || 'left').replace(/^[a-z]/, (match) =>
        match.toUpperCase()
      );
      typography.appendChild(
        createControlRow(
          'Alignment',
          createToggleGroup(['Left', 'Center', 'Right'], alignCurrent, (value) => {
            applyStyleWithUndo(selectedElement, 'textAlign', value.toLowerCase());
            refreshOptions();
          })
        )
      );

      const emphasisRow = ui.create('div', {
        style: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' },
      });
      const isBold =
        parseInt(computed.fontWeight || '400', 10) >= 600 || computed.fontWeight === 'bold';
      const isItalic = computed.fontStyle === 'italic';
      const boldBtn = wbCreatePillButton(ui, 'Bold', isBold);
      boldBtn.onclick = () =>
        applyStyleWithUndo(selectedElement, 'fontWeight', isBold ? '400' : '700');
      const italicBtn = wbCreatePillButton(ui, 'Italic', isItalic);
      italicBtn.onclick = () =>
        applyStyleWithUndo(selectedElement, 'fontStyle', isItalic ? 'normal' : 'italic');
      emphasisRow.appendChild(boldBtn);
      emphasisRow.appendChild(italicBtn);
      typography.appendChild(createControlRow('Emphasis', emphasisRow));
      optionsBody.appendChild(typography);
    }

    const appearance = createFieldGroup(
      'Appearance',
      'Use the blue picker and sliders for clean visual tweaks.'
    );
    const colorInput = ui.create('input', {
      attrs: { type: 'color', value: '#2563eb', 'aria-label': 'Color picker' },
      style: {
        width: '100%',
        height: '40px',
        border: '1px solid #334155',
        borderRadius: '12px',
        background: '#0f172a',
        padding: '4px',
      },
    });
    colorInput.oninput = (e) => {
      const next = e.target.value;
      const prop = selectedElement.tagName === 'IMG' ? 'borderColor' : 'color';
      applyStyleWithUndo(selectedElement, prop, next);
    };
    appearance.appendChild(
      createControlRow('Accent color', colorInput, 'Applies to text, borders, and image outlines.')
    );

    const backgroundInput = ui.create('input', {
      attrs: { type: 'color', value: '#0f172a', 'aria-label': 'Background color' },
      style: {
        width: '100%',
        height: '40px',
        border: '1px solid #334155',
        borderRadius: '12px',
        background: '#0f172a',
        padding: '4px',
      },
    });
    backgroundInput.oninput = (e) => {
      applyStyleWithUndo(selectedElement, 'backgroundColor', e.target.value);
    };
    appearance.appendChild(createControlRow('Background', backgroundInput));

    appearance.appendChild(
      createControlRow(
        'Opacity',
        createSlider(
          parseFloat(computed.opacity) || 1,
          (next) => {
            applyStyleWithUndo(selectedElement, 'opacity', String(next));
          },
          { min: '0.2', max: '1', step: '0.05', label: 'Opacity' }
        )
      )
    );

    const radiusValue = parseFloat(computed.borderRadius || '0') || 0;
    appearance.appendChild(
      createControlRow(
        'Corner radius',
        createSlider(
          radiusValue,
          (next) => {
            applyStyleWithUndo(selectedElement, 'borderRadius', `${next}px`);
          },
          { min: '0', max: '48', label: 'Corner radius' }
        )
      )
    );

    if (!isTextElement) {
      const widthValue = Math.round(selectedElement.getBoundingClientRect().width || 240);
      appearance.appendChild(
        createControlRow(
          'Width',
          createSlider(
            widthValue,
            (next) => {
              applyStyleWithUndo(selectedElement, 'width', `${next}px`);
            },
            { min: '60', max: '1400', label: 'Width' }
          )
        )
      );

      const heightValue = Math.round(selectedElement.getBoundingClientRect().height || 160);
      appearance.appendChild(
        createControlRow(
          'Height',
          createSlider(
            heightValue,
            (next) => {
              applyStyleWithUndo(selectedElement, 'height', `${next}px`);
            },
            { min: '40', max: '900', label: 'Height' }
          )
        )
      );
    }

    if (selectedElement.tagName === 'IMG') {
      const widthValue = Math.round(selectedElement.getBoundingClientRect().width || 300);
      appearance.appendChild(
        createControlRow(
          'Image width',
          createSlider(
            widthValue,
            (next) => {
              applyStyleWithUndo(selectedElement, 'width', `${next}px`);
            },
            { min: '80', max: '1200', label: 'Image width' }
          )
        )
      );
    }

    optionsBody.appendChild(appearance);
  }

  function setActiveTool(name) {
    activeTool = name;
    toolButtons.forEach((button, key) => {
      wbStyleToolbarButton(button, key === name);
    });
  }

  function onDocumentClick(e) {
    if (isBookmarkletElement(e.target)) return;
    if (activeTool === 'select') {
      setSelectedElement(e.target);
      e.preventDefault();
      e.stopPropagation();
    }
  }

  function onDocumentMouseDown(e) {
    if (activeTool !== 'pan' || isBookmarkletElement(e.target) || e.button !== 0) return;
    setSelectedElement(e.target);
    const target = selectedElement;
    if (!target) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const startTransform = target.style.transform || '';
    const baseX = parseFloat(target.dataset.webbenderPanX || '0');
    const baseY = parseFloat(target.dataset.webbenderPanY || '0');
    pointerDrag = { target, startX, startY, baseX, baseY, startTransform };
    e.preventDefault();
    e.stopPropagation();
  }

  function onDocumentMouseMove(e) {
    if (!pointerDrag) return;
    const dx = e.clientX - pointerDrag.startX;
    const dy = e.clientY - pointerDrag.startY;
    const x = pointerDrag.baseX + dx;
    const y = pointerDrag.baseY + dy;
    pointerDrag.target.dataset.webbenderPanX = String(x);
    pointerDrag.target.dataset.webbenderPanY = String(y);
    pointerDrag.target.style.transform = `translate(${x}px, ${y}px)`;
    e.preventDefault();
    e.stopPropagation();
  }

  function onDocumentMouseUp(e) {
    if (!pointerDrag) return;
    const drag = pointerDrag;
    pointerDrag = null;
    const finalTransform = drag.target.style.transform || '';
    const finalX = drag.target.dataset.webbenderPanX || '0';
    const finalY = drag.target.dataset.webbenderPanY || '0';
    if (finalTransform !== drag.startTransform) {
      createOperation(
        () => {
          drag.target.style.transform = finalTransform;
          drag.target.dataset.webbenderPanX = finalX;
          drag.target.dataset.webbenderPanY = finalY;
        },
        () => {
          drag.target.style.transform = drag.startTransform;
          drag.target.dataset.webbenderPanX = String(drag.baseX);
          drag.target.dataset.webbenderPanY = String(drag.baseY);
        }
      );
    }
    e.preventDefault();
    e.stopPropagation();
  }

  function closeImmersivePanel() {
    if (!immersivePanel) return;
    document.removeEventListener('click', onDocumentClick, true);
    document.removeEventListener('mousedown', onDocumentMouseDown, true);
    document.removeEventListener('mousemove', onDocumentMouseMove, true);
    document.removeEventListener('mouseup', onDocumentMouseUp, true);
    setSelectedElement(null);
    immersivePanel.remove();
    immersivePanel = null;
    pointerDrag = null;
    startBtn.textContent = 'Start Immersive Edit';
  }

  function discardUnsaved() {
    for (let i = undoStack.length - 1; i >= 0; i--) {
      undoStack[i].undoAction();
    }
    undoStack.length = 0;
    redoStack.length = 0;
    sessionStack.length = 0;
    markUnsaved(false);
  }

  const toolButtons = new Map();
  let saveBtn = null;
  window._webbenderCloseImmersiveSheet = function () {
    if (!immersivePanel) return true;
    if (unsavedChanges) {
      const confirmClose = confirm('Delete unsaved immersive edits?');
      if (!confirmClose) return false;
      discardUnsaved();
    }
    closeImmersivePanel();
    return true;
  };

  function makeDraggablePanel(panel, handle) {
    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;
    handle.onmousedown = (e) => {
      dragging = true;
      panel.style.transform = 'none';
      offsetX = e.clientX - panel.getBoundingClientRect().left;
      offsetY = e.clientY - panel.getBoundingClientRect().top;
      e.preventDefault();
    };
    document.addEventListener('mousemove', (e) => {
      if (!dragging || panel !== immersivePanel) return;
      panel.style.left = `${Math.max(8, Math.min(window.innerWidth - panel.offsetWidth - 8, e.clientX - offsetX))}px`;
      panel.style.top = `${Math.max(8, Math.min(window.innerHeight - panel.offsetHeight - 8, e.clientY - offsetY))}px`;
      panel.style.bottom = 'auto';
    });
    document.addEventListener('mouseup', () => {
      dragging = false;
    });
  }

  function openImmersivePanel() {
    if (immersivePanel) return;
    wbEnsureMaterialSymbols();
    immersivePanel = ui.create('div', {
      attrs: { id: 'webbender-immersive-sheet' },
      style: {
        position: 'fixed',
        left: '50%',
        bottom: '16px',
        transform: 'translateX(-50%)',
        width: 'min(960px, calc(100vw - 24px))',
        background: 'linear-gradient(180deg, #0b1120 0%, #0f172a 100%)',
        border: '1px solid #334155',
        borderRadius: '24px',
        padding: '12px',
        zIndex: '2147483646',
        color: '#f8fafc',
        boxShadow: '0 10px 35px rgba(0,0,0,0.5)',
        display: 'grid',
        gridTemplateColumns: '88px minmax(0, 1fr)',
        gap: '12px',
      },
    });
    const handle = ui.create('div', {
      textContent: 'Immersive Actions',
      attrs: { 'aria-label': 'Drag immersive panel' },
      style: {
        cursor: 'move',
        textAlign: 'center',
        fontSize: '11px',
        color: '#94a3b8',
        borderBottom: '1px solid #1e293b',
        paddingBottom: '6px',
        gridColumn: '1 / -1',
      },
    });
    const toolbar = ui.create('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        padding: '10px',
        borderRadius: '20px',
        background: '#0f172a',
        border: '1px solid #1e293b',
        minHeight: '100%',
        boxSizing: 'border-box',
      },
    });
    optionsBody = ui.create('div', {
      style: {
        border: '1px solid #1e293b',
        borderRadius: '20px',
        padding: '12px',
        minHeight: '320px',
        fontSize: '11px',
        color: '#cbd5e1',
        background: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        boxSizing: 'border-box',
        overflowY: 'auto',
      },
    });

    const selectBtn = wbCreateToolbarButton(ui, 'near_me', 'Select', () => setActiveTool('select'));
    const panBtn = wbCreateToolbarButton(ui, 'drag_pan', 'Pan', () => setActiveTool('pan'));
    const textBtn = wbCreateToolbarButton(ui, 'text_fields', 'Text', () => {
      const textNode = ui.create('div', {
        textContent: 'Editable text',
        attrs: { contenteditable: 'true' },
        style: { padding: '4px', border: '1px dashed #60a5fa', minHeight: '24px' },
      });
      const target = selectedElement;
      createOperation(
        () => insertNodeAfter(target, textNode),
        () => textNode.remove()
      );
      setSelectedElement(textNode);
      setActiveTool('select');
    });
    const shapeBtn = wbCreateToolbarButton(ui, 'square', 'Shapes', () => {
      const shape = ui.create('div', {
        style: {
          width: '120px',
          height: '80px',
          background: '#38bdf8',
          borderRadius: '8px',
          border: '1px solid #0ea5e9',
        },
      });
      const target = selectedElement;
      createOperation(
        () => insertNodeAfter(target, shape),
        () => shape.remove()
      );
      setSelectedElement(shape);
    });
    const imageBtn = wbCreateToolbarButton(ui, 'image', 'Image', () => {
      const src = prompt('Image URL:', 'https://');
      if (!src) return;
      const image = ui.create('img', {
        attrs: { src, alt: 'Immersive inserted image' },
        style: { maxWidth: '320px', borderRadius: '8px', border: '1px solid #334155' },
      });
      const target = selectedElement;
      createOperation(
        () => insertNodeAfter(target, image),
        () => image.remove()
      );
      setSelectedElement(image);
    });
    const duplicateBtn = wbCreateToolbarButton(ui, 'content_copy', 'Duplicate', () => {
      if (!selectedElement) return;
      copiedElement = selectedElement.cloneNode(true);
      const clone = copiedElement.cloneNode(true);
      const target = selectedElement;
      createOperation(
        () => insertNodeAfter(target, clone),
        () => clone.remove()
      );
      setSelectedElement(clone);
    });
    const deleteBtn = wbCreateToolbarButton(ui, 'delete', 'Delete', () => {
      if (!selectedElement || !selectedElement.parentNode) return;
      const node = selectedElement;
      const parent = node.parentNode;
      const next = node.nextSibling;
      createOperation(
        () => node.remove(),
        () => parent.insertBefore(node, next)
      );
      setSelectedElement(null);
    });
    const colorBtn = wbCreateToolbarButton(ui, 'palette', 'Color picker', () => {
      setActiveTool('color');
      refreshOptions();
    });
    const optionsBtn = wbCreateToolbarButton(ui, 'tune', 'Options', () => {
      setActiveTool('options');
      refreshOptions();
    });
    const undoBtn = wbCreateToolbarButton(ui, 'undo', 'Undo', () => undo());
    const redoBtn = wbCreateToolbarButton(ui, 'redo', 'Redo', () => redo());
    saveBtn = wbCreateToolbarButton(ui, 'save', 'Save', () => {
      undoStack.length = 0;
      redoStack.length = 0;
      sessionStack.length = 0;
      markUnsaved(false);
    });
    const closeBtn = wbCreateToolbarButton(ui, 'close', 'Close', () =>
      window._webbenderCloseImmersiveSheet()
    );
    closeBtn.style.background = '#7f1d1d';
    closeBtn.style.color = '#fecaca';
    closeBtn.style.borderColor = '#ef4444';

    toolButtons.set('select', selectBtn);
    toolButtons.set('pan', panBtn);
    toolButtons.set('color', colorBtn);
    toolButtons.set('options', optionsBtn);

    const toolbarTop = ui.create('div', {
      style: { display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' },
    });
    ui.append(toolbarTop, [
      undoBtn,
      redoBtn,
      selectBtn,
      panBtn,
      textBtn,
      shapeBtn,
      imageBtn,
      duplicateBtn,
      deleteBtn,
    ]);
    const toolbarBottom = ui.create('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        alignItems: 'center',
        marginTop: 'auto',
      },
    });
    ui.append(toolbarBottom, [colorBtn, optionsBtn, saveBtn, closeBtn]);
    ui.append(toolbar, [toolbarTop, toolbarBottom]);

    const formatPane = ui.create('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        minWidth: '0',
      },
    });
    const formatHeader = createFieldGroup(
      'Formatting pane',
      'Blue-highlighted controls stay close to the selected element.'
    );
    formatPane.appendChild(formatHeader);
    formatPane.appendChild(optionsBody);
    ui.append(immersivePanel, [handle, toolbar, formatPane]);
    document.body.appendChild(immersivePanel);

    document.addEventListener('click', onDocumentClick, true);
    document.addEventListener('mousedown', onDocumentMouseDown, true);
    document.addEventListener('mousemove', onDocumentMouseMove, true);
    document.addEventListener('mouseup', onDocumentMouseUp, true);
    setActiveTool('select');
    refreshOptions();
    markUnsaved(false);
    makeDraggablePanel(immersivePanel, handle);
    startBtn.textContent = 'Immersive Edit Running';
  }

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
        if (
          typeof window._webbenderCloseImmersiveSheet === 'function' &&
          !window._webbenderCloseImmersiveSheet()
        ) {
          return;
        }
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
