import React, { useState } from 'react';
import Dock from './components/Dock/Dock';

export default function App() {
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <>
      <Dock 
        isMinimized={isMinimized} 
        onMinimize={() => setIsMinimized(!isMinimized)} 
      />
    </>
  );
}
