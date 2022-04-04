import { sendMessage } from "webext-bridge";
import { Tabs } from "webextension-polyfill";
import browser from "webextension-polyfill";
import pump from "pump";
import EventEmitter from "events";
import PortStream from 'extension-port-stream';
import { setupDnode } from '../lib/dnode-util';

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import("/@vite/client");
  // load latest content script
  import("./contentScriptHMR");
}

const bgPromise: Promise<any> = setupBackgroundService();

function setupBackgroundService() : Promise<any>{
  return 0;
}

browser.runtime.onInstalled.addListener(async details => {
  // eslint-disable-next-line no-console
  const bgService = await bgPromise;
});

let previousTabId = 0;

//Quand l'extension est initialisé je crois
browser.runtime.onConnect.addListener(() => {
  
});

/**
 * Connecte un port à l'APSIO-KEEPER.
 * 
 * @param remotePort Le port donné 
 */
function connectRemote(remotePort: any){

}

//Est exécuté lors de la première installation
browser.runtime.onInstalled.addListener(( reason ) => {

});

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

class BackgroundService extends EventEmitter {

  constructor(options = Object()){
    super();
  }

  //L'api qui va être injecté dans la page web
  getInpageApi(origin: any) {

    return {
      
    }

  }

}