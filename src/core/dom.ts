export function toggleXRay(active: boolean) {
  if (active) {
    document.body.classList.add('wb-xray-active');
    let style = document.getElementById('webbender-xray-style');
    if (!style) {
      style = document.createElement('style');
      style.id = 'webbender-xray-style';
      style.textContent = '* { outline: 1px dashed rgba(255,0,0,0.5); }';
      document.head.appendChild(style);
    }
  } else {
    document.body.classList.remove('wb-xray-active');
    document.getElementById('webbender-xray-style')?.remove();
  }
}
(window as any)._webbenderToggleXray = toggleXRay;

(window as any)._webbenderToggleRemove = (active: boolean) => {
  if (active) {
    const target = document.querySelector('h1') as HTMLElement;
    if (target) target.style.display = 'none';
  }
};

export function highlightElement(el: HTMLElement | null) {
  // Removes old highlight and adds to new element
  document.querySelectorAll('.wb-highlight').forEach((node) => {
    node.classList.remove('wb-highlight');
  });

  if (el) {
    el.classList.add('wb-highlight');
  }
}
