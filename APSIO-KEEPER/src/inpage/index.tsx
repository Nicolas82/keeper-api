
import LocalMessageDuplexStream from 'post-message-stream';
import { setupDnode, transformMethods, cbToPromise } from '../lib/dnode-util';
import EventEmitter from 'events';


const createDeffer = () => {
    const def = Object();
    def.promise = new Promise((res, rej) => {
        def.resolve = res;
        def.reject = rej;
    });

    return def;
}

setupInpageApi().catch(e => console.error(e));

/**
 * Initialize l'api de l'Apsio Keeper dans la page web courante
 */
async function setupInpageApi(){

    let cbs = Object();
    let args = Object();
    const apsioAppDef = createDeffer();
    const apsioApp = {};
    let apsioApi = Object({
        initialPromise: apsioAppDef.promise,
    });

    const proxyApi:ProxyHandler<any> = {
        get(target:any, prop:string){
            if(apsioApi[prop]){
                return apsioApi[prop];
            }

            if(!cbs[prop] && prop !== 'on'){
                cbs[prop] = function (...args) {
                    const def = createDeffer();
                    args[prop] = args[prop] || [];
                    args[prop].push({ args, def });
                    return def.promise;
                };
            }

            if(!cbs[prop] && prop === 'on'){
                cbs[prop] = function (...args){
                    args[prop] = args[prop] || [];
                    args[prop].push({ args });
                };
            }

            return cbs[prop];
        },

        set(target:any, prop:any){
            throw new Error('Not permitted');
        },

        has() {
            return true;
        }
    };

    (window as Record<string, any>).ApsioKeeper = new Proxy(apsioApp, proxyApi);
    
    const apsioKeeperStream = new LocalMessageDuplexStream({
        name: 'apsio_keeper_page',
        target: 'apsio_keeper_content',
    });

    const eventEmitter = new EventEmitter();
    const emitterApi = {
        sendUpdate: async (state: any) => eventEmitter.emit('update', state),
    }

    const dnode = setupDnode(apsioKeeperStream, emitterApi, 'inpageApi');

    const inpageApi = await new Promise(resolve => {
        dnode.once('remote', (inpageApi: any) => {
            let remoteWithPromises = transformMethods(cbToPromise, inpageApi);
            // Zjout de l'événement sur l'objet background
            remoteWithPromises.on = eventEmitter.on.bind(eventEmitter);
            resolve(remoteWithPromises);
        });
    });

    args = [];
    cbs = Object();
    Object.assign(apsioApi, inpageApi);
    apsioAppDef.resolve(apsioApi);
    (window as Record<string, any>).ApsioKeeper = apsioApi;

}