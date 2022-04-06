import { sendMessage } from "webext-bridge";
import { Runtime, Tabs } from "webextension-polyfill";
import browser from "webextension-polyfill";
import pump from "pump";
import EventEmitter from "events";
import PortStream from 'extension-port-stream';
//@ts-ignore
import { setupDnode } from '../lib/dnode-util';
import url from "url";
import apsio from '@apsiocoin/apsio-transactions';

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import("/@vite/client");
  // load latest content script
  import("./contentScriptHMR");
}


async function Useapi(data: any) {

  var ret = {};

  switch (data.messageType) {

    case 'authSSI':
      do {
        fetch("https://3000-nicolas82-sitecourswaves-p4pm3azwdlx.ws-eu38.gitpod.io/").then(async (data) => {
          try {
            ret = await data.json();
          } catch (e: any) {
            ret = e;
          }
        }).catch((error) => {
          ret = error;
        });
      } while (JSON.stringify(ret) == JSON.stringify({}));

    case 'signAndPublishTransaction':
      var tx;
      switch (data.type) {
        //Issue transaction
        case 3:
          tx = apsio.issue(data.data, data.seed);
          break;
        //Transfer transaction
        case 4:
          tx = apsio.transfer(data.data, data.seed);
          break;
        //Data transaction
        case 12:
          tx = apsio.data(data.data, data.seed);
          break;
        //Invoke script transaction
        case 16:
          tx = apsio.invokeScript(data.data, data.seed);
          break;
        default:
          tx = apsio.signTx(data.data, data.seed);
      }
      apsio.broadcast(tx, "https://nodes-testnet.wavesnodes.com").then((resp) => {
        ret = resp;
      });
      break;
  }

  return ret;

}

function connected(connection: Runtime.Port) {

  connection.onMessage.addListener((data) => {
    var resp = Useapi(JSON.parse(data));
    connection.postMessage(JSON.stringify(resp));
  });

}

browser.runtime.onConnect.addListener(connected);

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

  sendMessage("response", { data: "coucou" }, { context: "content-script", tabId });

  // eslint-disable-next-line no-console
  console.log("previous tab", tab);
  sendMessage(
    "tab-prev",
    { title: tab.title },
    { context: "content-script", tabId }
  );
});