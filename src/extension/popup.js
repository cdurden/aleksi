import { defaultAleksiServerUrl, aleksiContentScriptId } from "./settings.ts";
document.addEventListener("DOMContentLoaded", async () => {
  const enableBtn = document.getElementById("enable-btn");
  const statusMsg = document.getElementById("status-msg");
  const serverUrl = defaultAleksiServerUrl; // Match your actual endpoint format

  // Check if the user already granted permission previously
  const permissionMatch = `${serverUrl}/*`;
  const hasPermission = await chrome.permissions.contains({
    origins: [permissionMatch],
  });
  const existing = await chrome.scripting.getRegisteredContentScripts();
  const isActive = existing.some((s) => s.id === aleksiContentScriptId);

  if (hasPermission && isActive) {
    showActivatedState();
  }

  // Handle the activation click
  enableBtn.addEventListener("click", async () => {
    try {
      const granted = await chrome.permissions.request({
        origins: [permissionMatch],
      });

      if (granted) {
        // Send message to background.js to dynamically register content script
        chrome.runtime.sendMessage({ action: "ActivateExtension" });
        showActivatedState();
      } else {
        alert("Permission is required to link with the Aleksi server.");
      }
    } catch (error) {
      console.error("Error requesting permissions:", error);
    }
  });

  function showActivatedState() {
    enableBtn.style.display = "none";
    statusMsg.style.display = "block";
  }
});
