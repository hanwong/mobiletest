import bcs from "../../initia/bcs"
import createHTTPClient from "../http"
import createInitiaMoveClient from "../move/Move"

export interface CollectionInfo {
  creator: string
  name: string
  description: string
  nfts: { handle: string; length: string }
  uri: string
}

export interface NFTTokenInfoMove {
  collection: { inner: string }
  description: string
  token_id: string
  uri: string
}

function createInitiaNftClient(
  rest: string,
  collectionAddress: string,
  type: "minimove" | "miniwasm" | "minievm" | "custom",
) {
  const moveClient = createInitiaMoveClient(rest)
  const restClient = createHTTPClient(rest)

  const moduleAddress = "0x1"
  const moduleName = "nft"

  async function getCollectionInfo() {
    return moveClient.resource<CollectionInfo>(collectionAddress, "0x1::collection::Collection")
  }

  async function getTokenInfo(tokenAddress: string) {
    switch (type) {
      case "minimove":
        return moveClient.view<NFTTokenInfoMove>({
          moduleAddress,
          moduleName,
          functionName: "nft_info",
          type_args: [],
          args: [bcs.address().serialize(tokenAddress).toBase64()],
        })

      case "miniwasm":
        const queryData = Buffer.from(JSON.stringify({ nft_info: { token_id: tokenAddress } })).toString("base64")
        const path = `/cosmwasm/wasm/v1/contract/${collectionAddress}/smart/${queryData}`
        const { data } = await restClient.get<{ data: { token_uri: string } }>(path)
        return { token_id: tokenAddress, uri: data.token_uri }

      default:
        throw new Error("Not supported NFT")
    }
  }

  return {
    rest,
    getCollectionInfo,
    getTokenInfo,
  }
}

export default createInitiaNftClient
