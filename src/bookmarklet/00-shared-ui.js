function wbUI() {
  return {
    create(tag, options = {}) {
      const el = document.createElement(tag);
      if (options.textContent !== undefined) {
        el.textContent = options.textContent;
      }
      if (options.attrs) {
        Object.entries(options.attrs).forEach(([key, value]) => {
          el.setAttribute(key, value);
        });
      }
      if (options.style) {
        Object.assign(el.style, options.style);
      }
      return el;
    },
    append(parent, children) {
      children.forEach((child) => parent.appendChild(child));
      return parent;
    },
    button(text, style, handlers = {}) {
      const btn = this.create('button', { textContent: text, style });
      if (handlers.click) btn.onclick = handlers.click;
      if (handlers.mouseover) btn.onmouseover = handlers.mouseover;
      if (handlers.mouseout) btn.onmouseout = handlers.mouseout;
      return btn;
    },
  };
}

function wbGetStyleElement(id) {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('style');
    el.id = id;
    document.head.appendChild(el);
  }
  return el;
}
