//@ts-ignore
import ObservableStore from 'obs-store';

export class WalletController{

    private store:ObservableStore;
    private static _instance:WalletController;

    constructor(){

        if(!WalletController._instance){
            const defaults = {
                //TODO: Enlever car c'est la seed de luc
                seed : "agree end glass enforce whisper measure clip table file pear daring undo tool leaf own",
            };
            this.store = new ObservableStore(defaults);
            WalletController._instance = this;
        }
        return WalletController._instance;
    }

    /**
     * 
     * @returns la seed de l'utilisateur en cours
     */
    getSeed():string{ return this.store.getState().seed }

    //Retourne l'instance du singleton
    getInstance(){

        return WalletController._instance;

    }

}