import { CopyIcon } from "@chakra-ui/icons";
import { Box, Flex, IconButton, Spinner, Text, Tooltip, useClipboard, useToast } from "@chakra-ui/react";
import { address as getAddressBySeed } from "@waves/ts-lib-crypto";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { password } from "~/popup/App";
import { brand } from "~/popup/theme/color";
import { UserData } from "~/popup/types";
import { getSeed } from "~/popup/utils";
import { Header } from "../Layout/Header";
import { getUserDatas, getUserBalance } from "./api";

export function Home() {
  const [data, setData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const passwd = useAtomValue(password)
  const toast = useToast()

  const [address, _] = useState(getAddressBySeed(getSeed(passwd!)!, parseInt(window.localStorage.getItem("net")!)))

  const { onCopy } = useClipboard(address);

  useEffect(() => {
    (async () => {
      if (isLoading) {
        const seed = getSeed(passwd!);
        if (seed) {

          // Name + FirstName
          const datas = await getUserDatas(address);
          let name = datas.find((data: any) => data.key == "nom");
          let firstName = datas.find((data: any) => data.key == "prenom");

          // Balance
          const { balance } = await getUserBalance(address);

          setIsLoading(false);
          setData({ balance: balance / 100000000, name: name ? name.value : "Inconnu", firstName: firstName ? firstName.value : "Inconnu", address: address })
        }
      }
    })()
  }, [data])
  return (
    <>
      <Header />
      <Flex h="calc(100vh - 50px)" justifyContent="center">

        {/* // Is loading user datas done*/}
        {!isLoading && data &&
          <Box w="90%">
            <Box
              textAlign="left"
              boxShadow="xl"
              rounded="lg"
              h="fit-content"
              p="10px"
              w="full"
              mt="10px"
              bg="white"
              mb="30px"
            >
              <Text color="#9b9b9b">
                {data.firstName + " " + data.name}
              </Text>
              <Text mt="10px">
                <Text as="span" fontWeight="bold">
                  {data.balance}
                </Text>{" "}
                APSIOCOIN
              </Text>
            </Box>
            <Box bg="white" h="74%" w="full" p="10px"
              rounded="lg" boxShadow="xl" textAlign="center"
            >
              <Text fontWeight="semibold" fontSize={18}>Addresse Publique</Text>
              <Flex h="40px" mt="5px" color="white" bg={brand} rounded="full" p="5px" alignItems="center" justifyContent="center">
                <Text>{data.address}</Text>
                <Tooltip label="Copier" placement="top" hasArrow>
                  <CopyIcon onClick={() => {
                    onCopy();
                    if (!toast.isActive("id-toast")) {

                      toast({
                        id: "id-toast",
                        title: 'Adresse copiée',
                        description: address,
                        status: 'success',
                        duration: 2000,
                        isClosable: true,
                      })
                    }
                  }} ml="7px" cursor="pointer" color="white" _hover={{
                    color: "gray.400"
                  }} />
                </Tooltip>
              </Flex>
              <Text color="gray">A partager pour recevoir des Apsio coins</Text>

            </Box>
          </Box>
        }

        {/* // Is loading user datas */}
        {isLoading && <Spinner mt="100px" color={brand} />}
      </Flex>
    </>
  );
}
