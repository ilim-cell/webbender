const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  // Listen for console messages
  page.on('console', msg => {
    console.log('PAGE LOG:', msg.type(), msg.text());
  });
  // Navigate to a simple page
  await page.goto('http://127.0.0.1:5501/');
  // Bookmarklet code (without the leading 'javascript:')
  const bookmarklet = `(function(){let s=document.getElementById('wb-run'),i=0,u=["http://127.0.0.1:5501/bookmarklet-runtime.js","https://raw.githubusercontent.com/ilim-cell/webbender/main/site/bookmarklet-runtime.js","https://webbender.web.app/bookmarklet-runtime.js","https://webbender-pro.web.app/bookmarklet-runtime.js"];if(s)s.remove();(function l(){if(i>=u.length)return console.error('Webbender: failed to load runtime');s=document.createElement('script');s.id='wb-run';s.src=u[i++];s.onerror=function(){s.remove();l()};s.onload=function(){s._wbLoaded=!0};document.head.appendChild(s);setTimeout(function(){if(!s._wbLoaded&&!document.getElementById('webbender-ui')){s.remove();l()}},8000)})()})();`;
  // Execute the bookmarklet code in the page context
  await page.evaluate(bookmarklet);
  // Wait for any loading attempts
  await page.waitForTimeout(5000);
  await browser.close();
})();
