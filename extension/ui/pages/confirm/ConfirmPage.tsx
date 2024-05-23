import type { PropsWithChildren } from "react"
import { Stack, Title } from "@mantine/core"
import { ErrorBoundary } from "@initia/react-components"

const ConfirmPage = ({ title, children }: PropsWithChildren<{ title: string }>) => {
  return (
    <Stack spacing={28} p={20} pt={40}>
      <Title fz={28} fw={700}>
        {title}
      </Title>

      <ErrorBoundary>{children}</ErrorBoundary>
    </Stack>
  )
}

export default ConfirmPage
