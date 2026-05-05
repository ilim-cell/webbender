/**
 * Webbender Auto-Update Service
 * Checks for updates and notifies the user
 */

(function () {
  const UPDATE_CHECK_KEY = 'webbender-update-check';
  const UPDATE_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

  const CURRENT_VERSION = '1.0.2'; // This will be replaced during build
  const REPO = 'ilim-cell/webbender';
  const CDN_URL = 'https://cdn.jsdelivr.net/gh/ilim-cell/webbender@latest/dist/version.json';

  function shouldCheckForUpdates() {
    const lastCheck = localStorage.getItem(UPDATE_CHECK_KEY);
    if (!lastCheck) return true;
    return Date.now() - parseInt(lastCheck) > UPDATE_INTERVAL;
  }

  function markUpdateCheckTime() {
    localStorage.setItem(UPDATE_CHECK_KEY, Date.now().toString());
  }

  function getLatestVersion(callback) {
    const xhr = new XMLHttpRequest();
    xhr.timeout = 5000; // 5 second timeout

    xhr.onload = function () {
      if (xhr.status === 200) {
        try {
          const data = JSON.parse(xhr.responseText);
          callback(null, data.version);
        } catch (e) {
          callback(e, null);
        }
      } else {
        callback(new Error('Failed to fetch version'), null);
      }
    };

    xhr.onerror = function () {
      callback(new Error('Network error'), null);
    };

    xhr.ontimeout = function () {
      callback(new Error('Request timeout'), null);
    };

    xhr.open('GET', CDN_URL, true);
    xhr.send();
  }

  function compareVersions(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const a = parts1[i] || 0;
      const b = parts2[i] || 0;
      if (a > b) return 1;
      if (a < b) return -1;
    }
    return 0;
  }

  function showUpdateNotification(newVersion) {
    const notifId = 'webbender-update-notification';
    let notif = document.getElementById(notifId);

    if (notif) {
      notif.remove();
    }

    notif = document.createElement('div');
    notif.id = notifId;
    notif.innerHTML = `
      <div style="position: fixed; bottom: 20px; right: 20px; background: #2563eb; color: white; padding: 16px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); font-family: sans-serif; z-index: 2147483646; max-width: 300px;">
        <div style="font-weight: bold; margin-bottom: 8px;">Webbender Update Available</div>
        <div style="font-size: 12px; margin-bottom: 12px;">Version ${newVersion} is now available.</div>
        <div style="display: flex; gap: 8px;">
          <button id="webbender-update-now" style="background: white; color: #2563eb; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 12px;">Update Now</button>
          <button id="webbender-update-later" style="background: rgba(255,255,255,0.2); color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">Later</button>
        </div>
      </div>
    `;

    document.body.appendChild(notif);

    document.getElementById('webbender-update-now').onclick = function () {
      window.open(`https://github.com/${REPO}/releases/tag/v${newVersion}`, '_blank');
      notif.remove();
      localStorage.setItem(UPDATE_CHECK_KEY, Date.now().toString());
    };

    document.getElementById('webbender-update-later').onclick = function () {
      notif.remove();
      markUpdateCheckTime();
    };

    setTimeout(() => {
      if (notif.parentNode) {
        notif.remove();
      }
    }, 10000); // Auto-dismiss after 10 seconds
  }

  // Expose update check to window
  window._webbenderCheckUpdates = function (callback) {
    getLatestVersion((err, version) => {
      if (err) {
        console.log('Webbender: Update check failed:', err.message);
        if (callback) callback(false);
        return;
      }

      const comparison = compareVersions(version, CURRENT_VERSION);
      if (comparison > 0) {
        console.log(`Webbender: New version available: ${version}`);
        showUpdateNotification(version);
        if (callback) callback(true, version);
      } else {
        console.log('Webbender: Already on latest version');
        if (callback) callback(false);
      }
    });
  };

  // Auto-check for updates (only if bookmarklet UI has been opened)
  if (typeof window._webbenderCheckUpdates !== 'undefined' && shouldCheckForUpdates()) {
    markUpdateCheckTime();
    // Use a small delay to not block page load
    setTimeout(() => {
      window._webbenderCheckUpdates();
    }, 2000);
  }
})();
