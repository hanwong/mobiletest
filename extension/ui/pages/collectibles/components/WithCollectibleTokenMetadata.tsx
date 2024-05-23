import type { ReactNode } from "react"
import type { CollectibleMetadata } from "../data/collectibles"
import { useCollectibleMetadata } from "../data/collectibles"

interface Props {
  uri?: string
  children: (metadata?: CollectibleMetadata) => ReactNode
}

const WithCollectibleTokenMetadata = ({ uri, children }: Props) => {
  const { data: metadata } = useCollectibleMetadata(uri)
  return children(metadata)
}

export default WithCollectibleTokenMetadata
