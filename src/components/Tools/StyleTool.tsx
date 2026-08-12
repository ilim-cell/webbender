import React, { useState } from 'react';

export default function StyleTool() {
  const [active, setActive] = useState(false);
  
  const toggle = () => {
    const nextState = !active;
    setActive(nextState);
    if (nextState) {
      const color = prompt('Enter a background color (e.g. red, #fff):', '');
      if (color) {
        document.body.style.backgroundColor = color;
      }
      setTimeout(() => setActive(false), 500); // auto-turn off
    }
  };

  return (
    <button 
      className={`wb-tool-btn ${active ? 'active' : ''}`}
      onClick={toggle}
      title="Edit Styles"
    >
      <span className="material-symbols-rounded">format_paint</span>
    </button>
  );
}
