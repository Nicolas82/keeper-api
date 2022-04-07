import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  Input,
  Text,
} from "@chakra-ui/react";
import { AES, enc } from "crypto-js";
import { useSetAtom } from "jotai";
import { useState } from "react";
import { goTo } from "react-chrome-extension-router";
import { password } from "../../App";
import { brand } from "../../theme/color";
import { Home } from "../Home";
import { Header } from "../Layout/Header";

export function UnlockApp() {
  const [passwd, setPasswd] = useState("");
  const [isError, setIsError] = useState(false);
  const setPasswdSaved = useSetAtom(password);

  function handleClick() {
    //goTo(Home);

    const encryptedSeed = localStorage.getItem("encryptedSeed")!;

    try {
      const seed = AES.decrypt(encryptedSeed, passwd).toString(enc.Utf8);
      if (seed == "") {
        setIsError(true);
      } else {
        setIsError(false);
        setPasswdSaved(passwd);
        goTo(Home);
      }
    } catch (err) {
      setIsError(true);
    }
  }
  return (
    <>
      <Header />
      <Flex flexDir="column" textAlign="center" mx="10px">
        <FormControl isInvalid={isError}>
          <Text mt="60px" mb="10px" fontWeight="semibold">
            Déverouillez l'application
          </Text>
          <Input
            type="password"
            mt="5px"
            value={passwd}
            bg="white"
            color={brand}
            onChange={(e) => setPasswd(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key == "Enter") {
                handleClick();
              }
            }}
          />
          {isError && <FormErrorMessage>Mauvais mot de passe</FormErrorMessage>}
          <Button
            w="full"
            mt="30px"
            bg={brand}
            color="white"
            type="submit"
            onClick={handleClick}
          >
            Valider
          </Button>
        </FormControl>
      </Flex>
    </>
  );
}
