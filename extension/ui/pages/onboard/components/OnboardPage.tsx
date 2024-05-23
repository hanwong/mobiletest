import type { PropsWithChildren } from "react"
import { Box, Stack, Text, Title } from "@mantine/core"
import { ErrorBoundary } from "@initia/react-components"

interface Props {
  title: string
  subtitle?: string
}

const OnboardPage = ({ title, subtitle, children }: PropsWithChildren<Props>) => {
  return (
    <Box px={20}>
      <Stack spacing={12} mt={40}>
        <Title fz={28}>{title}</Title>

        {subtitle && (
          <Text c="mono.3" fz={14} fw={600}>
            {subtitle}
          </Text>
        )}
      </Stack>

      <Box py={28}>
        <ErrorBoundary>{children}</ErrorBoundary>
      </Box>
    </Box>
  )
}

export default OnboardPage
