import type { PropsWithChildren } from "react"
import type { To } from "react-router-dom"
import { Link } from "react-router-dom"
import { Button, Group, Image, Text } from "@mantine/core"

interface Props {
  to: To
  logo?: string
}

const OnboardButton = ({ to, logo, children }: PropsWithChildren<Props>) => {
  return (
    <Button variant="secondary" component={Link} to={to}>
      <Group spacing={6}>
        {logo && <Image src={logo} width={20} height={20} />}
        <Text fz={14} fw={700}>
          {children}
        </Text>
      </Group>
    </Button>
  )
}

export default OnboardButton
