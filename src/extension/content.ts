import "@webcomponents/custom-elements";
import { injectApp } from "black-no-sugar";
import type { Engine } from "black-no-sugar";
import "./netflix-polyfill.js";

import { HighlightManager } from "fufu/managers/highlighter.js";
import { BackgroundFetchManager } from "fufu/managers/background-fetch.js";
import { aleksiConfig, aleksiRegistry } from "../aleksi.js";

const APP_CONTAINER_ID = "extension-aleksi-app-root";

console.log("Aleksi content script initialized.");
var app: Engine<any, any, any> | null = null;
function mountAppDOM(): void {
  // Check the document directly to see if our anchor already exists
  let hostAnchor = document.getElementById(APP_CONTAINER_ID);

  if (!hostAnchor) {
    // 2. Create the main host anchor element
    hostAnchor = document.createElement("div");
    hostAnchor.id = APP_CONTAINER_ID;
    document.body.appendChild(hostAnchor);

    // 3. Attach a Closed Shadow Root to isolate your UI completely
    const shadowRoot = hostAnchor.attachShadow({ mode: "closed" });

    const appRoot: HTMLDivElement = document.createElement("div");
    shadowRoot.appendChild(appRoot);

    app = injectApp(appRoot, aleksiConfig, aleksiRegistry, [
      new HighlightManager(),
      new BackgroundFetchManager(),
    ]);

    console.log("Mounted Aleksi browser extension application root.");
  }
}

function unmountAppDOM(): void {
  if (app) {
    app.destroy();
    app = null;
  }
  const appRoot = document.getElementById(APP_CONTAINER_ID);
  if (appRoot) {
    appRoot.remove();
    console.log("Unmounted Aleksi browser extension application root.");
  }
}

// Listen for explicit instructions from the background worker
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "MountAleksi") {
    mountAppDOM();
  } else if (message.action === "UnmountAleksi") {
    unmountAppDOM();
  }
});

chrome.runtime.sendMessage({ action: "RegisterTab" });
