import { sendMessage } from "webext-bridge";
import { Runtime, Tabs } from "webextension-polyfill";
import browser from "webextension-polyfill";
//@ts-ignore
import url from "url";
import * as apsio from '@apsiocoin/apsio-transactions';
import { publicKey, randomSeed, address } from "@waves/ts-lib-crypto";
import * as api from './../popup/components/Home/api';

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import("/@vite/client");
  // load latest content script
  import("./contentScriptHMR");
}

var apsiokeeper_popup:Runtime.Port;
var apsiokeeper_api = new Map();
var last_api_sender:Runtime.Port;
var current_url: string;
var connectionSeed;

/**
 * Sauvegarde la seed du compte actuel
 * @param {string} seed la seed à sauvegarder
 */
function saveSeed(seed:string){ (window as Record<string, any>).seed = seed; }

/**
 * Récupère la seed 
 * @returns {string} retourne la seed
 */
function getSeed():string { return (window as Record<string, any>).seed }

/**
 * Retourne la state courante
 * @returns {Object|null} la state 
 */
function getState(){ return (window as Record<string, any>).state; }

/**
 * Défini la state courante
 * @param {Object} state La state à setup
 */
async function setState(chaindId:string){ 

  console.log(chaindId);
  var userData = await api.getUserDatas(address(getSeed(), chaindId));
  var name = userData.find((data: any) => data.key == "nom").value;
  var prenom = userData.find((data: any) => data.key == "prenom").value;

  (window as Record<string, any>).state = {
      account: {
        name: prenom + ' ' + name,
        address: address(getSeed(), chaindId),
        publicKey: publicKey(getSeed()),
        balance: ( await api.getUserBalance(address(getSeed(), chaindId)) ) / 100000000
      },
      network: {
        server: api.API_URL,
        chainId: chaindId
      }
  }; 
}

/**
 * Remove the current state if there is any
 */
async function removeSeed(){ 
  delete (window as Record<string, any>).state;
  delete (window as Record<string, any>).seed;
}

/**
 * Api de l'apsioKeeper qui permet de communiquer avec la blockchain
 * @param data Les données qui vont être exploité par l'api
 * @returns La réponse de l'api
 */
async function Useapi(data: any) {

  var ret = {};

  switch (data.messageType) {

    case 'authSSI':
      browser.tabs.create({url:browser.runtime.getURL("dist/popup/index.html")});
      current_url = data.url;
      break;
    
    case 'publicState':
      ret = (getState() === undefined) ?
        {
          messageType: data.messageType,
          response: null,
          error: 'Aucun compte à été ajouté au Keeper'
        } : {
          messageType: data.messageType,
          response: getState()
        };
      break;

    case 'signAndPublishTransaction':
      var txData = data.txData;
      var seed:string = getSeed();
      txData.data.chainId = getState().network.chainId;
      var tx;
      console.log(txData.data);
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
          tx = apsio.data({data: txData.data, chainId:txData.chainId}, seed);
          break;
        //Invoke script transaction
        case 16:
          tx = apsio.invokeScript(txData.data, seed);
          break;
        default:
          tx = apsio.signTx(txData.data, seed);
      }
      try{

        ret = {
          messageType: data.messageType,
          response: await apsio.broadcast(tx, "https://nodes-testnet.wavesnodes.com")
        };

      }catch(e){

        ret = {
          messageType: data.messageType,
          response: null,
          error: e
        }
      }
      break;
  }

  return ret;

}

/**
 * Fais office d'api grâce à la connexion avec la popup
 * @param {string} func Le nom de la fonction à exécuter
 * @param {string} params Les paramètres à envoyer à la fonction en JSON
 */
function popupApi(func: string, params: Record<string, any>){

  switch(func){

    case 'saveSeed':
      saveSeed(params.seed);
      setState(params.network);
      break;

    case 'getQrCodeData':
      connectionSeed = randomSeed();
      var pk = publicKey(connectionSeed);
      var data = {
        qrcodeData: current_url,//"https://3000-nicolas82-sitecourswaves-xu264v449r6.ws-eu38.gitpod.io/api/encrypted/"
        seed: connectionSeed,
        key: pk
      }
      apsiokeeper_popup.postMessage(JSON.stringify(data));
      last_api_sender.postMessage(JSON.stringify({
        messageType: 'authSSI',
        response: pk
      }));
      break;
    
    case 'removeSeed':
      removeSeed();
      break;
  }

}

/**
 * Function qui est activé dès qu'une fonction se connecte au background
 */
function connected(connection: Runtime.Port) {

  switch(connection.name){

    //La connexion avec le contentscript
    case 'apsiokeeper_api':
      apsiokeeper_api.set(connection.sender, connection);
      connection.onMessage.addListener(async ( data, sender ) => {
        last_api_sender = sender
        var resp = await Useapi(JSON.parse(data));
        //@ts-ignore
        if(resp.messageType !== undefined){
          sender.postMessage(JSON.stringify(resp));
        }
      });
      break;
    
    //La connexion avec la popup
    case 'apsiokeeper_popup':
      apsiokeeper_popup = connection;
      connection.onMessage.addListener( ( message ) => {
        var mess = JSON.parse(message);
        popupApi(mess.func, mess.params);
      });
      break;
    
    //Connexion avec le header de la page
    case 'apsioheader': 
      connection.onMessage.addListener( (message) => {
        var mess = JSON.parse(message);
        popupApi(mess.func, mess.params);
      })
      break

  }

}

browser.runtime.onConnect.addListener(connected);

browser.runtime.onInstalled.addListener(async details => {
  // eslint-disable-next-line no-console
  //const bgService = await bgPromise;
});