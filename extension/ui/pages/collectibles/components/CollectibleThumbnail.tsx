import { AspectRatio, BackgroundImage } from "@mantine/core"
import WithCollectibleTokenMetadata from "./WithCollectibleTokenMetadata"

interface Props {
  uri?: string
  size?: number
  selected?: boolean
  shadow?: boolean
}

const CollectibleThumbnail = ({ uri, size, selected, shadow }: Props) => {
  return (
    <WithCollectibleTokenMetadata uri={uri}>
      {(metadata) => (
        <AspectRatio ratio={1} w={size} h={size}>
          <BackgroundImage
            src={metadata?.image ?? ""}
            sx={{
              backgroundColor: "#3A3A3A",
              backgroundRepeat: "no-repeat",
              backgroundSize: "contain",
              borderRadius: 12,
              boxShadow: shadow ? "0px 5px 20px 0px rgba(0, 0, 0, 0.3)" : undefined,
              outline: selected ? "1px solid white" : undefined,
              outlineOffset: -1,
            }}
          />
        </AspectRatio>
      )}
    </WithCollectibleTokenMetadata>
  )
}

export default CollectibleThumbnail
