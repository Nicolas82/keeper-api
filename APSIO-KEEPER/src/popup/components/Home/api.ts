import axios from "axios";

export const API_URL = "https://nodes-testnet.wavesnodes.com";

export async function getUserDatas(address: string) {
    const { data } = await axios.get(API_URL + "/addresses/data/" + address);
    return data;
}

export async function getUserBalance(address: string) {
    const { data } = await axios.get(API_URL + "/addresses/balance/" + address);
    return data;
}