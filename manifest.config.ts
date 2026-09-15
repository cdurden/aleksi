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
  key: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvB8+1bY9X/7uBJhQpvqmCCgZY0ObX3o5EJ/jzbXJTaRuWlD5PHV6TIwa5QPeuVQ81dnIztPbIfF4+spo4yPIDd68q34Jrc0vJ2lSaNDivnPkYIwWzxe39ripoL8AiFL76rPWrjjaHtf8Zx588hxDbeMpKX31oR598ELjixNlwJZHXFkrj6anXqKcahVYaGYCo+fj35I/ptqNBedGYpYOMPqb1l6ytrMJreWP0/FjoDoN6cI0cX3Tesf/RKTAwvnugvx4XD4Z8H5tTtDA7HcmWwmeaFyy0gP1fovga/piTYu1W/96MKcV7RvjZa1nwbZTxr1UBcmDb3w1sj0YKMiWtQIDAQAB",
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
