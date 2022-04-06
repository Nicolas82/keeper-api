import {
  Input,
  Text,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
} from "@chakra-ui/react";
import { useState } from "react";
import { password } from "../../App";
import { brand } from "../../theme/color";
import { useSetAtom } from "jotai";
import { goTo } from "react-chrome-extension-router";
import { Login } from "../Login";

export function ChoosePassword() {
  const [passwd1, setPasswd1] = useState("");
  const [passwd2, setPasswd2] = useState("");
  const setPasswd = useSetAtom(password);

  function handleClick() {
    setPasswd(passwd1);
    goTo(Login)
  }

  const isError = passwd1 != passwd2;

  return (
    <FormControl isInvalid={isError}>
      <Flex h="full" ml="10px" mr="10px" flexDir="column">
        <Text pt="50px">Choisir un mot de passe</Text>
        <Input
          type="password"
          mt="5px"
          value={passwd1}
          bg="white"
          color={brand}
          onChange={(e) => setPasswd1(e.currentTarget.value)}
        />

        <Text pt="20px">Vérifier le mot de passe</Text>
        <Input
          type="password"
          mt="5px"
          value={passwd2}
          bg="white"
          color={brand}
          onChange={(e) => setPasswd2(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key == "Enter") {
              handleClick();
            }
          }}
        />
        {isError && (
          <FormErrorMessage>
            Les mots de passe doivent être identiques
          </FormErrorMessage>
        )}
        <Button
          bg={brand}
          color="white"
          mt="20px"
          type="submit"
          onClick={handleClick}
        >
          Valider
        </Button>
      </Flex>
    </FormControl>
  );
}
