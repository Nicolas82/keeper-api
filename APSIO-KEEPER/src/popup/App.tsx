import { Box, ChakraProvider } from "@chakra-ui/react";
import { Router } from "react-chrome-extension-router";
import { atom } from "jotai";
import { Home } from "./components/Home";
import { Login } from "./components/Login";
import browser, { Runtime } from 'webextension-polyfill';

export const password = atom<null | string>("o");

function App() {
  const encryptedSeed = localStorage.getItem("encryptedSeed");

  return (
    <ChakraProvider>
      {encryptedSeed ? (
        <Box h="calc(100vh - 50px)" bg="#d7d7d7c7">
          <Router>
            {/* <UnlockApp /> */}
            <Home/>
          </Router>
        </Box>
      ) : (
        <Box h="calc(100vh - 50px)" bg="#d7d7d7c7">
          <Router>
            {/* <ChoosePassword /> */}
            <Login/>
          </Router>
        </Box>
      )}
    </ChakraProvider>
  );
}

export default App;
