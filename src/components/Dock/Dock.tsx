import React, { useState, useEffect } from 'react';
import SelectTool from '../Tools/SelectTool';
import TextEditTool from '../Tools/TextEditTool';
import StyleTool from '../Tools/StyleTool';
import './Dock.css';

interface DockProps {
  isMinimized: boolean;
  onMinimize: () => void;
}

export default function Dock({ isMinimized, onMinimize }: DockProps) {
  const [position, setPosition] = useState({ x: 24, y: window.innerHeight - 100 });
  
  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => ({
        x: Math.min(prev.x, window.innerWidth - 100),
        y: Math.min(prev.y, window.innerHeight - 100)
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMinimized) {
    return (
      <div 
        className="wb-dock-badge"
        style={{ left: position.x, top: position.y }}
        onDoubleClick={onMinimize}
      >
        <span className="material-symbols-rounded">design_services</span>
      </div>
    );
  }

  return (
    <div className="wb-dock" style={{ left: position.x, top: position.y }}>
      <div className="wb-dock-drag-handle">
         <span className="material-symbols-rounded">drag_indicator</span>
      </div>
      <div className="wb-toolbar">
        <SelectTool />
        <TextEditTool />
        <StyleTool />
        <div className="wb-divider" />
        <button className="wb-tool-btn" onClick={onMinimize} title="Minimize">
          <span className="material-symbols-rounded">minimize</span>
        </button>
        <button className="wb-tool-btn wb-tool-close" onClick={() => document.getElementById('webbender-ui')?.remove()} title="Close">
          <span className="material-symbols-rounded">close</span>
        </button>
      </div>
    </div>
  );
}
