import { useEffect } from "react"
import { useHotkeys } from "@mantine/hooks"
import { useQueryClient } from "@tanstack/react-query"
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx"
import { ASSETS_URL } from "../../scripts/shared/constants"
import { request, useAddress, useInitialized, useLocked } from "../background"
import toast from "../styles/toast"
import useConfirm from "../pages/txs/helpers/useConfirm"

const password = import.meta.env.INITIA_PASSWORD
const sender = { url: "https://initia.xyz", favicon: `${ASSETS_URL}/INIT.svg` }

const Debug = () => {
  /* password */
  const initialized = useInitialized()
  useEffect(() => {
    if (initialized && password) request("unlock", password)
  }, [initialized])

  /* hotkeys */
  const locked = useLocked()
  const queryClient = useQueryClient()
  const address = useAddress()
  const confirm = useConfirm()

  const messages = [
    {
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: MsgSend.fromPartial({
        fromAddress: address,
        toAddress: address,
        amount: [{ denom: "uinit", amount: String(1e6) }],
      }),
    },
  ]

  useHotkeys([
    ["U", () => locked && request("unlock", window.prompt() ?? "")],
    ["L", () => !locked && request("lock")],
    ["P", () => queryClient.setQueryData(["background", "requestedPermission"], sender)],
    ["T", () => confirm({ messages })],
    ["N", () => (Math.random() > 0.5 ? toast.success("Successfully sent") : toast.error("Failed to send"))],
  ])

  return null
}

export default Debug
