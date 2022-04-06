import { LockIcon } from "@chakra-ui/icons";
import { Flex, IconButton, Image, Text, Tooltip } from "@chakra-ui/react";
import { useAtom } from "jotai";
import { goTo, } from "react-chrome-extension-router";
import { password } from "../../App";
import { brand } from "../../theme/color";
import { UnlockApp } from "../UnlockApp";

export function Header() {

  const [passwd,setPasswd] = useAtom(password);

  function handleLock(){
    setPasswd(null)
    goTo(UnlockApp)
  }

  return (
    <Flex
      h="50px"
      bg={brand}
      color="white"
      alignItems="center"
      justifyContent="center"
      position="relative"
    >
      <Image
        src="/logo.png"
        h="35px"
        w="35px"
        left="10px"
        rounded="full"
        position="absolute"
      />
      <Text fontWeight="bold">APSIO Keeper</Text>
      {localStorage.getItem("encryptedSeed") && passwd && (
        <Tooltip hasArrow label="Vérouiller">
          <IconButton
            aria-label="Lock extension"
            position="absolute"
            right="10px"
            size="sm"
            color={brand}
            onClick={handleLock}
            icon={<LockIcon h={5} w={5} />}
          />
        </Tooltip>
      )}
    </Flex>
  );
}
