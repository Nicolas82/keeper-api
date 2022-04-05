setupInpageApi().catch(e => console.error(e));


/**
 * Initialize l'api de l'Apsio Keeper dans la page web courante
 */
async function setupInpageApi(){


    (window as Record<string, any>).ApsioKeeper = {
        authSSI: async () => {

            const data = { messageType: "authSSI" };
            window.postMessage(JSON.stringify(data), "*");

        },
        signAndPublishTransaction: async (data: Record<string, any>) => {

            data.messageType = "transaction";
            data.publish = true;
            window.postMessage(JSON.stringify(data), "*");
            
        },
        publicState: async () => {

            const data = { messageType: "publicState" };
            window.postMessage(JSON.stringify(data), "*");
        }
    };

}