import type { MantineTheme, UnstyledButtonProps } from "@mantine/core"
import { UnstyledButton, createPolymorphicComponent } from "@mantine/core"

function sx({ fn }: MantineTheme) {
  return {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",

    border: `1px solid ${fn.themeColor("mono.3")}`,
    borderRadius: 8,
    color: fn.themeColor("mono.3"),
    height: 28,
    width: 28,

    "&:hover": {
      borderColor: fn.themeColor("mono.0"),
      color: fn.themeColor("mono.0"),
    },
  }
}

const _IconButton = (props: UnstyledButtonProps) => {
  return <UnstyledButton type="button" sx={sx} {...props} />
}

const IconButton = createPolymorphicComponent<"button", UnstyledButtonProps>(_IconButton)

export default IconButton
