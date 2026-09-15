export interface ExtensionSettings {
  activationBehavior: "always" | "lang_fi" | "toggle";
}
export const defaultAleksiServerUrl = "https://aleksi.juttelijat.lol";
export const aleksiContentScriptId = "aleksi-content-script";
export const requireEnable = false;
export const autoInjectContentScript = true;
export const defaultActivationBehavior = autoInjectContentScript
  ? "lang_fi"
  : "toggle";
