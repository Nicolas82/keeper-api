import {
  Box,
  Button,
  Flex,
  Select,
  Switch,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { ChangeEvent, useEffect, useState } from "react";
import { brand } from "../../theme/color";
import {
  address as addressCrpto,
  randomSeed,
  publicKey,
  MAIN_NET_CHAIN_ID,
  TEST_NET_CHAIN_ID,
  sharedKey,
  messageDecrypt,
  privateKey,
} from "@waves/ts-lib-crypto";
import { AES } from "crypto-js";
import { password } from "../../App";
import { useAtomValue } from "jotai";
import { goTo } from "react-chrome-extension-router";
import { Home } from "../Home";
import QRCode from "react-qr-code";
import axios from "axios";
import { Header } from "../Layout/Header";

export function Login() {
  const passwd = useAtomValue(password);
  const [seed, setSeed] = useState(
    /*"agree end glass enforce whisper measure clip table file pear daring undo tool leaf own"*/
    ""
  );
  const [qrcodeData, setQrcodeData] = useState("");

  // Address find thanks seed
  const [address, setAddress] = useState("...");

  // Net choosen in select
  const [net, setNet] = useState(TEST_NET_CHAIN_ID);

  // Connection with qr code or textarea
  const [isQrCode, setIsQrCode] = useState(true);

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    const value = event.currentTarget.value;
    setSeed(value);

    changeAdress(value.trim());
  }

  function changeAdress(value: string, netParam?: number) {
    if (value.split(" ").length >= 5) {
      setAddress(addressCrpto(value, netParam ?? net));
    } else {
      setAddress("...");
    }
  }

  function handleSaveSeed() {
    const encryptedSeed = AES.encrypt(seed, passwd!).toString();
    window.localStorage.setItem("encryptedSeed", encryptedSeed);
    window.localStorage.setItem("net", net.toString());
    goTo(Home);
  }

  useEffect(() => {
      const seed = randomSeed();
      const key = publicKey(seed);
      const url = "https://3000-nicolas82-sitecourswaves-xu264v449r6.ws-eu38.gitpod.io/api/encrypted/" + key;

      const data = { url: url, publicKey: key };

      window.localStorage.setItem("publicKey", key);
      window.localStorage.setItem("randomSeed", seed);

      waitingData(url);
      setQrcodeData(JSON.stringify(data))
  }, [])

  async function waitingData(url: string) {
    var decrypted: string | null = null;

    while (decrypted == null) {
      if (isQrCode) {
        axios
          .get(url)
          .then((result: any) => {
            //console.log(result)
            const { data } = result;

            const sharedKeyB = sharedKey(
              privateKey(window.localStorage.getItem("randomSeed")!),
              data.publicKey,
              "apsiocoin"
            );
            decrypted = messageDecrypt(sharedKeyB, JSON.parse(data.encrypted));
          })
          .catch((err) => {
            //console.log(err);
          });
      }
      if (!decrypted) {

        await new Promise((r) => setTimeout(r, 500));
      }
    }
    setSeed(decrypted)

    const encryptedSeed = AES.encrypt(decrypted, passwd!).toString();
    window.localStorage.setItem("encryptedSeed", encryptedSeed);
    window.localStorage.setItem("net", net.toString());
    goTo(Home);
  }

  return (
    <>
      <Header />
      <Flex
        flexDir="column"
        justifyContent="center"
        textAlign="center"
        ml="10px"
        mr="10px"
      >
        <Text pt="10px" fontWeight="bold">
          Connexion
        </Text>

        <Flex alignItems="center" mt="20px" mb="10px">
          <Switch
            isChecked={isQrCode}
            onChange={(e) => {
              setIsQrCode(e.currentTarget.checked);
            }}
          />
          <Text ml="8px">{isQrCode ? "QR Code" : "Seed"}</Text>
        </Flex>

        {/* // Print qr code */}
        {!isQrCode && (
          <>
            <Textarea
              placeholder="Entrez votre clé privée"
              resize="none"
              p="10px"
              value={seed}
              bg="white"
              color={brand}
              onChange={handleChange}
            />
          </>
        )}

        {/* // Print text area */}
        {isQrCode && (
          <Flex alignItems="center" flexDir="column" mx="auto">
            <Text mb="10px" textAlign="center">
              Flashez à l'aide de <Text as="em">Mobile Keeper</Text>
            </Text>
            <QRCode value={qrcodeData} size={150} />
          </Flex>
        )}

        <Text mt="20px" mb="5px">
          Adresse
        </Text>
        <Box border="1px solid" borderColor="gray.400" bg="white" rounded="md">
          <Text color="gray.500">{address}</Text>
        </Box>
        <Button
          mt="20px"
          bg={brand}
          color="white"
          onClick={handleSaveSeed}
          isDisabled={address == "..."}
        >
          Enregistrer
        </Button>
        <Box h="50px" position="fixed" bottom={0}>
          <Select
            bg="white"
            color={brand}
            onChange={(e) => {
              const newNet = parseInt(e.currentTarget.value);
              setNet(newNet);
              changeAdress(seed.trim(), newNet);
            }}
          >
            <option value={TEST_NET_CHAIN_ID}>Testnet</option>
            <option value={MAIN_NET_CHAIN_ID}>Mainnet</option>
          </Select>
        </Box>
      </Flex>
    </>
  );
}
