/* eslint-disable no-console */
import React from "react";
import ReactDOM from "react-dom";
import { onMessage } from "webext-bridge";
import browser, { Runtime } from "webextension-polyfill";
//import LocalMessageDuplexStream from 'post-message-stream';

/**
 * Regarde si le type du document est valide 
 * @returns {boolean} si le type de document est accepté
 */
function doctypeCheck() : Boolean{
  const { doctype } = window.document;
  return doctype ? doctype.name === 'html' : true;
}

/**
 * Regarde si l'extension du document est autorisé
 * @returns {boolean} si l'extension est validé
 */
function suffisCheck() : Boolean{
  const prohibitedTypes = [/\.xml$/u, /\.pdf$/u];
  const currentUrl = window.location.pathname;
  for(let i = 0; i < prohibitedTypes.length; i++){
    if(prohibitedTypes[i].test(currentUrl)){
      return false;
    }
  }
  return true;
}

/**
 * Regarde si le document est bien dans un tag <html>
 * @returns {boolean} si le document dipose de la balise html
 */
function documentElementCheck() : Boolean{
  const documentElement = document.documentElement.nodeName;
  return documentElement ? documentElement.toLowerCase() == 'html' : true;
}

/**
 * Détermine si l'api doit être injecté
 * @returns 
 */
function shouldInject() {
  return doctypeCheck() && suffisCheck() && documentElementCheck(); 
}

/**
 * Injecte une balise script dans le document actuel 
 * @param content le code à être éxécuté par le document
 */
function injectScript() {
  try{

    const container = document.head || document.documentElement;
    const scriptTag = document.createElement('script');

    scriptTag.setAttribute('async', 'false');
    scriptTag.src = browser.runtime.getURL('dist/inpage.js');
    container.insertBefore(scriptTag, container.children[0]);
    scriptTag.onload = () => {
      container.removeChild(scriptTag);
    }
  }catch(error){
    console.error("Erreur lors de la tentative d'injection. ", error);
  }
}


/**
 * Récupère la state publique du keeper
 */
function _getPublicState(){

  var data = {
    messageType: "publicState",
    account: {
      name : "foo",
      publicKey: "bar",
      address: "addr",
      networkCode: "network byte",
      
    },
    network : {
      code: "W",
      server: "https://testnet-nodes.wavesnode.com/"
    }
  }

  const event = new CustomEvent("apiResponse", {detail: data});

  window.dispatchEvent(event);

}

/**
 * Effectue une requête de connexion de type authSSI
 */
function _useAuthSSI(){

  //TODO: générer une seed
  //TODO: créer un qr code

}

/**
 * Envoi la transaction a traité par le background
 * @param data Les données à envoyées au background
 * @param background la connection au background
 */
function _processTransaction(data:Object, background:Runtime.Port){

  background.postMessage(JSON.stringify(data));

}


/**
 * Configure la communication entre l'extension et 
 * les pages du navigateur
 */
async function setupStreams() {

  //Connnection avec le background
  var port_background:Runtime.Port = browser.runtime.connect({ name: 'apsiokeeper_api'});
  var port_popup:Runtime.Port = browser.runtime.connect({ name: 'apsiokeeper_popup '});

  //Connection avec l'inpage 
  window.addEventListener("message", (event) => {

    var messageType:string = JSON.parse(event.data).messageType;
    var data:Object = JSON.parse(event.data);

    switch(messageType){
      case "authSSI":
        _useAuthSSI();
        break;
      case "publicState":
        _getPublicState();
        break;
      case "transaction":
        _processTransaction(data, port_background);
        break;
    }

  });

  port_background.onMessage.addListener(( data ) => {

    console.log("j'ai reçu du background " + data);

  });

}

// Firefox `browser.tabs.executeScript()` requires scripts return a primitive value
(() => {

  if(shouldInject()){
    injectScript();
    setupStreams();
  }

  console.info("[vitesse-webext] Hello world from content script");

  // communication example: send previous tab title from background page
  onMessage("tab-prev", ({ data }) => {
    console.log(`[vitesse-webext] Navigate from page "${data}"`);
  });

})();
