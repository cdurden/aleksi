if (typeof globalThis !== "undefined" && !("__LIVE_RELOAD__" in globalThis)) {
  (globalThis as any).__LIVE_RELOAD__ = {
    host: "localhost",
    port: 5173, // Matches your default Vite dev server port
    disabled: true, // Safely silences or prevents broken socket retry loops
  };
}

import contentScriptUrl from "./content.ts?script";
import {
  defaultActivationBehavior,
  type ExtensionSettings,
  aleksiContentScriptId,
  requireEnable,
} from "./settings.js";

type IncomingMessage =
  | {
      action: "BackgroundHTTPProxyRequest";
      url?: string;
      options?: RequestInit;
    }
  | {
      action: "RegisterTab";
    }
  | { action: "ActivateExtension" }
  | { action: "DeactivateExtension" };

interface ProxyResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// Track manual toggle states per tab ID
const tabToggleStates: Record<number, boolean> = {};

const tabs: Record<number, chrome.tabs.Tab> = {};
function setTab(tabId: number, tab: chrome.tabs.Tab) {
  tabs[tabId] = tab;
}
function getTab(tabId: number) {
  return tabs[tabId];
}

// Helper to update the badge text and color
function setBadge(tabId: number, isActive: boolean): void {
  const text = isActive ? "on" : "off";
  const color = isActive ? "#4CAF50" : "#F44336"; // Green vs Red
  chrome.action.setBadgeText({ text, tabId });
  chrome.action.setBadgeBackgroundColor({ color, tabId });
}

async function updateTab(
  tabId: number,
  shouldBeActive: boolean,
): Promise<void> {
  try {
    if (shouldBeActive) {
      await chrome.tabs.sendMessage(tabId, {
        action: "MountAleksi",
      });
      setBadge(tabId, shouldBeActive);
    } else {
      await chrome.tabs.sendMessage(tabId, {
        action: "UnmountAleksi",
      });
      setBadge(tabId, shouldBeActive);
    }
  } catch (error) {
    // Failsafe catch block for restricted system pages (e.g. chrome:// or extensions gallery)
    console.warn("Could not modify tab UI:", error);
    setBadge(tabId, false);
  }
}

// Re-architected evaluation engine
async function evaluateTabActivation(tabId: number): Promise<void> {
  const data = await chrome.storage.local.get({
    activationBehavior: defaultActivationBehavior,
  });

  const settings = data as ExtensionSettings;
  if (settings.activationBehavior === "always") {
    await updateTab(tabId, true);
  } else if (settings.activationBehavior === "lang_fi") {
    chrome.scripting.executeScript(
      {
        target: { tabId },
        func: (): string => document.documentElement.lang,
      },
      async (results) => {
        if (results && results[0]) {
          const isFi = results[0].result === "fi";
          // Explicitly turns ON or OFF depending on the language calculation match
          await updateTab(tabId, isFi);
        }
      },
    );
  } else if (settings.activationBehavior === "toggle") {
    const isToggledOn = !!tabToggleStates[tabId];
    await updateTab(tabId, isToggledOn);
  }
}

chrome.tabs.onActivated.addListener(({ tabId }): void => {
  const tab = getTab(tabId);
  if (!tab) throw Error(`Tab ${tabId} not found in Aleksi tab registry`);
  evaluateTabActivation(tabId);
});

/*
// Listen for tab updates (navigating to a new URL or loading finishes)
chrome.tabs.onUpdated.addListener(
  (
    tabId: number,
    changeInfo: chrome.tabs.TabChangeInfo,
    tab: chrome.tabs.Tab,
  ): void => {
    setTab(tabId, tab);
    if (changeInfo.status === "complete" && tab.url?.startsWith("http")) {
      try {
        chrome.scripting.executeScript({
          target: { tabId },
          files: [contentScriptUrl],
        });
        evaluateTabActivation(tabId);
      } catch (error) {
        // Failsafe catch block for restricted system pages (e.g. chrome:// or extensions gallery)
        console.warn("Could not execute content script in tab:", error);
      }
    }
  },
);
	*/

// Handle extension icon clicks
chrome.action.onClicked.addListener(
  async (tab: chrome.tabs.Tab): Promise<void> => {
    if (!tab.id) return;
    const tabId = tab.id;
    if (!getTab(tabId)) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId },
          files: [contentScriptUrl],
        });
      } catch (err) {
        console.error("Failed to register or execute script:", err);
      }
    } else {
      const data = await chrome.storage.local.get({
        activationBehavior: defaultActivationBehavior,
      });
      const settings = data as ExtensionSettings;

      if (settings.activationBehavior === "toggle") {
        tabToggleStates[tabId] = !tabToggleStates[tabId];
        evaluateTabActivation(tabId);
      } else {
        evaluateTabActivation(tabId);
      }
    }
  },
);

// Clean up memory when a tab is closed
chrome.tabs.onRemoved.addListener((tabId: number): void => {
  delete tabToggleStates[tabId];
});

chrome.runtime.onMessage.addListener(
  (
    message: IncomingMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: ProxyResponse) => void,
  ): boolean | undefined => {
    if (message.action === "RegisterTab" && sender.tab?.id) {
      // Now you can safely send a message back to this specific tab
      setTab(sender.tab.id, sender.tab);
      evaluateTabActivation(sender.tab.id);
    }
    if (message.action === "BackgroundHTTPProxyRequest" && message.url) {
      fetch(message.url, message.options)
        .then((response: Response) => {
          if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
          return response.json();
        })
        .then((data: any) => {
          sendResponse({ success: true, data });
        })
        .catch((error: Error) => {
          sendResponse({ success: false, error: error.message });
        });
      return true;
    }
    return undefined;
  },
);

// Helper: Dynamically updates whether clicking the extension icon opens the popup or fires a click event
async function syncPopupState() {
  try {
    const existing = await chrome.scripting.getRegisteredContentScripts();
    const isActive = existing.some((s) => s.id === aleksiContentScriptId);

    if (!requireEnable || isActive) {
      // Content script is active -> Disable the popup so clicking triggers chrome.action.onClicked
      await chrome.action.setPopup({ popup: "" });
      console.log(`[${aleksiContentScriptId}] App active. Popup disabled.`);
    } else {
      // Content script is missing -> Re-enable popup so user can configure the URL
      await chrome.action.setPopup({ popup: "extension/popup.html" });
      console.log(`[${aleksiContentScriptId}] App inactive. Popup enabled.`);
    }
  } catch (err) {
    console.error("Error setting popup state:", err);
  }
}

// 1. Run the check whenever the background worker spins up or installs
chrome.runtime.onStartup.addListener(syncPopupState);
chrome.runtime.onInstalled.addListener(syncPopupState);

chrome.runtime.onMessage.addListener(
  (
    message: IncomingMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: ProxyResponse) => void,
  ) => {
    if (message.action === "ActivateExtension") {
      (async () => {
        try {
          const existing = await chrome.scripting.getRegisteredContentScripts();
          const isRegistered = existing.some(
            (s) => s.id === aleksiContentScriptId,
          );

          const scriptConfig = {
            id: aleksiContentScriptId,
            js: [contentScriptUrl],
            matches: ["<all_urls>"],
            runAt: "document_idle" as const,
          };

          if (isRegistered) {
            await chrome.scripting.updateContentScripts([scriptConfig]);
          } else {
            await chrome.scripting.registerContentScripts([scriptConfig]);
          }
          syncPopupState();

          // Notify popup that registration is completely finished
          sendResponse({ success: true });
        } catch (err: any) {
          console.error("Background script registration fault:", err);
          sendResponse({ success: false, error: err.message });
        }
      })();
      return true; // Keeps the channel open for async sendResponse
    }

    if (message.action === "DeactivateExtension") {
      (async () => {
        try {
          const existing = await chrome.scripting.getRegisteredContentScripts();
          if (existing.some((s) => s.id === aleksiContentScriptId)) {
            await chrome.scripting.unregisterContentScripts({
              ids: [aleksiContentScriptId],
            });
          }

          // Notify popup that cleanup is completely finished
          sendResponse({ success: true });
        } catch (err: any) {
          console.error("Background cleanup execution failed:", err);
          sendResponse({ success: false, error: err.message });
        }
      })();
      syncPopupState();
      return true; // Keeps the channel open for async sendResponse
    }
  },
);
