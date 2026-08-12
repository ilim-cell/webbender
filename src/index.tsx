import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const hostId = "webbender-ui";

function init() {
  let hostNode = document.getElementById(hostId);
  if (hostNode) {
    // Toggle off if already active
    hostNode.remove();
    return;
  }

  hostNode = document.createElement('div');
  hostNode.id = hostId;
  
  // Make sure it doesn't inherit page styles and stays above everything
  hostNode.style.position = 'fixed';
  hostNode.style.zIndex = '2147483647';
  
  document.body.appendChild(hostNode);

  const shadowRoot = hostNode.attachShadow({ mode: 'open' });
  
  // Add Material Symbols font to shadow DOM
  const styleEl = document.createElement('style');
  styleEl.textContent = `@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');
    .material-symbols-rounded {
      font-family: 'Material Symbols Rounded';
      font-weight: normal;
      font-style: normal;
      font-size: 24px;
      line-height: 1;
      display: inline-block;
      text-transform: none;
      letter-spacing: normal;
      word-wrap: normal;
      white-space: nowrap;
      direction: ltr;
      -webkit-font-smoothing: antialiased;
    }
    * {
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif;
    }
  `;
  shadowRoot.appendChild(styleEl);

  const rootElement = document.createElement('div');
  shadowRoot.appendChild(rootElement);

  // Expose global test state for Playwright tests
  (window as any).dialogTestState = {
    promptCalls: [],
    displayDuringDialog: { alert: null, confirm: null, prompt: null },
    finalDisplay: null,
    ready: false,
    cleanup: () => {}
  };

  const root = createRoot(rootElement);
  root.render(<App />);
}

init();
