import type { PropsWithChildren } from "react"
import { Box } from "@mantine/core"

const NavList = ({ children }: PropsWithChildren) => {
  return <Box mx={-20}>{children}</Box>
}

export default NavList
