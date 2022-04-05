import { sendMessage } from "webext-bridge";
import { Tabs } from "webextension-polyfill";
import browser from "webextension-polyfill";
import pump from "pump";
import EventEmitter from "events";
import PortStream from 'extension-port-stream';
//@ts-ignore
import { setupDnode } from '../lib/dnode-util';
import url from "url";

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import("/@vite/client");
  // load latest content script
  import("./contentScriptHMR");
}

browser.runtime.onConnect.addListener(async () => {

  browser.runtime.onMessageExternal.addListener( async (data) => {

    const tabId: number | undefined = (await browser.tabs.getCurrent()).id;

    //@ts-ignore
    return sendMessage("response", {data: "coucou"}, {context: "content-script", tabId});

  });

});

browser.runtime.onInstalled.addListener(async details => {
  // eslint-disable-next-line no-console
  //const bgService = await bgPromise;
});

let previousTabId = 0;

// communication example: send previous tab title from background page
// see shim.d.ts for type declaration
browser.tabs.onActivated.addListener(async ({ tabId }) => {
  if (!previousTabId) {
    previousTabId = tabId;
    return;
  }

  let tab: Tabs.Tab;

  try {
    tab = await browser.tabs.get(previousTabId);
    previousTabId = tabId;
  } catch {
    return;
  }

  // eslint-disable-next-line no-console
  console.log("previous tab", tab);
  sendMessage(
    "tab-prev",
    { title: tab.title },
    { context: "content-script", tabId }
  );
});
