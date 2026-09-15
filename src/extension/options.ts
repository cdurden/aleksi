import {
  defaultActivationBehavior,
  type ExtensionSettings,
  autoInjectContentScript,
} from "./settings.js";

interface BehaviorOption {
  id: string;
  value: string;
  label: string;
  enabled: boolean; // Control visibility based on your imported settings
}

const behaviorOptions: BehaviorOption[] = [
  {
    id: "behavior_always",
    value: "always",
    label: "Always active",
    enabled: autoInjectContentScript, // Always available
  },
  {
    id: "behavior_lang_fi",
    value: "lang_fi",
    label: 'Activate when page language is Finnish ("fi")',
    enabled: autoInjectContentScript, // Dynamically toggled
  },
  {
    id: "behavior_toggle",
    value: "toggle",
    label: "Toggle activation when clicking icon",
    enabled: true, // Dynamically toggled
  },
];

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
  chrome.storage.local.get(
    { activationBehavior: defaultActivationBehavior },
    (items) => {
      const settings = items as ExtensionSettings;
      const radioButton = document.querySelector(
        `input[name="behavior"][value="${settings.activationBehavior}"]`,
      ) as HTMLInputElement;

      if (radioButton) {
        radioButton.checked = true;
      }
    },
  );
};

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("behavior-container");
  const statusDiv = document.getElementById("status");

  if (!container || !statusDiv) return;

  // Fetch the user's previously saved selection (default to 'always')
  const storage = await chrome.storage.local.get({ savedBehavior: "always" });
  const currentSelection = storage.savedBehavior;

  // Filter out disabled options and generate DOM elements for enabled ones
  behaviorOptions
    .filter((option) => option.enabled)
    .forEach((option) => {
      // Create the wrapper label
      const label = document.createElement("label");

      // Create the radio input element
      const input = document.createElement("input");
      input.id = option.id;
      input.type = "radio";
      input.name = "behavior";
      input.value = option.value;

      // Check the box if it matches the user's saved selection
      if (option.value === currentSelection) {
        input.checked = true;
      }

      // Attach the change listener to save settings on-the-fly
      input.addEventListener("change", saveOptions);

      // Assemble elements: <label><input /> Text</label><br />
      label.appendChild(input);
      label.appendChild(document.createTextNode(` ${option.label}`));

      container.appendChild(label);
      container.appendChild(document.createElement("br"));
    });

  restoreOptions();
});
document.querySelectorAll('input[name="behavior"]').forEach((radio) => {
  if (!(radio instanceof HTMLElement)) return;
  if (!autoInjectContentScript) {
    if (radio.id === "behavior_always") radio.style.display = "none";
    if (radio.id === "behavior_lang_fi") radio.style.display = "none";
  }
});
