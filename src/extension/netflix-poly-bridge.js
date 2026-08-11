(() => {
  // A clean wrapper translating Netflix API structures to universal controls
  const getNetflixPlayer = () => {
    try {
      const videoPlayerAPI =
        window.netflix?.appContext?.state?.playerApp?.getAPI()?.videoPlayer;
      if (!videoPlayerAPI) return null;

      const sessionIds = videoPlayerAPI.getAllPlayerSessionIds();
      if (!sessionIds || sessionIds.length === 0) return null;

      const activeSessionId = sessionIds[0];
      return videoPlayerAPI.getVideoPlayerBySessionId(activeSessionId);
    } catch {
      return null;
    }
  };

  // 1. Unified Message Command Router
  window.addEventListener("message", (event) => {
    // Structural source safety validation checkpoint
    if (
      event.source !== window ||
      !event.data ||
      event.data.source !== "netflix-poly-bridge"
    ) {
      return;
    }

    const player = getNetflixPlayer();
    if (!player) {
      console.warn("Netflix Polyfill: Active media player session not found.");
      return;
    }

    // 2. Map actions to internal playback functions
    switch (event.data.action) {
      case "SEEK":
        if (typeof event.data.value === "number") {
          // Netflix native engine seeks via MILLISECONDS (Seconds * 1000)
          player.seek(event.data.value * 1000);
        }
        break;

      case "PLAY":
        if (typeof player.play === "function") player.play();
        break;

      case "PAUSE":
        if (typeof player.pause === "function") player.pause();
        break;
    }
  });

  console.log(
    "Netflix VideoPlayer Controller Polyfill Initialized successfully.",
  );
})();
