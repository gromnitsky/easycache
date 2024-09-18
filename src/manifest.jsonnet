function(browser="chrome") {
  "manifest_version": 3,
  "name": "easycache",
  "description": "An interface to various web caches or archivers (Google, Bing, Wayback Machine, archive-is). You can add another providers.",
  "version": "3.0.2",
  "options_ui": {
    "page": "options.html"
  },
  "permissions": [
    "contextMenus",
    "activeTab",
    "storage"
  ],
  "host_permissions": [
    "https://www.bing.com/*"
  ],
  "background": if browser == "firefox" then {
    "type": "module",
    "scripts": ["service_worker.js"]
  } else {
    "type": "module",
    "service_worker": "service_worker.js"
  },
  [if browser == "firefox" then "browser_specific_settings"]: {
    "gecko": {
      "id": "{f21a4601-8d19-4e61-be09-6101beb4519d}",
      "strict_min_version": "130.0"
    }
  },
  "action": {
    "default_popup": "popup.html",
    "default_icon": "icon128.png"
  },
  "icons": {
    "128": "icon128.png"
  }
}
