setupInpageApi().catch(e => console.error(e));


function defer() {
    var res, rej;

    var promise = new Promise((resolve, reject) => {

        res = resolve;
        rej = reject;
    });

    //@ts-ignore
    promise.resolve = res;
    //@ts-ignore
    promise.reject = rej;

    return promise;
}


window.addEventListener("apiResponse", (e) => {

    //@ts-ignore
    var data = e.detail;
    switch (data.messageType) {
        case "publicState":
            (window as Record<string, any>)._apsioKeeper_publicState.resolve(data.response);
            break;
        case "authSSI":
            (window as Record<string, any>)._apsioKeeper_authSSI.resolve(data.response);
            break;
        case "signAndPublishTransaction":
            (window as Record<string, any>)._apsioKeeper_spTransaction.resolve(data.response);
            break;
    }
});

/**
 * Initialize l'api de l'Apsio Keeper dans la page web courante
 */
async function setupInpageApi() {

    (window as Record<string, any>).ApsioKeeper = {
        authSSI: async () => {

            (window as Record<string, any>)._apsioKeeper_authSSI = defer();

            const data = { messageType: "authSSI" };
            window.postMessage(JSON.stringify(data), "*");

            return (window as Record<string, any>)._apsioKeeper_authSSI;

        },
        signAndPublishTransaction: async (data: Object) => {

            (window as Record<string, any>)._apsioKeeper_spTransaction = defer();

            var finalData = {
                messageType: "signAndPublishTransaction",
                txData: data
            }
            window.postMessage(JSON.stringify(finalData), "*");

            return (window as Record<string, any>)._apsioKeeper_spTransaction;

        },
        publicState: async () => {

            (window as Record<string, any>)._apsioKeeper_publicState = defer();

            const data = { messageType: "publicState" };
            window.postMessage(JSON.stringify(data), "*");

            return (window as Record<string, any>)._apsioKeeper_publicState;
        },
    };

}