import type { UnstyledButtonProps } from "@mantine/core"
import { createPolymorphicComponent, UnstyledButton } from "@mantine/core"

const _TextButton = (other: UnstyledButtonProps) => {
  return (
    <UnstyledButton
      {...other}
      sx={({ fn }) => ({
        fontSize: 12,
        fontWeight: 600,
        "&:hover": { color: fn.themeColor("mono.0") },
      })}
    />
  )
}

const TextButton = createPolymorphicComponent<"button", UnstyledButtonProps>(_TextButton)

export default TextButton
