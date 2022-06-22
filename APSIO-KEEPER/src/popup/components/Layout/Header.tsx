import { LockIcon } from "@chakra-ui/icons";
import { Flex, IconButton, Image, Text, Tooltip } from "@chakra-ui/react";
import { useAtom } from "jotai";
import { goTo, } from "react-chrome-extension-router";
import { password } from "../../App";
import { brand } from "../../theme/color";
import { ChoosePassword } from "../ChoosePassword";
import { Login } from "../Login";
import { UnlockApp } from "../UnlockApp";

export function Header() {

  const [passwd, setPasswd] = useAtom(password);

  //Connection with the background
  const background = browser.runtime.connect( {name: 'apsiokeeper_header'} );

  function handleLock() {
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
      {localStorage.getItem("encryptedSeed") && passwd && (
        <Tooltip hasArrow label="Déconnexion">
          <IconButton
            aria-label="Log out"
            position="absolute"
            right="10px"
            size="sm"
            color={brand}
            onClick={() => {
              localStorage.removeItem("encryptedSeed");
              background.postMessage(JSON.stringify({
                func: 'removeSeed',
                params: {}
              }));
              setPasswd(null);
              goTo(Login);
            }}
            icon={ <Image
              src="/sign-out.png"
              h={6}
              w={6}
            />}
          />
         
        </Tooltip>)
      }

      <Text fontWeight="bold">APSIO Keeper</Text>
      {localStorage.getItem("encryptedSeed") && passwd && (
        <Tooltip hasArrow label="Vérouiller">
          <IconButton
            aria-label="Lock extension"
            position="absolute"
            left="10px"
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
