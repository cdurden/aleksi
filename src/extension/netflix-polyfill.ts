declare global {
  interface Window {
    player: typeof NetflixPlayerPolyfill;
  }
}

const NetflixPlayerPolyfill = {
  // Access regular metrics safely straight from the HTML DOM Element
  get currentTime(): number {
    const video = document.querySelector("video");
    return video ? video.currentTime : 0;
  },

  get duration(): number {
    const video = document.querySelector("video");
    return video ? video.duration : 0;
  },

  // Abstract the setter signature to route commands to the Main World
  set currentTime(seconds: number) {
    window.postMessage(
      {
        source: "netflix-poly-bridge",
        action: "SEEK",
        value: seconds,
      },
      "*",
    );
  },

  play() {
    window.postMessage({ source: "netflix-poly-bridge", action: "PLAY" }, "*");
  },

  pause() {
    window.postMessage({ source: "netflix-poly-bridge", action: "PAUSE" }, "*");
  },
};

let isPlayerPolyfillInjected = false;

/**
 * Validates whether the active browser viewing location
 * matches an actual stream stream route.
 */
function isCurrentUrlWatchable(): boolean {
  const currentUrl = window.location.href;

  // Explicit rules: Must be the core subdomain AND contain the active watch routing token
  return (
    window.location.hostname === "www.netflix.com" &&
    currentUrl.includes("/watch/")
  );
}

/**
 * Orchestrates safe context injection operations
 * depending on video environment validation criteria.
 */
function handleUrlChangeCheck(): void {
  if (isCurrentUrlWatchable()) {
    if (!isPlayerPolyfillInjected) {
      isPlayerPolyfillInjected = true;
      initializeNetflixAutomationSuite();
    }
  } else {
    // Optional: Tear down or reset data handlers if they navigate away from a video
    if (isPlayerPolyfillInjected) {
      console.log("Navigated away from watch stream. Deactivating scripts.");
      isPlayerPolyfillInjected = false;
    }
  }
}

/**
 * Handles the actual script injection and polyfill initialization
 */
function initializeNetflixAutomationSuite(): void {
  console.log(
    "Valid video streaming URL detected. Injecting Main World framework...",
  );

  // Inject the lightweight Main World event bridge listener
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("extension/netflix-poly-bridge.js");
  script.onload = function () {
    script.remove();
  };
  (document.head || document.documentElement).appendChild(script);

  // Bind your polyfill instance globally to the isolated window context
  window.player = NetflixPlayerPolyfill;

  // Initialize your Selector Word Navigator here
  // const navigator = new NetflixSelectorWordNavigator('[data-uia="player-timed-text"]', ...);
}

// ==========================================
// 2. SPA ROUTE WATCHER SETUP
// ==========================================

// Run an initial validation pass immediately when the content script wakes up
handleUrlChangeCheck();

// Intercept SPA navigation updates by observing layout changes on the document body
const spaUrlObserver = new MutationObserver(() => {
  // Every time Netflix transforms the DOM layout, verify if the URL string has shifted
  let lastCachedUrl = window.location.href;

  if (window.location.href !== lastCachedUrl) {
    lastCachedUrl = window.location.href;
    handleUrlChangeCheck();
  }
});

spaUrlObserver.observe(document.body, { childList: true, subtree: true });
