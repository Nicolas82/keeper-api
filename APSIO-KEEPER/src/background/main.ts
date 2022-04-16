import { sendMessage } from "webext-bridge";
import { Runtime, Tabs } from "webextension-polyfill";
import browser from "webextension-polyfill";
//@ts-ignore
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
      browser.tabs.create({url:browser.runtime.getURL("dist/popup/index.html")});
      ret = {
        messageType: data.messageType,
        response: "Je suis trop fort"
      };
      break;

    case 'signAndPublishTransaction':
      var txData = data.txData;
      var seed:string = /*walletController.getSeed();*/ "agree end glass enforce whisper measure clip table file pear daring undo tool leaf own";
      var tx;
      switch (txData.type) {
        //Issue transaction
        case 3:
          tx = apsio.issue(txData.data, seed);
          break;
        //Transfer transaction
        case 4:
          tx = apsio.transfer(txData.data, seed);
          break;
        //Data transaction
        case 12:
          tx = apsio.data(txData.data, seed);
          break;
        //Invoke script transaction
        case 16:
          tx = apsio.invokeScript(txData.data, seed);
          break;
        default:
          tx = apsio.signTx(txData.data, seed);
      }
      ret = {
        messageType: data.messageType,
        response: await apsio.broadcast(tx, "https://nodes-testnet.wavesnodes.com")
      };
      break;
  }

  return ret;

}
//Met la connexion en le content-script et le background
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

  // eslint-disable-next-line no-console
  console.log("previous tab", tab);
  sendMessage(
    "tab-prev",
    { title: tab.title },
    { context: "content-script", tabId }
  );
});