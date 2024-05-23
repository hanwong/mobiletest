import type { PropsWithChildren } from "react"
import type { BoxProps } from "@mantine/core"
import { Box, createPolymorphicComponent } from "@mantine/core"

const Empty = createPolymorphicComponent<"div", BoxProps>(({ children }: PropsWithChildren) => {
  return (
    <Box c="mono.5" fz={14} fw={600} py={20} ta="center">
      {children}
    </Box>
  )
})

export default Empty
