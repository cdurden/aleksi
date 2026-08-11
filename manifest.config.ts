import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  manifest_version: 3,
  name: "Aleksi",
  version: "1.0",
  description:
    "Aleksi on auttaja lukemaan esineitä suomenkielella internetissa.",
  host_permissions: ["<all_urls>"],
  permissions: ["activeTab", "scripting", "storage"],
  background: {
    service_worker: "extension/background.ts",
  },
  content_scripts: [
    {
      js: ["extension/content.ts"],
      matches: ["https://*.this-is-a-fake-domain-for-crxjs-hmr.com/*"],
      all_frames: true,
    },
  ],
  web_accessible_resources: [
    {
      resources: ["extension/netflix-poly-bridge.js"],
      matches: ["<all_urls>"],
    },
  ],
  action: {
    default_title: "Aleksi",
  },
  options_page: "extension/options.html",
});
