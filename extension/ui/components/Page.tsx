import type { PropsWithChildren, ReactNode } from "react"
import { Box, Group, Title } from "@mantine/core"
import { ErrorBoundary } from "@initia/react-components"
import NavigateBack from "./NavigateBack"

const Page = ({ title, children, action }: PropsWithChildren<{ title?: string; action?: ReactNode }>) => {
  return (
    <>
      <Group bg="mono.9" position="apart" pos="sticky" top={0} px={20} sx={{ zIndex: 1020 }}>
        <Group spacing={12}>
          <NavigateBack />
          {title && <Title fz={14}>{title}</Title>}
        </Group>

        {action}
      </Group>

      <Box px={20} py={28}>
        <ErrorBoundary>{children}</ErrorBoundary>
      </Box>
    </>
  )
}

export default Page
