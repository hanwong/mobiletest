import type { Sx } from "@mantine/core"
import { Box } from "@mantine/core"
import { Image } from "@mantine/core"

interface Props {
  image?: string
  size: number
}

const TokenLogo = ({ image, size }: Props) => {
  const attrs = { width: "auto", height: size }
  const placeholder = <Box bg="mono.7" sx={{ ...attrs, borderRadius: 3 }} />

  const render = (image: string, sx?: Sx) => {
    return <Image {...attrs} src={image} sx={sx} placeholder={placeholder} />
  }

  if (image) return render(image)
  return placeholder
}

export default TokenLogo
