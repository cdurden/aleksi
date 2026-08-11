if (typeof globalThis !== "undefined" && !("__LIVE_RELOAD__" in globalThis)) {
  (globalThis as any).__LIVE_RELOAD__ = {
    host: "localhost",
    port: 5173, // Matches your default Vite dev server port
    disabled: true, // Safely silences or prevents broken socket retry loops
  };
}

import contentScriptUrl from "./content.ts?script";

interface ExtensionSettings {
  activationBehavior: "always" | "lang_fi" | "toggle";
}

type IncomingMessage =
  | {
      action: "BackgroundHTTPProxyRequest";
      url?: string;
      options?: RequestInit;
    }
  | {
      action: "RegisterTab";
    };

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
    } else {
      await chrome.tabs.sendMessage(tabId, {
        action: "UnmountAleksi",
      });
    }
  } catch (error) {
    // Failsafe catch block for restricted system pages (e.g. chrome:// or extensions gallery)
    console.warn("Could not modify tab UI:", error);
  }
}

// Re-architected evaluation engine
async function evaluateTabActivation(tab: chrome.tabs.Tab): Promise<void> {
  //if (!tab.id || !tab.url || tab.url.startsWith("chrome://")) return;
  if (!tab.id) return;
  const tabId = tab.id;

  const data = await chrome.storage.local.get({ activationBehavior: "always" });
  const settings = data as ExtensionSettings;

  if (settings.activationBehavior === "always") {
    setBadge(tabId, true);
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
          setBadge(tabId, isFi);
          // Explicitly turns ON or OFF depending on the language calculation match
          await updateTab(tabId, isFi);
        }
      },
    );
  } else if (settings.activationBehavior === "toggle") {
    const isToggledOn = !!tabToggleStates[tabId];
    setBadge(tabId, isToggledOn);
    await updateTab(tabId, isToggledOn);
  }
}

chrome.tabs.onActivated.addListener(({ tabId }): void => {
  const tab = getTab(tabId);
  if (!tab) throw Error(`Tab ${tabId} not found in Aleksi tab registry`);
  evaluateTabActivation(tab);
});

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
      } catch (error) {
        // Failsafe catch block for restricted system pages (e.g. chrome:// or extensions gallery)
        console.warn("Could not execute content script in tab:", error);
      }
    }
  },
);

// Handle extension icon clicks
chrome.action.onClicked.addListener(
  async (tab: chrome.tabs.Tab): Promise<void> => {
    if (!tab.id) return;
    const tabId = tab.id;

    const data = await chrome.storage.local.get({
      activationBehavior: "always",
    });
    const settings = data as ExtensionSettings;

    if (settings.activationBehavior === "toggle") {
      tabToggleStates[tabId] = !tabToggleStates[tabId];
      evaluateTabActivation(tab);
    } else {
      evaluateTabActivation(tab);
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
      evaluateTabActivation(sender.tab);
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
