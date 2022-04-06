import { AES, enc } from "crypto-js";

export function getSeed(password:string){
    const encrypted = window.localStorage.getItem("encryptedSeed");

    if(encrypted){
        return AES.decrypt(encrypted,password).toString(enc.Utf8);
    }
    return null;
}