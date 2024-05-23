import type { ButtonProps } from "@mantine/core"
import { UnstyledButton, createPolymorphicComponent } from "@mantine/core"
import { forwardRef } from "react"

const _DashedButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  return (
    <UnstyledButton
      c="mono.4"
      fz={12}
      fw={600}
      px={20}
      h={54}
      sx={({ fn }) => ({
        border: `1px dashed ${fn.themeColor("mono.6")}`,
        borderRadius: 20,
        display: "flex",
        alignItems: "center",
      })}
      {...props}
      ref={ref}
    />
  )
})

const DashedButton = createPolymorphicComponent<"button", ButtonProps>(_DashedButton)

export default DashedButton
