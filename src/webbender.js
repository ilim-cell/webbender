javascript: (function () {
  const DB_NAME = 'webbender_db',
    DB_VERSION = 1;
  let db = null;
  let hasUnsavedChanges = false;
  let autosaveTimeout = null;
  const hostId = 'webbender-ui';

  /* -------------------------------------------------- */
  /* 1. LOCAL STORAGE & PERSISTENCE ENGINE              */
  /* -------------------------------------------------- */
  function initDB() {
    return new Promise((resolve) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (e) => {
        const database = e.target.result;
        if (!database.objectStoreNames.contains('assets'))
          database.createObjectStore('assets', { keyPath: 'id' });
        if (!database.objectStoreNames.contains('history'))
          database.createObjectStore('history', { autoIncrement: true });
      };
      request.onsuccess = (e) => {
        db = e.target.result;
        resolve(db);
      };
      request.onerror = () => {
        resolve(null);
      };
    });
  }
  function cacheAsset(id, data) {
    if (!db) return;
    const tx = db.transaction('assets', 'readwrite');
    tx.objectStore('assets').put({ id, data });
  }
  function getAsset(id) {
    return new Promise((resolve) => {
      if (!db) return resolve(null);
      const tx = db.transaction('assets', 'readonly');
      const req = tx.objectStore('assets').get(id);
      req.onsuccess = () => resolve(req.result ? req.result.data : null);
      req.onerror = () => resolve(null);
    });
  }
  function deleteAsset(id) {
    return new Promise((resolve) => {
      if (!db) return resolve();
      const tx = db.transaction('assets', 'readwrite');
      const req = tx.objectStore('assets').delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  }

  /* -------------------------------------------------- */
  /* 2. AUTOSAVE TRIGGER ENGINE (DEBOUNCED)             */
  /* -------------------------------------------------- */
  function triggerAutosave() {
    hasUnsavedChanges = true;
    clearTimeout(autosaveTimeout);
    autosaveTimeout = setTimeout(() => {
      if (!db) return;
      const hostNode = document.getElementById(hostId);
      let hostParent = null,
        hostSibling = null;
      if (hostNode) {
        hostParent = hostNode.parentNode;
        hostSibling = hostNode.nextSibling;
        hostNode.remove();
      }
      const cleanHTML = document.body.innerHTML;
      if (hostNode && hostParent) {
        hostParent.insertBefore(hostNode, hostSibling);
      }
      cacheAsset('autosave_' + location.href, {
        html: cleanHTML,
        timestamp: Date.now(),
      });
    }, 1000);
  }
  window.addEventListener('beforeunload', (e) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = '';
    }
  });

  /* -------------------------------------------------- */
  /* 3. LOCALIZED ICON CACHING SYSTEM                  */
  /* -------------------------------------------------- */
  async function loadMaterialSymbols(styleEl) {
    const cachedFont = await getAsset('material-symbols-base64');
    if (cachedFont) {
      styleEl.textContent = `@font-face { font-family: 'Material Symbols Rounded'; font-style: normal; font-weight: 100 700; src: url(${cachedFont}) format('woff2'); } .material-symbols-rounded { font-family: 'Material Symbols Rounded'; font-weight: normal; font-style: normal; font-size: 18px; line-height: 1; display: inline-block; text-transform: none; letter-spacing: normal; word-wrap: normal; white-space: nowrap; direction: ltr; -webkit-font-smoothing: antialiased; }`;
      return;
    }
    styleEl.textContent = `.material-symbols-rounded { font-family: sans-serif; font-size: 11px; }`;
    try {
      const res = await fetch(
        'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200'
      );
      const text = await res.text();
      const fontUrl = text.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/)[1];
      const fontRes = await fetch(fontUrl);
      const blob = await fontRes.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result;
        cacheAsset('material-symbols-base64', base64data);
        styleEl.textContent = `@font-face { font-family: 'Material Symbols Rounded'; font-style: normal; font-weight: 100 700; src: url(${base64data}) format('woff2'); } .material-symbols-rounded { font-family: 'Material Symbols Rounded'; font-weight: normal; font-style: normal; font-size: 18px; line-height: 1; display: inline-block; text-transform: none; letter-spacing: normal; word-wrap: normal; white-space: nowrap; direction: ltr; -webkit-font-smoothing: antialiased; }`;
      };
      reader.readAsDataURL(blob);
    } catch (e) {}
  }

  /* -------------------------------------------------- */
  /* 4. TRANSACTION TIMELINE (UNDO / REDO ENGINE)       */
  /* -------------------------------------------------- */
  const historyStack = [];
  let historyIndex = -1;
  function pushHistoryState(target, type, oldVal, newVal) {
    if (historyIndex < historyStack.length - 1) {
      historyStack.splice(historyIndex + 1);
    }
    historyStack.push({ target, type, oldVal, newVal });
    historyIndex++;
    triggerAutosave();
  }
  function executeUndo() {
    if (historyIndex < 0) return;
    const action = historyStack[historyIndex];
    if (action.type === 'style') {
      action.target.style[action.oldVal.prop] = action.oldVal.value;
    } else if (action.type === 'remove') {
      action.oldVal.parent.insertBefore(action.target, action.oldVal.nextSibling);
    } else if (action.type === 'insert') {
      action.target.remove();
    } else if (action.type === 'text') {
      action.target.innerHTML = action.oldVal;
    }
    historyIndex--;
    triggerAutosave();
  }
  function executeRedo() {
    if (historyIndex >= historyStack.length - 1) return;
    historyIndex++;
    const action = historyStack[historyIndex];
    if (action.type === 'style') {
      action.target.style[action.newVal.prop] = action.newVal.value;
    } else if (action.type === 'remove') {
      action.target.remove();
    } else if (action.type === 'insert') {
      action.oldVal.parent.insertBefore(action.target, action.oldVal.nextSibling);
    } else if (action.type === 'text') {
      action.target.innerHTML = action.newVal;
    }
    triggerAutosave();
  }

  /* -------------------------------------------------- */
  /* 5. WEB UTILITIES & ELEMENT FACTORY                 */
  /* -------------------------------------------------- */
  function wbUI(root) {
    return {
      create(e, t = {}) {
        const n = document.createElement(e);
        if (t.textContent !== undefined) n.textContent = t.textContent;
        if (t.attrs) Object.entries(t.attrs).forEach(([key, val]) => n.setAttribute(key, val));
        if (t.style) Object.assign(n.style, t.style);
        return n;
      },
      append(e, t) {
        t.forEach((child) => e.appendChild(child));
        return e;
      },
      button(iconName, textFallback, t, n = {}) {
        const o = this.create('button', { style: t });
        const iconSpan = this.create('span', {
          textContent: iconName,
          attrs: { class: 'material-symbols-rounded' },
        });
        o.appendChild(iconSpan);
        if (n.click) o.onclick = n.click;
        return o;
      },
    };
  }
  function wbGetStyleElement(e) {
    let t = document.getElementById(e);
    if (!t) {
      t = document.createElement('style');
      t.id = e;
      document.head.appendChild(t);
    }
    return t;
  }
  function wbInitState(hostId) {
    const t = 'webbender-settings',
      n = document.getElementById(hostId);
    if (n) {
      if (typeof window._webbenderToggleTextEdit === 'function')
        window._webbenderToggleTextEdit(false);
      if (typeof window._webbenderToggleMove === 'function') window._webbenderToggleMove(false);
      if (typeof window._webbenderToggleRemove === 'function') window._webbenderToggleRemove(false);
      if (typeof window._webbenderToggleSelect === 'function') window._webbenderToggleSelect(false);
      if (typeof window._webbenderToggleXray === 'function') window._webbenderToggleXray(false);
      n.remove();
      return null;
    }
    const o = {
      editMode: false,
      moveMode: false,
      removeMode: false,
      selectMode: false,
      snapMode: true,
      xrayMode: false,
      theme: 'default',
      panelLeft: 'auto',
      panelY: '20px',
      panelRight: '20px',
      isMinimized: false,
      activeTab: 'edit',
    };
    try {
      const e = localStorage.getItem(t);
      if (e) Object.assign(o, JSON.parse(e));
    } catch (e) {}
    return {
      ID: hostId,
      STORAGE_KEY: t,
      VERSION: '1.9.0',
      BUILD_DATE: '2026-07-20T00:00:00.000Z',
      VERSION_URL: 'https://webbender.web.app/version.json',
      settings: o,
      saveSettings: function () {
        try {
          localStorage.setItem(t, JSON.stringify(o));
        } catch (e) {}
      },
    };
  }

  /* -------------------------------------------------- */
  /* 6. DRAGGING, LAYOUT BOUNDS & POSITION CONTROLS     */
  /* -------------------------------------------------- */
  function wbCreateContainer(ui, id, state) {
    return ui.create('div', {
      attrs: { id: id },
      style: {
        position: 'fixed',
        top: state.settings.panelY || '20px',
        right: state.settings.panelRight || '20px',
        left: state.settings.panelLeft || 'auto',
        width: '320px',
        backgroundColor: '#18181b',
        color: '#f4f4f5',
        padding: '14px',
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
        gap: '12px',
        touchAction: 'none',
        opacity: state.settings.isMinimized ? '0' : '1',
        transform: state.settings.isMinimized
          ? 'scale(0.85) translateY(-10px)'
          : 'scale(1) translateY(0)',
        pointerEvents: state.settings.isMinimized ? 'none' : 'auto',
        transition: 'opacity 0.22s ease, transform 0.22s ease',
      },
    });
  }

  /* Draggable Minimized Badge with Springs and Edge-Snapping Bounces */
  function wbCreateMinimizedBadge(ui, host, container, state) {
    const badge = ui.create('div', {
      style: {
        position: 'fixed',
        top: state.settings.panelY || '20px',
        right: state.settings.panelRight || '20px',
        left: state.settings.panelLeft || 'auto',
        width: '42px',
        height: '42px',
        backgroundColor: '#2563eb',
        color: '#fff',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        fontWeight: 'bold',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        cursor: 'grab',
        zIndex: '2147483647',
        border: '2px solid #fff',
        touchAction: 'none',
        opacity: state.settings.isMinimized ? '1' : '0',
        transform: state.settings.isMinimized ? 'scale(1)' : 'scale(0.6)',
        pointerEvents: state.settings.isMinimized ? 'auto' : 'none',
        transition: 'opacity 0.22s ease, transform 0.22s ease',
      },
    });
    badge.textContent = 'W';

    let badgeDrag = null;
    let badgeAnimId = null;

    function snapToEdge() {
      const rect = badge.getBoundingClientRect();
      const targetX =
        rect.left + rect.width / 2 < window.innerWidth / 2
          ? 10
          : window.innerWidth - rect.width - 10;
      const targetY = Math.max(10, Math.min(window.innerHeight - rect.height - 10, rect.top));

      let x = rect.left;
      let y = rect.top;
      let vx = 0;
      let vy = 0;

      cancelAnimationFrame(badgeAnimId);
      const step = () => {
        const ax = (targetX - x) * 0.15; // Spring force
        const ay = (targetY - y) * 0.15;
        vx = (vx + ax) * 0.75; // Friction
        vy = (vy + ay) * 0.75;
        x += vx;
        y += vy;

        badge.style.left = `${x}px`;
        badge.style.top = `${y}px`;
        badge.style.right = 'auto';

        if (
          Math.abs(vx) > 0.05 ||
          Math.abs(vy) > 0.05 ||
          Math.abs(targetX - x) > 0.5 ||
          Math.abs(targetY - y) > 0.5
        ) {
          badgeAnimId = requestAnimationFrame(step);
        } else {
          badge.style.left = `${targetX}px`;
          badge.style.top = `${targetY}px`;
          state.settings.panelLeft = badge.style.left;
          state.settings.panelY = badge.style.top;
          state.settings.panelRight = 'auto';
          state.saveSettings();
        }
      };
      badgeAnimId = requestAnimationFrame(step);
    }

    badge.addEventListener('pointerdown', (e) => {
      if (e.target !== badge) return;
      badge.style.cursor = 'grabbing';
      cancelAnimationFrame(badgeAnimId);
      container.style.transition = badge.style.transition = 'none';
      const rect = badge.getBoundingClientRect();
      badgeDrag = {
        startX: e.clientX,
        startY: e.clientY,
        initialLeft: rect.left,
        initialTop: rect.top,
      };
      document.addEventListener('pointermove', onBadgeDrag);
      document.addEventListener('pointerup', stopBadgeDrag);
      e.preventDefault();
    });

    const onBadgeDrag = (e) => {
      if (!badgeDrag) return;
      const left = badgeDrag.initialLeft + (e.clientX - badgeDrag.startX);
      const top = badgeDrag.initialTop + (e.clientY - badgeDrag.startY);
      badge.style.left = `${left}px`;
      badge.style.top = `${top}px`;
      badge.style.right = 'auto';
    };

    const stopBadgeDrag = () => {
      if (!badgeDrag) return;
      badgeDrag = null;
      badge.style.cursor = 'grab';
      document.removeEventListener('pointermove', onBadgeDrag);
      document.removeEventListener('pointerup', stopBadgeDrag);
      snapToEdge();
    };

    badge.ondblclick = () => {
      state.settings.isMinimized = false;
      state.saveSettings();
      badge.style.opacity = '0';
      badge.style.transform = 'scale(0.6)';
      badge.style.pointerEvents = 'none';
      container.style.pointerEvents = 'auto';
      container.style.opacity = '1';
      container.style.transform = 'scale(1) translateY(0)';
      container.style.top = badge.style.top;
      container.style.left = badge.style.left;
      container.style.right = badge.style.right;
    };

    return badge;
  }

  function wbEnablePanelDragging(container, badge, header, state) {
    let activeDrag = null;
    header.style.cursor = 'move';
    const startDrag = (e) => {
      if (
        e.target.tagName === 'BUTTON' ||
        e.target.classList.contains('tab-btn') ||
        e.target.tagName === 'INPUT' ||
        e.target.closest('span.material-symbols-rounded') ||
        e.target.tagName === 'SELECT'
      )
        return;
      container.style.transition = badge.style.transition = 'none';
      const rect = container.getBoundingClientRect();
      activeDrag = {
        startX: e.clientX,
        startY: e.clientY,
        initialLeft: rect.left,
        initialTop: rect.top,
      };
      document.addEventListener('pointermove', onDrag);
      document.addEventListener('pointerup', stopDrag);
      e.preventDefault();
    };
    const onDrag = (e) => {
      if (!activeDrag) return;
      let finalLeft = activeDrag.initialLeft + (e.clientX - activeDrag.startX);
      let finalTop = activeDrag.initialTop + (e.clientY - activeDrag.startY);
      const maxLeft = window.innerWidth - 330;
      const maxTop = window.innerHeight - 80;
      if (finalLeft < 10) finalLeft = 10;
      if (finalLeft > maxLeft) finalLeft = maxLeft;
      if (finalTop < 10) finalTop = 10;
      if (finalTop > maxTop) finalTop = maxTop;
      container.style.left = badge.style.left = `${finalLeft}px`;
      container.style.top = badge.style.top = `${finalTop}px`;
      container.style.right = badge.style.right = 'auto';
    };
    const stopDrag = () => {
      if (!activeDrag) return;
      container.style.transition = badge.style.transition =
        'opacity 0.22s ease, transform 0.22s ease';
      state.settings.panelLeft = container.style.left;
      state.settings.panelY = container.style.top;
      state.settings.panelRight = 'auto';
      state.saveSettings();
      activeDrag = null;
      document.removeEventListener('pointermove', onDrag);
      document.removeEventListener('pointerup', stopDrag);
    };
    header.addEventListener('pointerdown', startDrag);
  }

  /* -------------------------------------------------- */
  /* 7. PREVIEW MODE ENGINE (TOGGLEABLE STYLES)         */
  /* -------------------------------------------------- */
  let previewActive = false;
  function toggleAllChanges(enable) {
    // Toggle all modified style overlays
    document.querySelectorAll('[data-wb-orig-style]').forEach((el) => {
      if (enable) {
        el.setAttribute('style', el.getAttribute('data-wb-mod-style') || '');
      } else {
        el.setAttribute('style', el.getAttribute('data-wb-orig-style') || '');
      }
    });
    // Toggle text editing revisions
    document.querySelectorAll('[data-wb-orig-text]').forEach((el) => {
      el.innerHTML = enable
        ? el.getAttribute('data-wb-mod-text') || el.innerHTML
        : el.getAttribute('data-wb-orig-text');
    });
  }

  /* -------------------------------------------------- */
  /* 8. MODULAR SECTION WORKFLOW COMPONENTS             */
  /* -------------------------------------------------- */
  function wbCreateHeader(ui, hostElement, container, badge, state, shadow) {
    const n = ui.create('div', {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #27272a',
          paddingBottom: '6px',
        },
      }),
      o = ui.create('span', {
        textContent: 'Webbender',
        style: { fontWeight: '700', fontSize: '14px' },
      }),
      actions = ui.create('div', { style: { display: 'flex', gap: '6px', alignItems: 'center' } }),
      btnSt = {
        background: 'none',
        border: 'none',
        color: '#71717a',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        padding: '2px',
        transition: 'color 0.15s ease',
      },
      /* Preview Mode Switch */
      previewBtn = ui.button('visibility', '👁', btnSt, {
        click: () => {
          previewActive = !previewActive;
          togglePreviewMode(previewActive);
        },
      }),
      undoBtn = ui.button('undo', '↩', btnSt, { click: () => executeUndo() }),
      redoBtn = ui.button('redo', '↪', btnSt, { click: () => executeRedo() }),
      minBtn = ui.button('minimize', '−', btnSt, {
        click: () => {
          state.settings.isMinimized = true;
          state.saveSettings();
          container.style.opacity = '0';
          container.style.transform = 'scale(0.85) translateY(-10px)';
          container.style.pointerEvents = 'none';
          badge.style.pointerEvents = 'auto';
          badge.style.opacity = '1';
          badge.style.transform = 'scale(1)';
        },
      }),
      closeBtn = ui.button('close', '✕', btnSt, {
        click: () => {
          window._webbenderToggleRemove(false);
          window._webbenderToggleMove(false);
          window._webbenderToggleSelect(false);
          window._webbenderToggleTextEdit(false);
          window._webbenderToggleXray(false);
          if (window._webbenderOverlay) window._webbenderOverlay.style.display = 'none';
          hostElement.remove();
        },
      });

    let exitPreviewBtn = null;
    function togglePreviewMode(active) {
      if (active) {
        container.style.opacity = '0';
        container.style.pointerEvents = 'none';
        if (window._webbenderOverlay) window._webbenderOverlay.style.display = 'none';
        toggleAllChanges(false);

        if (!exitPreviewBtn) {
          exitPreviewBtn = ui.create('button', {
            textContent: 'Exit Preview',
            style: {
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 14px',
              fontWeight: 'bold',
              fontSize: '12px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              zIndex: '2147483647',
            },
          });
          exitPreviewBtn.onclick = () => togglePreviewMode(false);
          shadow.appendChild(exitPreviewBtn);
        }
        exitPreviewBtn.style.display = 'block';
      } else {
        container.style.opacity = '1';
        container.style.pointerEvents = 'auto';
        toggleAllChanges(true);
        if (exitPreviewBtn) exitPreviewBtn.style.display = 'none';
        previewActive = false;
        if (typeof window._webbenderUpdateOverlay === 'function') window._webbenderUpdateOverlay();
      }
    }

    ui.append(actions, [previewBtn, undoBtn, redoBtn, minBtn, closeBtn]);
    ui.append(n, [o, actions]);
    return { header: n };
  }

  function wbCreateTabs(ui, container, state) {
    const row = ui.create('div', {
        style: { display: 'flex', background: '#27272a', borderRadius: '8px', padding: '2px' },
      }),
      views = {
        edit: ui.create('div', {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            transition: 'opacity 0.2s ease, transform 0.2s ease',
          },
        }),
        restyle: ui.create('div', {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            transition: 'opacity 0.2s ease, transform 0.2s ease',
          },
        }),
        test: ui.create('div', {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            transition: 'opacity 0.2s ease, transform 0.2s ease',
          },
        }),
      },
      btns = {};
    function setTab(target) {
      state.settings.activeTab = target;
      state.saveSettings();
      Object.entries(views).forEach(([name, el]) => {
        const isActive = name === target;
        if (isActive) {
          el.style.display = 'flex';
          el.offsetHeight;
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        } else {
          el.style.display = 'none';
          el.style.opacity = '0';
          el.style.transform = 'translateY(4px)';
        }
        if (btns[name]) {
          btns[name].style.background = isActive ? '#3f3f46' : 'transparent';
          btns[name].style.color = isActive ? '#ffffff' : '#a1a1aa';
        }
      });
    }
    ['Edit', 'Restyle', 'Test'].forEach((label) => {
      const id = label.toLowerCase();
      const b = ui.create('button', {
        textContent: label,
        style: {
          flex: '1',
          background: 'transparent',
          border: 'none',
          color: '#a1a1aa',
          padding: '6px 0',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'background 0.18s ease, color 0.18s ease',
        },
      });
      b.onclick = () => setTab(id);
      b.classList.add('tab-btn');
      btns[id] = b;
      row.appendChild(b);
    });
    return {
      tabRow: row,
      tabViews: views,
      triggerTabSwitch: setTab,
      initTabs: () => setTab(state.settings.activeTab || 'edit'),
    };
  }

  function wbCreateEditRemoveSection(ui, hostElement, state, triggerTabSwitch) {
    const { settings: o, saveSettings: r } = state;
    function isProtected(e) {
      return (
        !e ||
        e === hostElement ||
        hostElement.contains(e) ||
        'HTML' === e.tagName ||
        'BODY' === e.tagName
      );
    }
    function setOutline(e, t) {
      e &&
        e.dataset.webbenderOutlineBackup === undefined &&
        ((e.dataset.webbenderOutlineBackup = e.style.outline || ''), (e.style.outline = t));
    }
    function clearOutline(e) {
      e &&
        e.dataset.webbenderOutlineBackup !== undefined &&
        ((e.style.outline = e.dataset.webbenderOutlineBackup),
        delete e.dataset.webbenderOutlineBackup);
    }

    const s = ui.create('div', {
        style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
      }),
      c = ui.create('label', {
        textContent: 'Edit Text',
        style: {
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flex: '1',
          color: '#86efac',
          fontWeight: '600',
        },
      }),
      l = ui.create('input', {
        attrs: { type: 'checkbox' },
        style: { cursor: 'pointer', width: '16px', height: '16px' },
      });
    const u = ui.create('div', { style: { display: 'flex', flexDirection: 'column', gap: '4px' } }),
      uTop = ui.create('div', {
        style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
      }),
      m = ui.create('label', {
        textContent: 'Move Elements',
        style: { cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', flex: '1' },
      }),
      b = ui.create('input', {
        attrs: { type: 'checkbox' },
        style: { cursor: 'pointer', width: '16px', height: '16px' },
      }),
      snapCtrl = ui.create('label', {
        textContent: 'Snap to Grid (20px)',
        style: {
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '11px',
          color: '#a1a1aa',
          marginLeft: '24px',
        },
      }),
      snapInp = ui.create('input', { attrs: { type: 'checkbox' }, style: { cursor: 'pointer' } });

    snapInp.checked = o.snapMode;
    snapInp.onchange = (e) => {
      o.snapMode = e.target.checked;
      r();
    };
    snapCtrl.appendChild(snapInp);
    uTop.appendChild(m);
    m.appendChild(b);
    u.appendChild(uTop);
    u.appendChild(snapCtrl);

    const g = ui.create('div', {
        style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
      }),
      f = ui.create('label', {
        textContent: 'Zapper (Remove Elements)',
        style: {
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flex: '1',
          color: '#fca5a5',
        },
      }),
      w = ui.create('input', {
        attrs: { type: 'checkbox' },
        style: { cursor: 'pointer', width: '16px', height: '16px' },
      });

    let textHoverElement = null;
    let editingActiveElement = null;
    let originalTextContent = '';

    const textOver = (e) => {
        if (!isProtected(e.target) && !editingActiveElement && textHoverElement !== e.target) {
          clearOutline(textHoverElement);
          textHoverElement = e.target;
          setOutline(textHoverElement, '2px solid #22c55e');
        }
      },
      textOut = (e) => {
        if (e.target === textHoverElement && !editingActiveElement) {
          clearOutline(textHoverElement);
          textHoverElement = null;
        }
      },
      textClick = (e) => {
        if (isProtected(e.target)) return;
        if (editingActiveElement) {
          if (e.target === editingActiveElement) return;
          textBlur();
        }
        e.preventDefault();
        e.stopPropagation();
        editingActiveElement = e.target;
        originalTextContent = editingActiveElement.innerHTML;
        clearOutline(textHoverElement);
        editingActiveElement.setAttribute('contenteditable', 'true');
        setOutline(editingActiveElement, '2px dashed #22c55e');
        editingActiveElement.focus();
        editingActiveElement.addEventListener('blur', textBlur, { once: true });
      },
      textBlur = () => {
        if (!editingActiveElement) return;
        editingActiveElement.removeAttribute('contenteditable');
        clearOutline(editingActiveElement);
        if (editingActiveElement.innerHTML !== originalTextContent) {
          if (!editingActiveElement.hasAttribute('data-wb-orig-text')) {
            editingActiveElement.setAttribute('data-wb-orig-text', originalTextContent);
          }
          editingActiveElement.setAttribute('data-wb-mod-text', editingActiveElement.innerHTML);
          pushHistoryState(
            editingActiveElement,
            'text',
            originalTextContent,
            editingActiveElement.innerHTML
          );
        }
        editingActiveElement = null;
        textHoverElement = null;
      };

    window._webbenderToggleTextEdit = function (e) {
      window._webbenderTextEditMode = e;
      l.checked = e;
      o.editMode = e;
      r();
      if (e) {
        if (window._webbenderMoveMode) window._webbenderToggleMove(false);
        if (window._webbenderRemoveMode) window._webbenderToggleRemove(false);
        if (window._webbenderSelectMode) window._webbenderToggleSelect(false);
        document.addEventListener('pointerover', textOver);
        document.addEventListener('pointerout', textOut);
        document.addEventListener('click', textClick, true);
      } else {
        document.removeEventListener('pointerover', textOver);
        document.removeEventListener('pointerout', textOut);
        document.removeEventListener('click', textClick, true);
        if (editingActiveElement) textBlur();
        if (textHoverElement) {
          clearOutline(textHoverElement);
          textHoverElement = null;
        }
      }
    };

    let activeHover = null,
      dragSession = null;
    function highlightMove(e) {
      if (activeHover !== e) {
        clearOutline(activeHover);
        activeHover = e;
        if (activeHover) setOutline(activeHover, '2px solid #22c55e');
      }
      if (e && typeof window._webbenderTargetNotifier === 'function') {
        window._webbenderTargetNotifier(e);
      }
    }
    const h = (e) => {
        if (!dragSession && !isProtected(e.target)) highlightMove(e.target);
      },
      S = (e) => {
        if (!dragSession && e.target === activeHover) highlightMove(null);
      },
      C = (e) => {
        if (e.button !== 0 || isProtected(e.target)) return;
        const t = e.target.getBoundingClientRect();
        const oldTransform = e.target.style.transform || '';
        dragSession = {
          target: e.target,
          startX: e.clientX,
          startY: e.clientY,
          oldTransform: oldTransform,
          moveX: parseFloat(e.target.dataset.webbenderMoveX || '0'),
          moveY: parseFloat(e.target.dataset.webbenderMoveY || '0'),
          minDeltaX: 1 - t.right,
          maxDeltaX: window.innerWidth - t.left - 1,
          minDeltaY: 1 - t.bottom,
          maxDeltaY: window.innerHeight - t.top - 1,
        };
        if (e.target.dataset.webbenderBaseTransform === undefined)
          e.target.dataset.webbenderBaseTransform = oldTransform;
        highlightMove(e.target);
        e.preventDefault();
        e.stopPropagation();
      },
      k = (e) => {
        if (!dragSession) return;
        let t = Math.min(
            Math.max(e.clientX - dragSession.startX, dragSession.minDeltaX),
            dragSession.maxDeltaX
          ),
          n = Math.min(
            Math.max(e.clientY - dragSession.startY, dragSession.minDeltaY),
            dragSession.maxDeltaY
          );
        let deltaX = dragSession.moveX + t;
        let deltaY = dragSession.moveY + n;
        if (o.snapMode) {
          deltaX = Math.round(deltaX / 20) * 20;
          deltaY = Math.round(deltaY / 20) * 20;
        }
        ((el, dx, dy) => {
          const base = el.dataset.webbenderBaseTransform || '',
            tr = `translate(${dx}px, ${dy}px)`;
          el.style.transform = base ? `${tr} ${base}` : tr;
          el.dataset.webbenderMoveX = String(dx);
          el.dataset.webbenderMoveY = String(dy);
          if (!el.hasAttribute('data-wb-orig-style'))
            el.setAttribute('data-wb-orig-style', el.getAttribute('style') || '');
          el.setAttribute('data-wb-mod-style', el.getAttribute('style') || '');
        })(dragSession.target, deltaX, deltaY);
        e.preventDefault();
        e.stopPropagation();
      },
      M = (e) => {
        if (dragSession) {
          highlightMove(dragSession.target);
          pushHistoryState(
            dragSession.target,
            'style',
            { prop: 'transform', value: dragSession.oldTransform },
            { prop: 'transform', value: dragSession.target.style.transform }
          );
          dragSession = null;
          e.preventDefault();
          e.stopPropagation();
        }
      },
      E = (e) => {
        if (!isProtected(e.target)) {
          e.preventDefault();
          e.stopPropagation();
        }
      },
      T = (e) => {
        if (!isProtected(e.target)) setOutline(e.target, '2px solid #ef4444');
      },
      R = (e) => {
        if (!isProtected(e.target)) clearOutline(e.target);
      },
      I = (e) => {
        if (!isProtected(e.target)) {
          e.preventDefault();
          e.stopPropagation();
          clearOutline(e.target);
          if (!e.target.hasAttribute('data-wb-orig-style')) {
            e.target.setAttribute('data-wb-orig-style', e.target.getAttribute('style') || '');
          }
          const oldDisplay = e.target.style.display;
          e.target.style.display = 'none';
          e.target.setAttribute('data-wb-mod-style', e.target.getAttribute('style') || '');
          pushHistoryState(
            e.target,
            'style',
            { prop: 'display', value: oldDisplay },
            { prop: 'display', value: 'none' }
          );
        }
      };

    window._webbenderToggleMove = function (e) {
      window._webbenderMoveMode = e;
      b.checked = e;
      o.moveMode = e;
      r();
      if (e) {
        if (window._webbenderTextEditMode) window._webbenderToggleTextEdit(false);
        if (window._webbenderRemoveMode) window._webbenderToggleRemove(false);
        if (window._webbenderSelectMode) window._webbenderToggleSelect(false);
        document.addEventListener('pointerover', h);
        document.addEventListener('pointerout', S);
        document.addEventListener('pointerdown', C, true);
        document.addEventListener('pointermove', k, true);
        document.addEventListener('pointerup', M, true);
        document.addEventListener('click', E, true);
      } else {
        document.removeEventListener('pointerover', h);
        document.removeEventListener('pointerout', S);
        document.removeEventListener('pointerdown', C, true);
        document.removeEventListener('pointermove', k, true);
        document.removeEventListener('pointerup', M, true);
        document.removeEventListener('click', E, true);
        highlightMove(null);
        dragSession = null;
      }
    };

    window._webbenderToggleRemove = function (e) {
      window._webbenderRemoveMode = e;
      w.checked = e;
      o.removeMode = e;
      r();
      if (e) {
        if (window._webbenderTextEditMode) window._webbenderToggleTextEdit(false);
        if (window._webbenderToggleMove) window._webbenderToggleMove(false);
        if (window._webbenderSelectMode) window._webbenderToggleSelect(false);
        document.addEventListener('pointerover', T);
        document.addEventListener('pointerout', R);
        document.addEventListener('click', I, true);
      } else {
        document.removeEventListener('pointerover', T);
        document.removeEventListener('pointerout', R);
        document.removeEventListener('click', I, true);
      }
    };

    l.onchange = (e) => window._webbenderToggleTextEdit(e.target.checked);
    c.appendChild(l);
    s.appendChild(c);
    b.onchange = (e) => window._webbenderToggleMove(e.target.checked);
    w.onchange = (e) => window._webbenderToggleRemove(e.target.checked);
    f.appendChild(w);
    g.appendChild(f);
    return { editSection: s, moveSection: u, removeSection: g };
  }

  function wbCreateFormattingSection(ui, hostElement, state, triggerTabSwitch, shadow) {
    const { settings: o, saveSettings: r } = state;
    function isProtected(e) {
      return (
        !e ||
        e === hostElement ||
        hostElement.contains(e) ||
        'HTML' === e.tagName ||
        'BODY' === e.tagName
      );
    }
    function setOutline(e, t) {
      e &&
        e.dataset.webbenderOutlineBackup === undefined &&
        ((e.dataset.webbenderOutlineBackup = e.style.outline || ''), (e.style.outline = t));
    }
    function clearOutline(e) {
      e &&
        e.dataset.webbenderOutlineBackup !== undefined &&
        ((e.style.outline = e.dataset.webbenderOutlineBackup),
        delete e.dataset.webbenderOutlineBackup);
    }

    let targetElements = [];

    function applyStyleToSelection(prop, value) {
      targetElements.forEach((el) => {
        if (!el.hasAttribute('data-wb-orig-style')) {
          el.setAttribute('data-wb-orig-style', el.getAttribute('style') || '');
        }
        const prev = el.style[prop];
        el.style[prop] = value;
        el.setAttribute('data-wb-mod-style', el.getAttribute('style') || '');
        pushHistoryState(el, 'style', { prop, value: prev }, { prop, value });
      });
      triggerAutosave();
      updateOverlay();
    }

    const wrap = ui.create('div', {
      style: { display: 'flex', flexDirection: 'column', gap: '8px' },
    });
    function createSectionCard(icon, title, colorClass = '#a1a1aa') {
      const card = ui.create('div', {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            background: '#1f1f23',
            padding: '8px',
            borderRadius: '8px',
            border: '1px solid #27272a',
          },
        }),
        header = ui.create('div', { style: { display: 'flex', alignItems: 'center', gap: '6px' } }),
        iconSpan = ui.create('span', {
          textContent: icon,
          attrs: { class: 'material-symbols-rounded' },
          style: { fontSize: '14px', color: colorClass },
        }),
        titleSpan = ui.create('span', {
          textContent: title,
          style: {
            fontSize: '11px',
            fontWeight: 'bold',
            color: '#e4e4e7',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          },
        });
      header.appendChild(iconSpan);
      header.appendChild(titleSpan);
      card.appendChild(header);
      return { card, body: card };
    }

    const { card: selectionCard, body: selectionBody } = createSectionCard(
      'ads_click',
      'Object Selector',
      '#3b82f6'
    );
    const selRow = ui.create('div', {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '4px',
        },
      }),
      selLabel = ui.create('label', {
        textContent: 'Selector Mode',
        style: {
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flex: '1',
          color: '#93c5fd',
          fontWeight: '600',
          fontSize: '12px',
        },
      }),
      selInp = ui.create('input', {
        attrs: { type: 'checkbox' },
        style: { cursor: 'pointer', width: '16px', height: '16px' },
      }),
      targetView = ui.create('div', {
        textContent: 'Target: [None Selected]',
        style: {
          fontSize: '11px',
          color: '#a1a1aa',
          fontStyle: 'italic',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          borderTop: '1px solid #27272a',
          paddingTop: '4px',
          marginTop: '4px',
        },
      });

    /* Selection Action buttons for multi-selection styling */
    const selActionRow = ui.create('div', {
      style: { display: 'flex', gap: '4px', marginTop: '4px' },
    });
    const btnStyleSub = {
      flex: '1',
      padding: '4px 0',
      fontSize: '10px',
      fontWeight: 'bold',
      background: '#27272a',
      border: '1px solid #3f3f46',
      color: '#fff',
      borderRadius: '4px',
      cursor: 'pointer',
    };

    const selectSameBtn = ui.create('button', {
      textContent: 'Select Same Tag',
      style: btnStyleSub,
    });
    selectSameBtn.onclick = () => {
      if (targetElements.length > 0) {
        const primary = targetElements[targetElements.length - 1];
        const matches = Array.from(document.querySelectorAll(primary.tagName.toLowerCase()));
        const validMatches = matches.filter((el) => !isProtected(el));
        targetElements = validMatches;
        updateOverlay();
        window._webbenderTargetNotifier(targetElements[targetElements.length - 1]);
      }
    };

    const selectClearBtn = ui.create('button', {
      textContent: 'Clear Selection',
      style: btnStyleSub,
    });
    selectClearBtn.onclick = () => {
      targetElements = [];
      updateOverlay();
      targetView.textContent = 'Target: [None Selected]';
    };

    ui.append(selActionRow, [selectSameBtn, selectClearBtn]);
    selLabel.appendChild(selInp);
    selRow.appendChild(selLabel);
    selectionBody.appendChild(selRow);
    selectionBody.appendChild(selActionRow);
    selectionBody.appendChild(targetView);

    const { card: layerCard, body: layerBody } = createSectionCard(
      'layers',
      'Arrangement Layers',
      '#a855f7'
    );
    const layerBtnCluster = ui.create('div', {
        style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '4px' },
      }),
      backSplitGroup = ui.create('div', {
        style: {
          display: 'flex',
          background: '#18181b',
          borderRadius: '4px',
          border: '1px solid #3f3f46',
          overflow: 'hidden',
        },
      }),
      frontSplitGroup = ui.create('div', {
        style: {
          display: 'flex',
          background: '#18181b',
          borderRadius: '4px',
          border: '1px solid #3f3f46',
          overflow: 'hidden',
        },
      });

    const actionBtnStyle = {
      flex: '1',
      background: 'transparent',
      border: 'none',
      color: '#f4f4f5',
      padding: '5px 0',
      fontSize: '11px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'background 0.15s ease',
    };
    const menuIndicatorStyle = {
      background: '#27272a',
      border: 'none',
      borderLeft: '1px solid #3f3f46',
      color: '#a1a1aa',
      padding: '0 6px',
      fontSize: '10px',
      cursor: 'pointer',
    };

    function ensurePositioningContext(el) {
      if (!el) return false;
      const computed = window.getComputedStyle(el);
      if (computed.position === 'static') {
        const prev = el.style.position;
        el.style.position = 'relative';
        pushHistoryState(
          el,
          'style',
          { prop: 'position', value: prev },
          { prop: 'position', value: 'relative' }
        );
      }
      return true;
    }
    function applyZIndexValue(nextZ) {
      targetElements.forEach((el) => {
        if (!ensurePositioningContext(el)) return;
        if (!el.hasAttribute('data-wb-orig-style')) {
          el.setAttribute('data-wb-orig-style', el.getAttribute('style') || '');
        }
        const prevZ = el.style.zIndex;
        el.style.zIndex = nextZ;
        el.setAttribute('data-wb-mod-style', el.getAttribute('style') || '');
        pushHistoryState(
          el,
          'style',
          { prop: 'zIndex', value: prevZ },
          { prop: 'zIndex', value: String(nextZ) }
        );
      });
      triggerAutosave();
    }
    function stepZIndex(offset) {
      targetElements.forEach((el) => {
        const computed = window.getComputedStyle(el);
        let currentZ = parseInt(computed.zIndex);
        if (isNaN(currentZ)) currentZ = 0;
        if (!ensurePositioningContext(el)) return;
        if (!el.hasAttribute('data-wb-orig-style')) {
          el.setAttribute('data-wb-orig-style', el.getAttribute('style') || '');
        }
        el.style.zIndex = currentZ + offset;
        el.setAttribute('data-wb-mod-style', el.getAttribute('style') || '');
        pushHistoryState(
          el,
          'style',
          { prop: 'zIndex', value: currentZ },
          { prop: 'zIndex', value: String(currentZ + offset) }
        );
      });
      triggerAutosave();
    }

    const backStepBtn = ui.create('button', { textContent: 'Backward', style: actionBtnStyle }),
      backDropdown = ui.create('button', { textContent: '▾', style: menuIndicatorStyle }),
      frontStepBtn = ui.create('button', { textContent: 'Forward', style: actionBtnStyle }),
      frontDropdown = ui.create('button', { textContent: '▾', style: menuIndicatorStyle });

    backStepBtn.onclick = () => stepZIndex(-1);
    frontStepBtn.onclick = () => stepZIndex(1);

    function createStackDropdownMenu(anchor, items) {
      const menu = ui.create('div', {
        style: {
          position: 'fixed',
          background: '#27272a',
          border: '1px solid #3f3f46',
          borderRadius: '4px',
          zIndex: '2147483647',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          padding: '2px',
          display: 'flex',
          flexDirection: 'column',
        },
      });
      items.forEach((item) => {
        const btn = ui.create('button', {
          textContent: item.label,
          style: {
            background: 'transparent',
            border: 'none',
            color: '#f4f4f5',
            padding: '4px 8px',
            fontSize: '11px',
            textAlign: 'left',
            cursor: 'pointer',
            borderRadius: '2px',
          },
        });
        btn.onmouseover = () => (btn.style.background = '#3f3f46');
        btn.onmouseout = () => (btn.style.background = 'transparent');
        btn.onclick = () => {
          item.action();
          menu.remove();
        };
        menu.appendChild(btn);
      });
      const rect = anchor.getBoundingClientRect();
      menu.style.top = `${rect.bottom + 4}px`;
      menu.style.left = `${rect.left}px`;
      document.body.appendChild(menu);
      const closeHandler = (e) => {
        if (!menu.contains(e.target) && e.target !== anchor) {
          menu.remove();
          document.removeEventListener('click', closeHandler);
        }
      };
      setTimeout(() => document.addEventListener('click', closeHandler), 10);
    }

    backDropdown.onclick = (e) => {
      e.stopPropagation();
      if (targetElements.length === 0) return;
      createStackDropdownMenu(backDropdown, [
        { label: 'Send to Absolute Back', action: () => applyZIndexValue('-100') },
      ]);
    };
    frontDropdown.onclick = (e) => {
      e.stopPropagation();
      if (targetElements.length === 0) return;
      createStackDropdownMenu(frontDropdown, [
        { label: 'Bring to Absolute Front', action: () => applyZIndexValue('9999') },
      ]);
    };

    ui.append(backSplitGroup, [backStepBtn, backDropdown]);
    ui.append(frontSplitGroup, [frontStepBtn, frontDropdown]);
    ui.append(layerBtnCluster, [backSplitGroup, frontSplitGroup]);
    layerBody.appendChild(layerBtnCluster);

    const { card: textCard, body: textBody } = createSectionCard(
      'text_fields',
      'Typography Formatting',
      '#22c55e'
    );
    const decoRow = ui.create('div', { style: { display: 'flex', gap: '4px', marginTop: '4px' } }),
      alignRow = ui.create('div', { style: { display: 'flex', gap: '4px', marginTop: '4px' } });

    const globalBtnStyle = {
      flex: '1',
      background: '#27272a',
      border: '1px solid #3f3f46',
      color: '#f4f4f5',
      padding: '6px 0',
      borderRadius: '4px',
      cursor: 'pointer',
      transition: 'background 0.15s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };
    const bBtn = ui.button('format_bold', 'B', globalBtnStyle),
      iBtn = ui.button('format_italic', 'I', globalBtnStyle),
      uBtn = ui.button('format_underlined', 'U', globalBtnStyle);

    bBtn.onclick = () => {
      if (targetElements.length > 0) {
        const first = targetElements[0];
        const next = window.getComputedStyle(first).fontWeight === 'bold' ? 'normal' : 'bold';
        applyStyleToSelection('fontWeight', next);
      }
    };
    iBtn.onclick = () => {
      if (targetElements.length > 0) {
        const first = targetElements[0];
        const next = window.getComputedStyle(first).fontStyle === 'italic' ? 'normal' : 'italic';
        applyStyleToSelection('fontStyle', next);
      }
    };
    uBtn.onclick = () => {
      if (targetElements.length > 0) {
        const first = targetElements[0];
        const next = window.getComputedStyle(first).textDecoration.includes('underline')
          ? 'none'
          : 'underline';
        applyStyleToSelection('textDecoration', next);
      }
    };

    ui.append(decoRow, [bBtn, iBtn, uBtn]);

    const alignLeft = ui.button('format_align_left', 'Left', globalBtnStyle),
      alignCenter = ui.button('format_align_center', 'Center', globalBtnStyle),
      alignRight = ui.button('format_align_right', 'Right', globalBtnStyle),
      alignJustify = ui.button('format_align_justify', 'Justify', globalBtnStyle);

    alignLeft.onclick = () => applyStyleToSelection('textAlign', 'left');
    alignCenter.onclick = () => applyStyleToSelection('textAlign', 'center');
    alignRight.onclick = () => applyStyleToSelection('textAlign', 'right');
    alignJustify.onclick = () => applyStyleToSelection('textAlign', 'justify');
    ui.append(alignRow, [alignLeft, alignCenter, alignRight, alignJustify]);

    const sizeRow = ui.create('div', {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '6px',
          marginTop: '6px',
        },
      }),
      sizeLbl = ui.create('span', {
        textContent: 'Size: 16px',
        style: { fontSize: '11px', width: '65px', color: '#a1a1aa' },
      }),
      sizeInp = ui.create('input', {
        attrs: { type: 'range', min: '8', max: '72', value: '16' },
        style: { flex: '1', cursor: 'pointer' },
      });
    ui.append(sizeRow, [sizeLbl, sizeInp]);

    const fOverRow = ui.create('div', {
        style: { display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' },
      }),
      fOverSelect = ui.create('select', {
        style: {
          background: '#27272a',
          color: '#f4f4f5',
          border: '1px solid #3f3f46',
          borderRadius: '6px',
          padding: '4px',
          fontSize: '12px',
          cursor: 'pointer',
        },
      }),
      customFontInp = ui.create('input', {
        attrs: { type: 'text', placeholder: 'Or type local font (e.g. Impact, Arial)...' },
        style: {
          background: '#27272a',
          color: '#f4f4f5',
          border: '1px solid #3f3f46',
          borderRadius: '6px',
          padding: '4px 8px',
          fontSize: '11px',
          marginTop: '2px',
        },
      });

    [
      ['Default Font Family', ''],
      ['Sans-Serif', "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"],
      ['Serif', "Georgia, 'Times New Roman', serif"],
      ['Monospace', "'Courier New', Courier, monospace"],
    ].forEach(([t, v]) => {
      const opt = ui.create('option', { textContent: t });
      opt.value = v;
      fOverSelect.appendChild(opt);
    });

    fOverSelect.onchange = () => {
      applyStyleToSelection('fontFamily', fOverSelect.value);
      customFontInp.value = fOverSelect.value;
    };
    customFontInp.oninput = () => {
      applyStyleToSelection('fontFamily', customFontInp.value);
    };
    customFontInp.onchange = () => {
      if (targetElements.length > 0) triggerAutosave();
    };
    fOverRow.appendChild(fOverSelect);
    fOverRow.appendChild(customFontInp);
    ui.append(textBody, [decoRow, alignRow, sizeRow, fOverRow]);

    const { card: colorCard, body: colorBody } = createSectionCard(
      'palette',
      'Colors & Backgrounds',
      '#f59e0b'
    );
    const inputRow = ui.create('div', {
        style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '4px' },
      }),
      colorWrap = ui.create('div', {
        style: {
          display: 'flex',
          background: '#27272a',
          border: '1px solid #3f3f46',
          borderRadius: '6px',
          padding: '2px 4px',
          alignItems: 'center',
          gap: '4px',
        },
      }),
      colorInp = ui.create('input', {
        attrs: { type: 'color' },
        style: {
          border: 'none',
          width: '18px',
          height: '18px',
          background: 'none',
          cursor: 'pointer',
        },
      }),
      colorLbl = ui.create('span', {
        textContent: 'Text',
        style: { fontSize: '11px', color: '#f4f4f5' },
      }),
      bgWrap = ui.create('div', {
        style: {
          display: 'flex',
          background: '#27272a',
          border: '1px solid #3f3f46',
          borderRadius: '6px',
          padding: '2px 4px',
          alignItems: 'center',
          gap: '4px',
        },
      }),
      bgInp = ui.create('input', {
        attrs: { type: 'color' },
        style: {
          border: 'none',
          width: '18px',
          height: '18px',
          background: 'none',
          cursor: 'pointer',
        },
      }),
      bgLbl = ui.create('span', {
        textContent: 'Background',
        style: { fontSize: '11px', color: '#f4f4f5' },
      });

    colorWrap.appendChild(colorInp);
    colorWrap.appendChild(colorLbl);
    bgWrap.appendChild(bgInp);
    bgWrap.appendChild(bgLbl);
    ui.append(inputRow, [colorWrap, bgWrap]);
    colorBody.appendChild(inputRow);

    const { card: advCard, body: advBody } = createSectionCard(
      'tune',
      'Advanced Layout Tuning',
      '#06b6d4'
    );
    const advToggle = ui.create('div', {
        textContent: '▶ Expand Advanced Metrics',
        style: {
          fontSize: '11px',
          color: '#93c5fd',
          cursor: 'pointer',
          fontWeight: 'bold',
          marginTop: '4px',
          transition: 'color 0.15s ease',
        },
      }),
      advDrawer = ui.create('div', {
        style: {
          display: 'none',
          flexDirection: 'column',
          gap: '4px',
          background: '#27272a',
          padding: '6px',
          borderRadius: '6px',
          marginTop: '2px',
          opacity: '0',
          transform: 'translateY(-4px)',
          transition: 'opacity 0.2s ease, transform 0.2s ease',
        },
      });

    advToggle.onclick = () => {
      const isHidden = advDrawer.style.display === 'none';
      if (isHidden) {
        advDrawer.style.display = 'flex';
        advDrawer.offsetHeight;
        advDrawer.style.opacity = '1';
        advDrawer.style.transform = 'translateY(0)';
        advToggle.textContent = '▼ Collapse Advanced Metrics';
      } else {
        advDrawer.style.opacity = '0';
        advDrawer.style.transform = 'translateY(-4px)';
        advDrawer.style.display = 'none';
        advToggle.textContent = '▶ Expand Advanced Metrics';
      }
    };
    function createMicroSlider(label, min, max, unit, prop) {
      const row = ui.create('div', {
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '6px',
          },
        }),
        lbl = ui.create('span', {
          textContent: `${label}: --`,
          style: { fontSize: '10px', width: '75px', color: '#a1a1aa' },
        }),
        inp = ui.create('input', {
          attrs: { type: 'range', min, max, value: '0' },
          style: { flex: '1', cursor: 'pointer' },
        });
      inp.oninput = () => {
        applyStyleToSelection(prop, `${inp.value}${unit}`);
        lbl.textContent = `${label}: ${inp.value}${unit}`;
      };
      ui.append(row, [lbl, inp]);
      return { row, inp, lbl };
    }
    const lhCtrl = createMicroSlider('Spacing', '10', '50', 'px', 'lineHeight');
    const kernCtrl = createMicroSlider('Kerning', '-2', '10', 'px', 'letterSpacing');
    const radCtrl = createMicroSlider('Radius', '0', '30', 'px', 'borderRadius');

    ui.append(advDrawer, [lhCtrl.row, kernCtrl.row, radCtrl.row]);
    advBody.appendChild(advToggle);
    advBody.appendChild(advDrawer);

    /* Selection Overlay, Drag Grab and 8-way Resize Handle Mechanics */
    let overlay = null;
    function updateOverlay() {
      if (!overlay) {
        overlay = ui.create('div', {
          style: {
            position: 'fixed',
            border: '2px solid #2563eb',
            pointerEvents: 'none',
            zIndex: '2147483646',
            boxSizing: 'border-box',
          },
        });
        const handlePositions = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
        handlePositions.forEach((pos) => {
          const handle = ui.create('div', {
            attrs: { 'data-handle': pos },
            style: {
              position: 'absolute',
              width: '8px',
              height: '8px',
              background: '#2563eb',
              border: '1px solid #fff',
              borderRadius: '50%',
              pointerEvents: 'auto',
              cursor: `${pos}-resize`,
            },
          });
          if (pos.includes('n')) handle.style.top = '-5px';
          if (pos.includes('s')) handle.style.bottom = '-5px';
          if (pos.includes('e')) handle.style.right = '-5px';
          if (pos.includes('w')) handle.style.left = '-5px';
          if (pos === 'n' || pos === 's') handle.style.left = 'calc(50% - 5px)';
          if (pos === 'e' || pos === 'w') handle.style.top = 'calc(50% - 5px)';

          setupHandleDrag(handle, pos);
          overlay.appendChild(handle);
        });

        /* Viewport Grab Handle Overlay to translate element alignments */
        const grabHandle = ui.create('div', {
          style: {
            position: 'absolute',
            top: '-22px',
            left: 'calc(50% - 12px)',
            width: '24px',
            height: '16px',
            background: '#2563eb',
            border: '1px solid #fff',
            borderRadius: '4px 4px 0 0',
            cursor: 'move',
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '10px',
            fontWeight: 'bold',
          },
          textContent: '✛',
        });
        setupGrabDrag(grabHandle);
        overlay.appendChild(grabHandle);
        shadow.appendChild(overlay);
        window._webbenderOverlay = overlay;
      }

      if (targetElements.length === 0 || previewActive) {
        overlay.style.display = 'none';
        return;
      }

      overlay.style.display = 'block';
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
      targetElements.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.left < minX) minX = r.left;
        if (r.top < minY) minY = r.top;
        if (r.right > maxX) maxX = r.right;
        if (r.bottom > maxY) maxY = r.bottom;
      });

      overlay.style.left = `${minX}px`;
      overlay.style.top = `${minY}px`;
      overlay.style.width = `${maxX - minX}px`;
      overlay.style.height = `${maxY - minY}px`;
    }
    window._webbenderUpdateOverlay = updateOverlay;

    function setupHandleDrag(handle, pos) {
      let startX, startY;
      let startSizes = [];
      const onDown = (e) => {
        e.stopPropagation();
        e.preventDefault();
        startX = e.clientX;
        startY = e.clientY;
        startSizes = targetElements.map((el) => {
          const computed = window.getComputedStyle(el);
          return {
            el,
            width: parseFloat(computed.width) || el.offsetWidth,
            height: parseFloat(computed.height) || el.offsetHeight,
          };
        });
        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup', onUp);
      };
      const onMove = (e) => {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        startSizes.forEach(({ el, width, height }) => {
          let nw = width,
            nh = height;
          if (pos.includes('e')) nw = Math.max(10, width + dx);
          if (pos.includes('w')) nw = Math.max(10, width - dx);
          if (pos.includes('s')) nh = Math.max(10, height + dy);
          if (pos.includes('n')) nh = Math.max(10, height - dy);

          if (!el.hasAttribute('data-wb-orig-style'))
            el.setAttribute('data-wb-orig-style', el.getAttribute('style') || '');
          el.style.width = `${nw}px`;
          el.style.height = `${nh}px`;
          el.setAttribute('data-wb-mod-style', el.getAttribute('style') || '');
        });
        updateOverlay();
      };
      const onUp = () => {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        triggerAutosave();
      };
      handle.addEventListener('pointerdown', onDown);
    }

    function setupGrabDrag(grabHandle) {
      let startX, startY;
      let startOffsets = [];
      const onDown = (e) => {
        e.stopPropagation();
        e.preventDefault();
        startX = e.clientX;
        startY = e.clientY;
        startOffsets = targetElements.map((el) => ({
          el,
          moveX: parseFloat(el.dataset.webbenderMoveX || '0'),
          moveY: parseFloat(el.dataset.webbenderMoveY || '0'),
        }));
        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup', onUp);
      };
      const onMove = (e) => {
        let dx = e.clientX - startX;
        let dy = e.clientY - startY;
        if (o.snapMode) {
          dx = Math.round(dx / 20) * 20;
          dy = Math.round(dy / 20) * 20;
        }
        startOffsets.forEach(({ el, moveX, moveY }) => {
          const finalX = moveX + dx;
          const finalY = moveY + dy;
          const base = el.dataset.webbenderBaseTransform || '';
          const tr = `translate(${finalX}px, ${finalY}px)`;
          if (!el.hasAttribute('data-wb-orig-style'))
            el.setAttribute('data-wb-orig-style', el.getAttribute('style') || '');
          el.style.transform = base ? `${tr} ${base}` : tr;
          el.dataset.webbenderMoveX = String(finalX);
          el.dataset.webbenderMoveY = String(finalY);
          el.setAttribute('data-wb-mod-style', el.getAttribute('style') || '');
        });
        updateOverlay();
      };
      const onUp = () => {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        triggerAutosave();
      };
      grabHandle.addEventListener('pointerdown', onDown);
    }

    window._webbenderTargetNotifier = function (el) {
      if (!el) return;
      if (!targetElements.includes(el)) targetElements.push(el);
      targetView.textContent = `Target: <${el.tagName.toLowerCase()}> ${el.className ? '.' + String(el.className).split(' ').join('.') : ''} [${targetElements.length} Selected]`;

      const computed = window.getComputedStyle(el);
      sizeInp.value = parseInt(computed.fontSize) || 16;
      sizeLbl.textContent = `Size: ${sizeInp.value}px`;
      lhCtrl.inp.value = parseInt(computed.lineHeight) || 20;
      lhCtrl.lbl.textContent = `Spacing: ${lhCtrl.inp.value}px`;
      kernCtrl.inp.value = parseInt(computed.letterSpacing) || 0;
      kernCtrl.lbl.textContent = `Kerning: ${kernCtrl.inp.value}px`;
      radCtrl.inp.value = parseInt(computed.borderRadius) || 0;
      radCtrl.lbl.textContent = `Radius: ${radCtrl.inp.value}px`;
      customFontInp.value = el.style.fontFamily || computed.fontFamily.replace(/['"]/g, '');
      updateOverlay();
    };

    sizeInp.oninput = () => {
      if (targetElements.length > 0) {
        applyStyleToSelection('fontSize', `${sizeInp.value}px`);
        sizeLbl.textContent = `Size: ${sizeInp.value}px`;
      }
    };
    colorInp.onchange = () => {
      if (targetElements.length > 0) {
        applyStyleToSelection('color', colorInp.value);
      }
    };
    bgInp.onchange = () => {
      if (targetElements.length > 0) {
        applyStyleToSelection('backgroundColor', bgInp.value);
      }
    };

    sizeInp.onchange = () => {
      if (targetElements.length > 0) triggerAutosave();
    };
    lhCtrl.inp.onchange = () => {
      if (targetElements.length > 0) triggerAutosave();
    };
    kernCtrl.inp.onchange = () => {
      if (targetElements.length > 0) triggerAutosave();
    };
    radCtrl.inp.onchange = () => {
      if (targetElements.length > 0) triggerAutosave();
    };

    let activeSelHover = null;
    const selOver = (e) => {
        if (!isProtected(e.target) && activeSelHover !== e.target) {
          clearOutline(activeSelHover);
          activeSelHover = e.target;
          setOutline(activeSelHover, '2px solid #2563eb');
        }
      },
      selOut = (e) => {
        if (e.target === activeSelHover) {
          clearOutline(activeSelHover);
          activeSelHover = null;
        }
      },
      selClick = (e) => {
        if (isProtected(e.target)) return;
        e.preventDefault();
        e.stopPropagation();
        clearOutline(e.target);
        if (e.shiftKey || e.ctrlKey || e.metaKey) {
          if (targetElements.includes(e.target)) {
            targetElements = targetElements.filter((item) => item !== e.target);
          } else {
            targetElements.push(e.target);
          }
        } else {
          targetElements = [e.target];
        }
        if (targetElements.length > 0) {
          window._webbenderTargetNotifier(targetElements[targetElements.length - 1]);
        } else {
          targetView.textContent = 'Target: [None Selected]';
          updateOverlay();
        }
      };

    window._webbenderToggleSelect = function (e) {
      window._webbenderSelectMode = e;
      selInp.checked = e;
      o.selectMode = e;
      r();
      if (e) {
        if (window._webbenderTextEditMode) window._webbenderToggleTextEdit(false);
        if (window._webbenderToggleMove) window._webbenderToggleMove(false);
        if (window._webbenderRemoveMode) window._webbenderToggleRemove(false);
        document.addEventListener('pointerover', selOver);
        document.addEventListener('pointerout', selOut);
        document.addEventListener('click', selClick, true);
      } else {
        document.removeEventListener('pointerover', selOver);
        document.removeEventListener('pointerout', selOut);
        document.removeEventListener('click', selClick, true);
        if (activeSelHover) {
          clearOutline(activeSelHover);
          activeSelHover = null;
        }
      }
    };
    selInp.onchange = (e) => window._webbenderToggleSelect(e.target.checked);

    window.addEventListener('resize', updateOverlay);
    window.addEventListener('scroll', updateOverlay);

    ui.append(wrap, [selectionCard, layerCard, textCard, colorCard, advCard]);
    return { formattingSection: wrap };
  }

  function wbGetThemeCss(e, t, hostId) {
    return `:not(#${hostId}) :not(#${hostId} *) { background: ${e} !important; color: ${t} !important; border-color: rgba(128, 128, 128, 0.2) !important; background-image: none !important; } html, body { background: ${e} !important; background-image: none !important; }`;
  }
  function wbCreateFontThemeSection(ui, state, hostId) {
    const { settings: n, saveSettings: o } = state,
      c = ui.create('div', { style: { display: 'flex', flexDirection: 'column', gap: '4px' } }),
      l = ui.create('span', {
        textContent: 'Canvas Environment Theme',
        style: {
          color: '#a1a1aa',
          fontSize: '11px',
          fontWeight: '600',
          textTransform: 'uppercase',
        },
      }),
      p = ui.create('div', {
        style: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px' },
      }),
      u = [
        { name: 'Default', bg: '', fg: '' },
        { name: 'Dark', bg: '#121212', fg: '#e4e4e7' },
        { name: 'Light', bg: '#ffffff', fg: '#18181b' },
        { name: 'Sepia', bg: '#f4ecd8', fg: '#433422' },
      ];
    u.forEach((t) => {
      const r = ui.create('button', {
        textContent: t.name,
        style: {
          background: '#27272a',
          color: '#f4f4f5',
          border: '1px solid #3f3f46',
          borderRadius: '6px',
          padding: '4px',
          fontSize: '11px',
          cursor: 'pointer',
          transition: 'background 0.15s ease',
        },
      });
      r.onclick = () => {
        const e = wbGetStyleElement('webbender-theme-style');
        if (t.bg) {
          e.textContent = wbGetThemeCss(t.bg, t.fg, hostId);
          n.theme = t.name.toLowerCase();
        } else {
          e.textContent = '';
          n.theme = 'default';
        }
        o();
      };
      p.appendChild(r);
    });
    ui.append(c, [l, p]);
    return { themeSection: c, themes: u };
  }

  function wbCreateDialogsActions(ui, state, config, hostId, shadow) {
    const { settings: o, saveSettings: r } = state,
      { container: s } = config,
      xrayWrap = ui.create('div', {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          background: '#1f1f23',
          padding: '8px',
          borderRadius: '8px',
          border: '1px solid #27272a',
        },
      }),
      xrayLabel = ui.create('label', {
        textContent: 'X-Ray View',
        style: {
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#f43f5e',
          fontWeight: '600',
        },
      }),
      xrayInp = ui.create('input', {
        attrs: { type: 'checkbox' },
        style: { cursor: 'pointer', width: '16px', height: '16px' },
      }),
      xrayDesc = ui.create('div', {
        textContent:
          'Maps canvas boundaries to expose structural alignment gaps and hidden box padding bugs.',
        style: { fontSize: '11px', color: '#a1a1aa', fontStyle: 'italic' },
      }),
      c = ui.create('div', {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          borderTop: '1px solid #27272a',
          paddingTop: '8px',
        },
      }),
      l = ui.create('span', {
        textContent: 'Alerts',
        style: {
          color: '#a1a1aa',
          fontSize: '11px',
          fontWeight: '600',
          textTransform: 'uppercase',
        },
      }),
      p = ui.create('div', {
        style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' },
      }),
      u = {
        background: '#27272a',
        color: '#f4f4f5',
        border: '1px solid #3f3f46',
        borderRadius: '6px',
        padding: '5px',
        fontSize: '11px',
        cursor: 'pointer',
        transition: 'background 0.15s ease',
      };

    xrayLabel.appendChild(xrayInp);
    xrayWrap.appendChild(xrayLabel);
    xrayWrap.appendChild(xrayDesc);
    window._webbenderToggleXray = function (active) {
      o.xrayMode = active;
      xrayInp.checked = active;
      r();
      const styleEl = wbGetStyleElement('webbender-xray-style');
      if (active) {
        styleEl.textContent = `*:not(#${hostId}):not(#${hostId} *) { outline: 1px dashed rgba(244, 63, 94, 0.6) !important; outline-offset: -1px !important; }`;
      } else {
        styleEl.textContent = '';
      }
    };
    xrayInp.onchange = (e) => window._webbenderToggleXray(e.target.checked);

    function makeBtn(t, n) {
      const b = ui.create('button', { textContent: t, style: u });
      b.onclick = n;
      return b;
    }
    function runDeferred(e) {
      if (!s) {
        e();
        return;
      }
      const prevOpacity = s.style.opacity;
      s.style.opacity = '0';
      setTimeout(() => {
        try {
          e();
        } finally {
          s.style.opacity = prevOpacity;
        }
      }, 220);
    }
    const g = makeBtn('Alert', () => {
        const e = prompt('Alert message:', 'Test alert.');
        if (e !== null) runDeferred(() => alert(e));
      }),
      f = makeBtn('Confirm', () => {
        const e = prompt('Confirm message:', 'Are you sure?');
        if (e !== null) runDeferred(() => confirm(e));
      }),
      w = makeBtn('Prompt', () => {
        const e = prompt('Prompt question:', 'Your question?');
        if (e !== null) runDeferred(() => prompt(e, ''));
      });
    ui.append(p, [g, f, w]);
    ui.append(c, [l, p]);

    /* Generation Mechanics for Custom Overrides & JavaScript Content Modifications */
    function getUniqueSelector(el) {
      if (el.id) return `#${el.id}`;
      let path = el.tagName.toLowerCase();
      if (el.className) {
        const classes = Array.from(el.classList)
          .filter((c) => !c.startsWith('webbender'))
          .join('.');
        if (classes) path += `.${classes}`;
      }
      return path;
    }
    function generateSnippets() {
      let css = '';
      let js = '';
      document.querySelectorAll('[data-wb-orig-style]').forEach((el) => {
        const sel = getUniqueSelector(el);
        const style = el.getAttribute('data-wb-mod-style') || el.getAttribute('style') || '';
        if (style) {
          css += `${sel} {\n  ${style
            .split(';')
            .map((s) => s.trim())
            .filter(Boolean)
            .join(';\n  ')};\n}\n\n`;
        }
      });
      document.querySelectorAll('[data-wb-orig-text]').forEach((el) => {
        const sel = getUniqueSelector(el);
        const val = el.getAttribute('data-wb-mod-text') || el.innerHTML;
        js += `document.querySelector('${sel}').innerHTML = \`${val.replace(/`/g, '\\`').trim()}\`;\n`;
      });
      return { css, js };
    }

    function showSnippetsModal() {
      const { css, js } = generateSnippets();
      const modal = ui.create('div', {
        style: {
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '400px',
          maxHeight: '80vh',
          background: '#18181b',
          color: '#f4f4f5',
          border: '1px solid #27272a',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
          padding: '16px',
          zIndex: '2147483647',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          fontFamily: 'sans-serif',
        },
      });
      const header = ui.create('div', {
          style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
        }),
        title = ui.create('span', {
          textContent: 'Code Snippets',
          style: { fontWeight: 'bold', fontSize: '14px' },
        }),
        closeBtn = ui.create('button', {
          textContent: '✕',
          style: {
            background: 'none',
            border: 'none',
            color: '#71717a',
            cursor: 'pointer',
            fontSize: '16px',
          },
        });
      closeBtn.onclick = () => modal.remove();
      ui.append(header, [title, closeBtn]);

      const cssLabel = ui.create('span', {
          textContent: 'CSS Styles',
          style: { fontSize: '11px', color: '#a1a1aa' },
        }),
        cssArea = ui.create('textarea', {
          textContent: css || '/* No style changes bended yet */',
          style: {
            background: '#09090b',
            color: '#22c55e',
            border: '1px solid #27272a',
            borderRadius: '6px',
            height: '100px',
            fontSize: '11px',
            fontFamily: 'monospace',
            resize: 'none',
            padding: '6px',
          },
        });
      const jsLabel = ui.create('span', {
          textContent: 'JS Modifications',
          style: { fontSize: '11px', color: '#a1a1aa' },
        }),
        jsArea = ui.create('textarea', {
          textContent: js || '/* No text edits bended yet */',
          style: {
            background: '#09090b',
            color: '#3b82f6',
            border: '1px solid #27272a',
            borderRadius: '6px',
            height: '100px',
            fontSize: '11px',
            fontFamily: 'monospace',
            resize: 'none',
            padding: '6px',
          },
        });

      const copyBtn = ui.create('button', {
        textContent: 'Copy CSS + JS',
        style: {
          background: '#2563eb',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          padding: '8px',
          fontWeight: 'bold',
          cursor: 'pointer',
          fontSize: '12px',
        },
      });
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(`${css}\n\n${js}`);
        copyBtn.textContent = 'Copied!';
        setTimeout(() => (copyBtn.textContent = 'Copy CSS + JS'), 2000);
      };

      ui.append(modal, [header, cssLabel, cssArea, jsLabel, jsArea, copyBtn]);
      shadow.appendChild(modal);
    }

    const v = ui.create('div', {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          borderTop: '1px solid #27272a',
          paddingTop: '8px',
        },
      }),
      snippetBtn = ui.create('button', {
        textContent: 'Get Code Snippets',
        style: {
          background: '#10b981',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          padding: '6px',
          fontSize: '11px',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'background 0.15s ease',
        },
      }),
      exportBtn = ui.create('button', {
        textContent: 'Export Edits',
        style: {
          background: '#3b82f6',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          padding: '6px',
          fontSize: '11px',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'background 0.15s ease',
        },
      }),
      importBtn = ui.create('button', {
        textContent: 'Import Edits',
        style: {
          background: '#6366f1',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          padding: '6px',
          fontSize: '11px',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'background 0.15s ease',
        },
      }),
      x = ui.create('button', {
        textContent: 'Reset Engine Infrastructure',
        style: {
          background: '#dc2626',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          padding: '6px',
          fontSize: '11px',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'background 0.15s ease',
        },
      });

    snippetBtn.onclick = () => showSnippetsModal();
    exportBtn.onclick = () => {
      const exportData = {
        html: document.body.innerHTML,
        settings: state.settings,
        timestamp: Date.now(),
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `webbender-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    };
    importBtn.onclick = () => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.json';
      fileInput.onchange = (ev) => {
        const file = ev.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (eReader) => {
          try {
            const data = JSON.parse(eReader.target.result);
            if (data.html) {
              window._webbenderToggleRemove(false);
              window._webbenderToggleMove(false);
              window._webbenderToggleSelect(false);
              window._webbenderToggleTextEdit(false);
              window._webbenderToggleXray(false);
              const hostNode = document.getElementById(hostId);
              if (hostNode) hostNode.remove();
              document.body.innerHTML = data.html;
              document.body.appendChild(hostNode);
              if (data.settings) {
                Object.assign(state.settings, data.settings);
                state.saveSettings();
              }
              hasUnsavedChanges = true;
              alert('Configuration state imported successfully.');
            }
          } catch (err) {
            alert('File verification failure on imported asset JSON.');
          }
        };
        reader.readAsText(file);
      };
      fileInput.click();
    };

    x.onclick = () => {
      window._webbenderToggleRemove(false);
      window._webbenderToggleMove(false);
      window._webbenderToggleSelect(false);
      window._webbenderToggleTextEdit(false);
      window._webbenderToggleXray(false);
      const t = document.getElementById('webbender-theme-style');
      if (t) t.textContent = '';
      o.editMode = false;
      o.moveMode = false;
      o.removeMode = false;
      o.selectMode = false;
      o.xrayMode = false;
      o.theme = 'default';
      r();
      deleteAsset('autosave_' + location.href);
      hasUnsavedChanges = false;
    };

    const actionRowLayout = ui.create('div', {
      style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' },
    });
    ui.append(actionRowLayout, [exportBtn, importBtn]);
    ui.append(v, [snippetBtn, actionRowLayout, x]);

    const combinedActions = ui.create('div', {
      style: { display: 'flex', flexDirection: 'column', gap: '10px' },
    });
    ui.append(combinedActions, [c, v]);
    return { dialogSection: xrayWrap, actionRow: combinedActions };
  }

  /* -------------------------------------------------- */
  /* 9. RESTORATION & INTERACTIVE ASSEMBLY LAYERS       */
  /* -------------------------------------------------- */
  function wbCreateAutosaveBanner(ui, container, savedData, onRestore, onDiscard) {
    const banner = ui.create('div', {
      style: {
        background: '#1e3a8a',
        color: '#eff6ff',
        padding: '10px',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        border: '1px solid #3b82f6',
        margin: '0 4px',
        transition: 'transform 0.2s ease, opacity 0.2s ease',
      },
    });
    const title = ui.create('span', {
      textContent: 'Autosave Detected',
      style: {
        fontWeight: 'bold',
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      },
    });
    const infoIcon = ui.create('span', {
      textContent: 'history',
      attrs: { class: 'material-symbols-rounded' },
      style: { fontSize: '14px' },
    });
    title.insertBefore(infoIcon, title.firstChild);

    const dateStr = new Date(savedData.timestamp).toLocaleString();
    const desc = ui.create('span', {
      textContent: `A snapshot from ${dateStr} is available.`,
      style: { fontSize: '11px', color: '#dbeafe', lineHeight: '1.3' },
    });
    const btnRow = ui.create('div', { style: { display: 'flex', gap: '6px', marginTop: '2px' } });
    const btnStyle = {
      flex: '1',
      padding: '5px 0',
      fontSize: '11px',
      borderRadius: '4px',
      cursor: 'pointer',
      border: 'none',
      fontWeight: 'bold',
      transition: 'opacity 0.15s ease',
    };

    const restoreBtn = ui.create('button', {
      textContent: 'Restore Backup',
      style: { ...btnStyle, background: '#2563eb', color: '#fff' },
    });
    restoreBtn.onclick = () => {
      onRestore(savedData.html);
      banner.remove();
    };

    const discardBtn = ui.create('button', {
      textContent: 'Start Fresh',
      style: { ...btnStyle, background: '#374151', color: '#9ca3af' },
    });
    discardBtn.onclick = () => {
      onDiscard();
      banner.remove();
    };

    ui.append(btnRow, [restoreBtn, discardBtn]);
    ui.append(banner, [title, desc, btnRow]);
    return banner;
  }

  function wbRestoreAndAssemble(ui, state, modules, hostId, shadow) {
    const {
      settings: n,
      container: i,
      header: d,
      tabRow: tRow,
      tabViews: tViews,
      editSection: l,
      moveSection: p,
      removeSection: u,
      formattingSection: formSection,
      themeSection: b,
      dialogSection: g,
      actionRow: f,
      themes: w,
      initTabs: initTabs,
    } = modules;
    if (n.theme && 'default' !== n.theme) {
      const e = w.find((x) => x.name.toLowerCase() === n.theme);
      if (e && e.bg) {
        wbGetStyleElement('webbender-theme-style').textContent = wbGetThemeCss(e.bg, e.fg, hostId);
      }
    }
    if (n.editMode) window._webbenderToggleTextEdit(true);
    if (n.moveMode) window._webbenderToggleMove(true);
    if (n.removeMode) window._webbenderToggleRemove(true);
    if (n.selectMode) window._webbenderToggleSelect(true);
    if (n.xrayMode) window._webbenderToggleXray(true);

    ui.append(tViews.edit, [l, p, u]);
    ui.append(tViews.restyle, [formSection, b]);
    ui.append(tViews.test, [g, f]);
    ui.append(i, [d, tRow]);

    if (modules.autosaveBackup) {
      const banner = wbCreateAutosaveBanner(
        ui,
        i,
        modules.autosaveBackup,
        (savedHTML) => {
          window._webbenderToggleRemove(false);
          window._webbenderToggleMove(false);
          window._webbenderToggleSelect(false);
          window._webbenderToggleTextEdit(false);
          const hostNode = document.getElementById(hostId);
          if (hostNode) hostNode.remove();
          document.body.innerHTML = savedHTML;
          document.body.appendChild(hostNode);
          hasUnsavedChanges = true;
        },
        () => {
          deleteAsset('autosave_' + location.href);
          hasUnsavedChanges = false;
        }
      );
      i.appendChild(banner);
    }
    ui.append(i, [tViews.edit, tViews.restyle, tViews.test]);
    shadow.appendChild(i);
    initTabs();
  }

  /* -------------------------------------------------- */
  /* 10. APP BOOTSTRAP INITIALIZATION                   */
  /* -------------------------------------------------- */
  async function main() {
    await initDB();
    const state = wbInitState(hostId);
    if (!state) return;
    const host = document.createElement('div');
    host.id = hostId;
    host.style.position = 'relative';
    host.style.zIndex = '2147483647';
    document.body.appendChild(host);
    const shadow = host.attachShadow({ mode: 'open' });
    const ui = wbUI(shadow);

    const internalIconStyle = document.createElement('style');
    shadow.appendChild(internalIconStyle);
    await loadMaterialSymbols(internalIconStyle);

    const autosaveBackup = await getAsset('autosave_' + location.href);
    const container = wbCreateContainer(ui, 'wb-panel-root', state);
    const badge = wbCreateMinimizedBadge(ui, host, container, state);
    shadow.appendChild(badge);

    const { header: header } = wbCreateHeader(ui, host, container, badge, state, shadow);
    wbEnablePanelDragging(container, badge, header, state);

    const {
      tabRow: tabRow,
      tabViews: tabViews,
      triggerTabSwitch: triggerTabSwitch,
      initTabs: initTabs,
    } = wbCreateTabs(ui, container, state);
    const {
      editSection: edit,
      moveSection: move,
      removeSection: remove,
    } = wbCreateEditRemoveSection(ui, host, state, triggerTabSwitch);
    const { formattingSection: formatting } = wbCreateFormattingSection(
      ui,
      host,
      state,
      triggerTabSwitch,
      shadow
    );
    const { themeSection: theme, themes: themes } = wbCreateFontThemeSection(ui, state, hostId);
    const { dialogSection: dialogs, actionRow: actions } = wbCreateDialogsActions(
      ui,
      state,
      { container: container },
      hostId,
      shadow
    );

    wbRestoreAndAssemble(
      ui,
      state,
      {
        ...state,
        container: container,
        header: header,
        tabRow: tabRow,
        tabViews: tabViews,
        editSection: edit,
        moveSection: move,
        removeSection: remove,
        formattingSection: formatting,
        themeSection: theme,
        dialogSection: dialogs,
        actionRow: actions,
        themes: themes,
        initTabs: initTabs,
        autosaveBackup: autosaveBackup,
      },
      hostId,
      shadow
    );
  }
  main();
})();
