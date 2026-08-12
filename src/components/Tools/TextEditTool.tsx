import React, { useState } from 'react';

export default function TextEditTool() {
  const [active, setActive] = useState(false);
  
  const toggle = (forceState?: boolean) => {
    const nextState = forceState !== undefined ? forceState : !active;
    setActive(nextState);
    document.designMode = nextState ? 'on' : 'off';
    (window as any)._webbenderTextEditMode = nextState;
  };

  React.useEffect(() => {
    (window as any)._webbenderToggleTextEdit = toggle;
    return () => {
      delete (window as any)._webbenderToggleTextEdit;
      delete (window as any)._webbenderTextEditMode;
    };
  }, [active]);

  return (
    <button 
      className={`wb-tool-btn ${active ? 'active' : ''}`}
      onClick={() => toggle()}
      title="Edit Text"
    >
      <span className="material-symbols-rounded">match_case</span>
    </button>
  );
}
