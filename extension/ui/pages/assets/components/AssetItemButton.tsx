import { forwardRef, useCallback } from "react"
import { useRecoilState } from "recoil"
import type { Sx, UnstyledButtonProps } from "@mantine/core"
import { UnstyledButton, createPolymorphicComponent, packSx } from "@mantine/core"
import type { Chain } from "@initia/initia-registry-types"
import type { BaseAssetInfo } from "../../../data/tokens"
import { focusedState } from "../data/focused"
import AssetItem from "./AssetItem"

interface Props extends UnstyledButtonProps {
  asset: BaseAssetInfo
  layer?: Chain
  tokenKey: string
  isFetching: boolean
  search?: Record<string, string>
}

const _AssetItemButton = forwardRef<HTMLButtonElement, Props>(
  ({ asset, tokenKey, layer, search, isFetching, sx, ...others }, ref) => {
    const [focused, setFocused] = useRecoilState(focusedState)
    const reset = useCallback(() => setFocused({}), [setFocused])
    const isFocused = layer?.chain_id === focused.layer && tokenKey === focused.tokenKey

    const toggle = () => {
      if (isFocused) {
        reset()
        return
      }

      setFocused({ layer: layer?.chain_id, tokenKey })
    }

    const backgroundColor = isFocused ? "mono.7" : "mono.8"
    const backgroundColorHover = "mono.7"
    const borderColor = isFocused ? "mono.0" : backgroundColor
    const borderColorHover = isFocused ? "mono.0" : backgroundColorHover

    return (
      <UnstyledButton
        onClick={toggle}
        sx={packSx([
          ({ fn }) => ({
            background: fn.themeColor(backgroundColor),
            border: `1px solid ${fn.themeColor(borderColor)}`,
            ...fn.hover({
              background: fn.themeColor(backgroundColorHover),
              borderColor: fn.themeColor(borderColorHover),
            }),
          }),
          sx,
        ] as Sx[])}
        {...others}
        ref={ref}
      >
        <AssetItem {...asset} search={search} isFocused={isFocused} />
      </UnstyledButton>
    )
  },
)

const AssetItemButton = createPolymorphicComponent<"button", Props>(_AssetItemButton)

export default AssetItemButton
