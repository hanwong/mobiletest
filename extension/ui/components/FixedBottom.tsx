import type { BoxProps } from "@mantine/core"
import { Box, Container, Global } from "@mantine/core"
import { type PropsWithChildren } from "react"
import { useElementSize } from "@mantine/hooks"

const FixedBottom = ({ children, ...others }: PropsWithChildren<BoxProps>) => {
  const { ref, height } = useElementSize()

  return (
    <Box
      pos="fixed"
      left="0"
      right="0"
      bottom="0"
      bg="mono.9"
      sx={({ fn }) => ({
        borderTop: `1px solid ${fn.themeColor("mono.8")}`,
        zIndex: 1020,
      })}
      {...others}
    >
      <Global styles={{ body: { paddingBottom: height } }} />
      <Container ref={ref}>
        <Box p={20}>{children}</Box>
      </Container>
    </Box>
  )
}

export default FixedBottom
