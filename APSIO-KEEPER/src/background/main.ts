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

// const bgPromise: Promise<any> = setupBackgroundService();

 async function setupBackgroundService(): Promise<any> {

   const backgroundService = new BackgroundService({});

browser.runtime.onConnect.addListener(connectRemote);

   function connectExternal(remotePort: any) {

     const portStream = new PortStream(remotePort);
     //@ts-ignore
     const origin = url.parse(remotePort.sender.url).hostname;
     backgroundService.setupPageConnection(portStream, origin);

   }

   /**
  * Connecte un port à l'APSIO-KEEPER.
  * 
  * @param remotePort Le port donné 
  */
   function connectRemote(remotePort: any) {

     const processName = remotePort.name;
     if (processName === 'contentscript') {

       connectExternal(remotePort);

     }

   }

   return backgroundService;

 }

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

 class BackgroundService extends EventEmitter {

   constructor(options = Object()) {
     super();
   }

   //L'api qui va être injecté dans la page web
   getInpageApi(origin: any) {

     return {

      auth: async () => {
        return "tu as réussi l'injection de l'api";
      }

     }

   }

   setupPageConnection(connectionStream:any, origin: any){

     const inpageApi = this.getInpageApi(origin);
     const dnode = setupDnode(connectionStream, inpageApi, 'inpageApi');
  

   }

}