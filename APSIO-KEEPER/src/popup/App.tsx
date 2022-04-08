import { Box, ChakraProvider } from "@chakra-ui/react";
import { Router } from "react-chrome-extension-router";
import { atom } from "jotai";
import { Home } from "./components/Home";
import { Login } from "./components/Login";
import browser, { Runtime } from 'webextension-polyfill';
import { ChoosePassword } from "./components/ChoosePassword";
import { UnlockApp } from "./components/UnlockApp";

export const password = atom<null | string>("o");

function App() {
  const encryptedSeed = localStorage.getItem("encryptedSeed");

  var back:Runtime.Port = browser.runtime.connect({ name: 'apsiokeeper_popup'});

  back.onMessage.addListener( (data) => {

    console.log("ma merde");

  });

  return (
    <ChakraProvider>
      {encryptedSeed ? (
        <Box h="full" bg="#d7d7d7c7">
          <Router>
            <UnlockApp />
            {/* <Home/> */}
          </Router>
        </Box>
      ) : (
        <Box h="full" bg="#d7d7d7c7">
          <Router>
            <ChoosePassword />
            {/* <Login/> */}
          </Router>
        </Box>
      )}
    </ChakraProvider>
  );
}

export default App;
