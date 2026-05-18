(function () {
  const state = wbInitState();
  if (!state) {
    return;
  }

  const ui = wbUI();
  const container = wbCreateContainer(ui, state.ID);

  const { header } = wbCreateHeader(ui, container);
  const { updateBanner, updateText } = wbCreateUpdateBanner(ui);
  const { editSection, removeSection, setEditMode } = wbCreateEditRemoveSection(
    ui,
    container,
    state
  );
  const { fontSection, themeSection, fontSelect, customFontInput, applyFont, themes } =
    wbCreateFontThemeSection(ui, state);
  const { dialogSection, actionRow } = wbCreateDialogsActions(ui, state, {
    setEditMode,
    fontSelect,
    customFontInput,
  });

  wbRestoreAndAssemble(state, {
    ...state,
    container,
    header,
    updateBanner,
    updateText,
    editSection,
    removeSection,
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
