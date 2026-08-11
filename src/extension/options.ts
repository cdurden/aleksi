interface ExtensionSettings {
  activationBehavior: "always" | "lang_fi" | "toggle";
}

// Saves options to chrome.storage
const saveOptions = (e: Event): void => {
  const target = e.target as HTMLInputElement;
  const behavior = target.value as ExtensionSettings["activationBehavior"];

  chrome.storage.local.set({ activationBehavior: behavior }, (): void => {
    const status = document.getElementById("status");
    if (status) {
      status.textContent = "Options saved.";
      setTimeout(() => {
        status.textContent = "";
      }, 750);
    }
  });
};

// Restores radio button state using preferences stored in chrome.storage
const restoreOptions = (): void => {
  chrome.storage.local.get({ activationBehavior: "always" }, (items) => {
    const settings = items as ExtensionSettings;
    const radioButton = document.querySelector(
      `input[name="behavior"][value="${settings.activationBehavior}"]`,
    ) as HTMLInputElement;

    if (radioButton) {
      radioButton.checked = true;
    }
  });
};

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelectorAll('input[name="behavior"]').forEach((radio) => {
  radio.addEventListener("change", saveOptions);
});
