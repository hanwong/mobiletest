import { forwardRef } from "react"
import type { TextProps } from "@mantine/core"
import { Text, createPolymorphicComponent } from "@mantine/core"
import WithCollectibleTokenMetadata from "./WithCollectibleTokenMetadata"

interface Props extends TextProps {
  uri?: string
  tokenId?: string
}

const _CollectibleName = forwardRef<HTMLDivElement, Props>(({ uri, tokenId, ...others }, ref) => {
  return (
    <Text {...others} ref={ref}>
      <WithCollectibleTokenMetadata uri={uri}>{(metadata) => metadata?.name ?? tokenId}</WithCollectibleTokenMetadata>
    </Text>
  )
})

const CollectibleName = createPolymorphicComponent<"div", Props>(_CollectibleName)

export default CollectibleName
