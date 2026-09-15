import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  manifest_version: 3,
  name: "Aleksi",
  version: "0.0.1",
  description:
    "Aleksi on auttaja lukemaan esineitä suomenkielella internetissa.",
  permissions: ["activeTab", "scripting", "storage"],
  background: {
    service_worker: "extension/background.ts",
  },
  host_permissions: ["https://aleksi.juttelijat.lol/*"],
  /*
  content_scripts: [
    {
      js: ["extension/content.ts"],
      matches: ["<all_urls>"], //["https://*.this-is-a-fake-domain-for-crxjs-hmr.com/*"],
      all_frames: true,
    },
  ],
  */
  web_accessible_resources: [
    {
      resources: ["extension/netflix-poly-bridge.js"],
      matches: ["<all_urls>"],
    },
  ],
  action: {
    default_title: "Aleksi",
    default_popup: "extension/popup.html",
  },
  options_page: "extension/options.html",
});
