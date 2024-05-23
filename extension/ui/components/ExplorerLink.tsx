import type { HTMLAttributes, PropsWithChildren } from "react"
import { Anchor, Text } from "@mantine/core"
import type { Chain } from "@initia/initia-registry-types"
import { truncate } from "@initia/utils"
import { defaultChain } from "../../scripts/shared/chains"

interface Props extends HTMLAttributes<HTMLAnchorElement> {
  value: string
  block?: boolean
  tx?: boolean
  layer?: Chain
}

const ExplorerLink = ({ value, children, block, tx, layer, ...attrs }: PropsWithChildren<Props>) => {
  const chain = defaultChain
  if (!chain.explorer) return <Text sx={{ overflowWrap: "break-word" }}>{value}</Text>

  const getHref = () => {
    if (layer) {
      const path = tx ? "txs" : block ? "blocks" : "accounts"
      return new URL(`${layer.chain_id}/${path}/${value}`, chain.explorer)
    }

    const path = tx ? "tx" : block ? "block" : "address"
    return new URL(`${path}/${value}`, chain.explorer)
  }

  const href = getHref().toString()

  return (
    <Anchor {...attrs} href={href} target="_blank" rel="noreferrer">
      {children || (block ? value : truncate(value))}
    </Anchor>
  )
}

export default ExplorerLink
