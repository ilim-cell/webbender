import React from 'react';

export default function SettingsPanel() {
  return (
    <div className="wb-settings-panel">
      <h3>Settings</h3>
      <label>
        <input type="checkbox" /> Snap to edges
      </label>
      <label>
        <input type="checkbox" /> Dark mode
      </label>
    </div>
  );
}
