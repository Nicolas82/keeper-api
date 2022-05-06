import browser, { Runtime } from "webextension-polyfill";

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
 * @returns {boolean} vrai si la page doit être injecté, faux dans le cas échant
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

    //On ajoute le script à injecté dans la page courante
    scriptTag.setAttribute('async', 'false');
    scriptTag.src = browser.runtime.getURL('dist/inpage.js');
    container.insertBefore(scriptTag, container.children[0]);

    //On supprime le script d'initialisation de la page courante dès qu'il 
    // a fini de charger
    scriptTag.onload = () => {
      container.removeChild(scriptTag);
    }

  }catch(error){
    console.error("Erreur lors de la tentative d'injection. ", error);
  }
}


/**
 * Récupère la state publique du keeper si aucun compte n'est défini 
 * c'est une erreur sera retourné et il faudra utiliser la fonction authSSI
 * @param {Runtime.Port} background la connexion avec le background
 */
function _getPublicState(background: Runtime.Port){

  background.postMessage(JSON.stringify({messageType: 'publicState'}));

  // var data = {
  //   messageType: "publicState",
  //   account: {
  //     name : "foo",
  //     publicKey: "bar",
  //     address: "addr",
  //     networkCode: "network byte",
      
  //   },
  //   network : {
  //     code: "W",
  //     server: "https://testnet-nodes.wavesnode.com/"
  //   }
  // }

}

/**
 * Effectue une requête de connexion de type authSSI
 * @param {Runtime.Port} background la connexion avec le background
 */
function _useAuthSSI(background: Runtime.Port, data: Record<string, any>){

  background.postMessage(JSON.stringify({messageType: 'authSSI', url:data.url}));

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

  //Connection avec l'inpage 
  window.addEventListener("message", (event) => {

    var messageType:string = JSON.parse(event.data).messageType;
    var data:Object = JSON.parse(event.data);

    switch(messageType){

      case "authSSI":
        _useAuthSSI(port_background, data);
        break;

      case "publicState":
        _getPublicState(port_background);
        break;

      case "signAndPublishTransaction":
        _processTransaction(data, port_background);
        break;
    }

  });

  //Dès qu'on reçoit un message du background on le redirige
  port_background.onMessage.addListener(( data ) => {
    
    console.log(data);

    const event = new CustomEvent("apiResponse", {detail: data});

    window.dispatchEvent(event);

  });

}

// Firefox `browser.tabs.executeScript()` requires scripts return a primitive value
(() => {

  //Injection du script dans la page courante
  if(shouldInject()){
    injectScript();
    setupStreams();
  }

  // communication example: send previous tab title from background page
  // onMessage("tab-prev", ({ data }) => {
  //   console.log(`[vitesse-webext] Navigate from page "${data}"`);
  // });

})();
