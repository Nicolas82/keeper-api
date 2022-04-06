import { Header } from "./components/Layout/Header";
import { Box, ChakraProvider } from "@chakra-ui/react";
import { Router } from "react-chrome-extension-router";
import { ChoosePassword } from "./components/ChoosePassword";
import { atom } from "jotai";
import { UnlockApp } from "./components/UnlockApp";
import { Home } from "./components/Home";
import { Login } from "./components/Login";

export const password = atom<null | string>("o");

function App() {
  const encryptedSeed = localStorage.getItem("encryptedSeed");

  return (
    <ChakraProvider>
      <Header />
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
