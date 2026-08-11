import { injectApp, Registry } from "black-no-sugar";

import { HighlightManager } from "fufu/managers/highlighter.js";
import { HTTPFetchManager } from "fufu/managers/fetch.js";

import { contextProviderSpec } from "fufu/providers/context.js";
import { popupsLayout } from "fufu/layouts/popups.js";
import { resizableSpec } from "fufu/layouts/resizable.js";
import { aleksiComponent } from "./components/aleksi.js";

export const aleksiConfig = {
  type: "contextProvider",
  meta: {
    config: {
      aleksi: {
        apiBaseUrl: "http://aleksi.juttelijat.lol",
        maxHeight: 400,
      },
    },
  },
  children: {
    content: {
      type: "popups",
      popups: ["aleksi"],
      children: {
        "popup.aleksi": {
          type: "aleksi",
          args: ["tervetuloa"],
        },
      },
    },
  },
} as const;

export const aleksiRegistry = new Registry({})
  .addContainer("contextProvider", contextProviderSpec)
  .addContainer("popups", popupsLayout)
  .addContainer("resizable", resizableSpec)
  .addComponent("aleksi", aleksiComponent);

const appRoot = document.getElementById("aleksi-root");
if (appRoot) {
  injectApp(appRoot, aleksiConfig, aleksiRegistry, [
    new HighlightManager(),
    new HTTPFetchManager(),
  ]);
}
