import type { Component, VNode } from "black-no-sugar";
import { text, h, Cmd, mapCmd, Selector } from "black-no-sugar";
import { afterRender } from "fufu/web-components/post-render.js";
import {
  type ResizableModel,
  type ResizableMsg,
  type MaybeSize,
} from "fufu/layouts/resizable.js";

export type AleksiModel<P = any> = {
  payloads: Map<string, P>;
  currentQuery: string | null;
  errorMessages: string[];
  resizable: ResizableModel;
  visible: boolean;
  contentHeight: number | undefined;
  minHeight: number;
  maxHeight: number | null;
  queryOrdering: number[];
};

export type AleksiMsg =
  | { type: "PayloadReceived"; payload: any; query: string }
  | { type: "WordHighlighted"; word: string }
  | { type: "ExecuteQuery"; query: string }
  | { type: "QueryFailed"; error: Error }
  | { type: "UpdatePopupSize"; size: MaybeSize }
  | { type: "ResizableMsg"; resizableMsg: ResizableMsg }
  | { type: "HideAleksi" }
  | { type: "ActivateHighlighter"; id: string; clientSelector: Selector };

interface TranslationItem {
  pin: string;
  translation: string;
  source: string;
}

interface LemmaItem {
  lemma: string;
  translations: TranslationItem[];
}

export type Tagset = Record<string, any>;

export interface AleksiFiPayload {
  lemmas: LemmaItem[];
  tagsets: Tagset[];
}

interface AleksiFiScope {
  $style: Record<string, string>;
  iconsStyle: Record<string, string>;
  allowPins: boolean;
  savedPins: Set<string>;
  source_url: (t: TranslationItem) => string;
  togglePin: (pin: string) => void;
  tagLabels: Map<string, string>;
}

function execQuery(apiBaseUrl: URL, query: string): Cmd<AleksiMsg> {
  if (!apiBaseUrl) return Cmd.none();
  const fetchWordCmd = Cmd.fetch<AleksiMsg>(
    new URL(`/words/${query}`, apiBaseUrl).href,
    // Map backend histories, flagging them as historically confirmed (isPending: false) [INDEX]
    (data): AleksiMsg => ({
      type: "PayloadReceived",
      query: query,
      payload: data,
    }),
    (err): AleksiMsg => ({ type: "QueryFailed", error: err }),
  );
  return fetchWordCmd;
}

export interface AleksiConfigContext {
  config: {
    aleksi: {
      apiBaseUrl: string;
    };
  };
}

export const aleksiComponent: Component<
  AleksiMsg,
  AleksiModel,
  AleksiConfigContext
> = {
  init(
    { initialQuery = "tervetuloa" },
    ctx: any,
    recurse,
  ): [AleksiModel, Cmd<AleksiMsg>] {
    const model = {
      payloads: new Map(),
      currentQuery: initialQuery,
      errorMessages: [],
      visible: false,
      contentHeight: undefined,
      minWidth: ctx?.config?.aleksi?.minWidth ?? 100,
      minHeight: ctx?.config?.aleksi?.minHeight ?? 100,
      maxHeight: ctx?.config?.aleksi?.maxHeight ?? null,
      queryOrdering: [],
    };
    const resizableMeta = {
      dragSelector: ".drag-el",
      w: 400,
      fitParent: true,
      l: 0,
      t: 0,
      maxH: model.maxHeight,
      minH: model.minHeight,
      minW: ctx?.config?.aleksi?.minWidth ?? 100,
      adjustSize: true,
    };
    const [resizableModel, resizableCmd] = recurse(
      "resizable",
      resizableMeta,
      ctx,
    );
    const wrappedResizableCmd = mapCmd(resizableCmd, (m: ResizableMsg) => ({
      type: "ResizableMsg" as const,
      resizableMsg: m,
    }));
    const executeQueryCmd = execQuery(
      new URL(ctx?.config?.aleksi?.apiBaseUrl),
      initialQuery,
    );
    return [
      { ...model, resizable: resizableModel },
      Cmd.batch([executeQueryCmd, wrappedResizableCmd]),
    ];
  },

  update: function update(
    msg,
    model,
    ctx,
    recurse,
  ): [AleksiModel, Cmd<AleksiMsg>] {
    // ◄ 1. Explicitly type the function return signature here
    switch (msg.type) {
      case "WordHighlighted": {
        if (model.payloads.has(msg.word)) {
          model.currentQuery = msg.word;
          model.queryOrdering.push(
            Array.from(model.payloads.keys()).indexOf(msg.word),
          );
          model.visible = true;
          return [model, Cmd.none()];
        } else {
          return update(
            { type: "ExecuteQuery", query: msg.word },
            model,
            ctx,
            recurse,
          );
        }
      }
      case "ExecuteQuery": {
        const executeQueryCmd = execQuery(
          new URL(ctx?.config?.aleksi?.apiBaseUrl),
          msg.query,
        );
        model.visible = true;
        return [model, executeQueryCmd];
      }
      case "PayloadReceived": {
        model.payloads.set(msg.query, msg.payload);
        model.queryOrdering.push(model.payloads.size - 1);
        const nextModel: AleksiModel = {
          ...model,
          currentQuery: msg.query,
        };
        return [nextModel, Cmd.none()];
      }
      case "QueryFailed": {
        model.errorMessages.push(msg.error.message);
        return [model, Cmd.none()];
      }
      case "UpdatePopupSize": {
        const [resizableModel, resizableCmd] = recurse(
          { type: "UpdateSize", size: msg.size },
          model.resizable,
          ctx,
        );
        return [
          { ...model, resizable: resizableModel as ResizableModel },
          mapCmd(
            resizableCmd,
            (resizableMsg: ResizableMsg): AleksiMsg => ({
              type: "ResizableMsg",
              resizableMsg,
            }),
          ),
        ];
      }
      case "HideAleksi": {
        model.visible = false;
        return [model, Cmd.none()];
      }
      case "ActivateHighlighter": {
        const targetsSelector =
          new URL(String(window.location)).hostname === "www.netflix.com"
            ? ".player-timedtext-text-container"
            : "body";
        const activateHighlighterCmd: Cmd<AleksiMsg> = Cmd.batch([
          Cmd.custom("highlighter", {
            action: "ActivateHighlighter",
            id: `${msg.clientSelector.id}-NetflixClosedCaptionsNavigator`,
            highlighterType: "NetflixClosedCaptionsNavigator",
            targetsSelector,
            excludeSelector: msg.clientSelector.queryString,
          }),
          Cmd.custom("highlighter", {
            action: "ActivateHighlighter",
            id: `${msg.clientSelector.id}-ClickWordInTarget`,
            highlighterType: "ClickWordInTarget",
            targetsSelector,
            excludeSelector: msg.clientSelector.queryString,
          }),
        ]);
        return [model, activateHighlighterCmd];
      }
      default:
        return [model, Cmd.none()];
    }
  },

  subscriptions: (_model) => {
    return {
      type: "ListenToChannel",
      channel: "highlighter:highlight",
      onMessage: (word: any): AleksiMsg => ({
        type: "WordHighlighted",
        word: word,
      }),
    };
  },

  view: (
    model: AleksiModel,
    ctx,
    dispatch,
    selector: Selector,
    recurse,
  ): VNode => {
    if (!model.currentQuery) return text("");
    const scope: AleksiFiScope = {
      $style: {} as Record<string, any>,
      iconsStyle: {} as Record<string, any>,
      allowPins: false,
      savedPins: new Set([]) as Set<string>,
      source_url: (_t: TranslationItem) => "",
      togglePin: (_pin: string) => {},
      tagLabels: new Map([
        ["BASEFORM", "Base word"],
        ["WORDBASES", "Morphemes"],
        ["CLASS", "Class"],
        ["SIJAMUOTO", "Case"],
        ["NUMBER", "Number"],
        ["MOOD", "Mood"],
        ["PERSON", "Person"],
        ["TENSE", "Tense"],
        ["NEGATIVE", ""],
      ]),
    };
    const {
      $style,
      iconsStyle,
      allowPins,
      savedPins,
      source_url,
      togglePin,
      tagLabels,
    } = scope;

    const payload = model.payloads.get(model.currentQuery);
    const lemmas = payload?.lemmas ?? [];
    const tagsets = payload?.tagsets ?? [];
    const wordViewSlot = afterRender(
      [
        h("div", { class: "aleksi-container" }, [
          h("div", { class: "drag-bar" }, [
            ...Array.from(model.payloads)
              .filter((_, index) => {
                return model.queryOrdering.slice(-1).includes(index);
              })
              .map(([query, _payload]) =>
                h("div", { class: "aleksi-tab" }, [
                  h(
                    "input",
                    {
                      name: "aleksi-query-input",
                      value: `${query}`,
                      onkeypress: (event: KeyboardEvent) => {
                        if (event.key === "Enter") {
                          const target = event.target as HTMLInputElement;
                          dispatch({
                            type: "ExecuteQuery",
                            query: target.value,
                          });
                        }
                      },
                    },
                    [],
                  ),
                  /*
                h("div", {}, [
                  h("input", { type: "text", list: "aleksi-queries-list" }, []),
                  h(
                    "datalist",
                    { id: "aleksi-queries-list" },
                    Array.from(model.payloads).map(([query, _payload]) =>
                      h("option", { value: query }, []),
                    ),
                  ),
                ]),
		*/
                ]),
              ),
            h("div", { class: "drag-el" }, []),
          ]),
          h("div", { class: "aleksi-content-container" }, [
            h("div", { class: "aleksi-content" }, [
              model.errorMessages.length > 0
                ? h(
                    "div",
                    {},
                    model.errorMessages.map((errorMessage) =>
                      h("p", {}, [text(`Error: ${errorMessage}`)]),
                    ),
                  )
                : text(""),

              h("p", {}, [h("b", {}, [text("Dictionary entries")])]),

              ...(lemmas.length === 0
                ? [h("p", {}, [text("No results found")])]
                : []),

              h("table", { class: `lex` }, [
                h("tbody", {}, [
                  // Flatten and expand the nested matrix layout (v-for wrapper loops)
                  ...lemmas.flatMap((lemma: LemmaItem, lemmaIndex: number) =>
                    (lemma.translations || []).map(
                      (translationItem, translationIndex) =>
                        h("tr", {}, [
                          // Show lemma text if it's the very first row entry alignment lane
                          translationIndex === 0
                            ? h("th", {}, [text(lemma.lemma)])
                            : h("th", {}, []),

                          h("td", {}, [text(translationItem.translation)]),

                          h("td", {}, [
                            h("div", {}, [
                              h(
                                "a",
                                {
                                  href: source_url(translationItem),
                                  class: "icon-link",
                                  title: `Source: ${translationItem.source}`,
                                  target: "_blank",
                                },
                                [h("i", {}, [])],
                              ),

                              // Pin Control Button mapping pass (v-show evaluated to display props styles)
                              h(
                                "button",
                                {
                                  class: iconsStyle["control-button"],
                                  style: allowPins ? "" : "display: none;",
                                  onclick: () => togglePin(translationItem.pin),
                                },
                                [
                                  h(
                                    "i",
                                    {
                                      // Attach ref or data token for safe runtime identification queries
                                      "data-ref": `savePinButtonIcon${lemmaIndex}`,
                                      style: savedPins.has(translationItem.pin)
                                        ? ""
                                        : "transform: rotate(90deg)",
                                    },
                                    [],
                                  ),
                                  h("span", {}, []),
                                ],
                              ),
                            ]),
                          ]),
                        ]),
                    ),
                  ),
                ]),
              ]),

              // --- DERIVATIONS TRACK LIST ---
              h("p", {}, [h("b", {}, [text("Possible derivations")])]),

              ...(tagsets.length === 0
                ? [h("p", {}, [text("No results found")])]
                : []),

              h("div", { class: "morph-list-container" }, [
                ...tagsets.map((tagset: Tagset, index: number) =>
                  h("div", { class: "morph-container" }, [
                    h("div", { class: "morph-index" }, [text(`${index + 1}.`)]),

                    h("table", {}, [
                      h("tbody", {}, [
                        ...Array.from(tagLabels.entries())
                          .filter(([tagKey]) => tagKey && tagKey in tagset) // Combines v-if filtering loop internally
                          .map(([tagKey, tagLabel]) =>
                            h("tr", {}, [
                              h("th", {}, [text(tagLabel ?? "")]),
                              h("td", {}, [text(tagset[tagKey] ?? "")]),
                            ]),
                          ),
                      ]),
                    ]),
                  ]),
                ),
              ]),

              // --- CO-BRANDING ATTRIBUTION ---
              h("div", { class: "powered-by" }, [
                text("Powered by "),
                h(
                  "a",
                  {
                    class: "reference",
                    href: "http://voikko.puimula.org/",
                  },
                  [text("Voikko")],
                ),
              ]),
            ]),
          ]),
          h("div", { class: "aleksi-footer" }, [
            h("div", { class: "drag-bar" }, [
              h("div", { class: "drag-el" }, []),
              h("div", {}, [
                h(
                  "button",
                  {
                    class: "close-button",
                    onclick: (_e: Event) =>
                      dispatch({
                        type: "HideAleksi",
                      }),
                  },
                  [text("Close")],
                ),
              ]),
            ]),
          ]),
        ]),
      ],
      {},
      (_containerElmt) => {
        // FIXME:
        // Dispatching this message generates a view->update->view loop
        // We might hope that the second view would not trigger a DOM update,
        // and the loop would not happen.
        //
        // It seems like this queueMicrotask solution is just a trick that
        // prevents the engine from following its normal update cycle
        dispatch({
          type: "ActivateHighlighter",
          id: selector.id,
          clientSelector: selector,
        });
      },
    );

    function resizableDispatch(msg: ResizableMsg) {
      return dispatch({
        type: "ResizableMsg",
        resizableMsg: msg,
      });
    }

    return afterRender(
      [
        h(
          "div",
          { style: model.visible ? "display: block;" : "display: none;" },
          [
            h(
              "div",
              {
                [selector.attribute]: "",
                class: selector.css`${aleksiFiStyle}`,
              },
              [recurse(model.resizable, ctx, { content: wordViewSlot })],
            ),
          ],
        ),
      ],
      {},
      (elmt: HTMLElement | null) => {
        if (!elmt) return;
        const dragBarElmt = elmt.querySelector(".drag-bar");
        const contentElmt = elmt.querySelector(".aleksi-content");
        const footerElmt = elmt.querySelector(".aleksi-footer");
        if (!contentElmt) return;
        const contentHeight =
          (dragBarElmt?.clientHeight ?? 0) +
          (contentElmt.clientHeight + 4) +
          (footerElmt?.clientHeight ?? 0) +
          5;
        const newHeight = model.maxHeight
          ? Math.min(model.maxHeight, contentHeight)
          : contentHeight;
        dispatch({
          type: "UpdatePopupSize",
          size: {
            h: newHeight,
          },
        });
      },
    );
  },
};

const aleksiFiStyle = `
  color: black;
  font-size: 12pt;
  font-family: sans-serif;
  position: fixed;
  top: 0px;
  left: 0px;
  height: 100vh;
  width: 100%;
  pointer-events: none;
  z-index: 3500001;
  :host {
    all: initial;
  }
  button.close-button {
    cursor: pointer;
    border-radius: 3px;
    border: 1px solid #c5c5c5;
    background: #f6f6f6;
    font-weight: normal;
    padding: 0.35em 0.5em;
    display: inline-block;
  }
  div.aleksi-container {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
  }
  div.aleksi-content-container {
    flex: 1;
    overflow: clip auto;
    padding: 2px;
  }
  div.aleksi-content {
    display: block;
  }
  div.aleksi-footer {
    text-align: right;
    padding: 0px;
  }
  div.aleksi-tab input {
    line-height: 1.4em;
    field-sizing: content;
    border-radius: 2px 2px 0px 0px;
    margin: 2px 0px -1px 2px;
    padding: 0.35em 0.5em;
    border: 1px solid #ccc;
    background: #fff;
    border-bottom: 0px;
    display: inline-flex;
    align-items: center;
    gap: 8px; /* Spaces the text and the arrow */
  }
  .caret {
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid #333; /* Color of the arrow */
    cursor: pointer;
  }
  div.drag-bar {
    display: flex;
    flex: 0 0 1.25em;
    list-style: none;
    padding: 0;
    margin: 0;
    border-top-left-radius: 2px;
    border-top-right-radius: 2px;
    border-bottom: 1px solid #ccc;
    background: #f6f6f6;
  }
  div.drag-el {
    flex: 1;
    height: 100%;
    cursor: grab;
  }
  table tbody tr td {
    padding: 2px;
  }
  table tbody tr th {
    text-align: right;
￼   font-weight: bold;
￼   word-break: normal;
  }
  table tbody tr:nth-child(even) td:nth-child(2) {
    background: #eee;
  }
  .morph-list-container {
    display: flex;
    flex-direction: column;
  }
  .morph-container {
    display: inline-flex;
    margin: 2px; 
  }
  .morph-container table {
    border: 1px solid #ddd;
￼   margin: 0px 0px 10px 0px;
￼   display: inline-block;
  }
  div.morph-index {
    vertical-align: top;
    display: inline-block;
    margin: 5px;
  }
  p {
    margin: 2px;
  }
  div.powered-by {
    text-align: right;
    font-size: smaller;
  }
`;
