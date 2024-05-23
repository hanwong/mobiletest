import { forwardRef } from "react"
import type { UnstyledButtonProps } from "@mantine/core"
import { Group, UnstyledButton, createPolymorphicComponent } from "@mantine/core"

const TAB_BUTTON_HEIGHT = 28

interface TabButtonProps extends UnstyledButtonProps {
  isSelected?: boolean
}

const TabButton = createPolymorphicComponent<"button", TabButtonProps>(
  forwardRef<HTMLButtonElement, TabButtonProps>(({ isSelected, ...others }, ref) => {
    return (
      <UnstyledButton
        c={isSelected ? "mono.0" : "mono.3"}
        fz={18}
        fw={800}
        px={4}
        h={TAB_BUTTON_HEIGHT}
        sx={({ fn }) => ({
          borderBottom: `2px solid ${isSelected ? fn.themeColor("mono.0") : "transparent"}`,
          ...fn.hover({ color: fn.themeColor(isSelected ? "mono.0" : "mono.2") }),
        })}
        {...others}
        ref={ref}
      />
    )
  }),
)

interface Props {
  currentTab: string
  onSelect: (key: string) => void
}

const tabs = [
  { label: "Assets", key: "" },
  { label: "NFT", key: "NFT" },
  { label: "Activity", key: "Activity" },
]

const HomeInitiaTabs = ({ currentTab, onSelect }: Props) => {
  return (
    <Group spacing={20}>
      {tabs.map(({ label, key }) => (
        <TabButton isSelected={currentTab === key} onClick={() => onSelect(key)} key={key}>
          {label}
        </TabButton>
      ))}
    </Group>
  )
}

export default HomeInitiaTabs
