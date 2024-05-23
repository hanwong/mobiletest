# @initia/react-wallet-widget

## Getting started

Install dependencies:

```bash
pnpm add @initia/react-wallet-widget
```

Wrap your application with `WalletWidgetProvider`:

```tsx
import { WalletWidgetProvider, initWalletWidget } from "@initia/react-wallet-widget"
import { ChainSchema } from "@initia/initia-registry-types/zod"

// For projects built on the Initia Layer 1
const { data: layer } = await axios.get("https://omni-api.initiation-1.initia.xyz/v1/registry/chains/layer1")

// For Minitia L2s that are registered on the [Initia Registry](https://github.com/initia-labs/initia-registry)
const { data: layer } = await axios.get("https://omni-api.initiation-1.initia.xyz/v1/registry/chains/CHAIN_ID")

// For Minitia L2s that are NOT yet registered on the [Initia Registry](https://github.com/initia-labs/initia-registry)
const { data: layer } = await axios.get("chain.json url")

// For manually registering your L2
const layer = ChainSchema.parse({
  chain_id: "initiation-1",
  chain_name: "initia",
  apis: {
    rpc: [{ address: "https://rpc.initiation-1.initia.xyz" }],
    rest: [{ address: "https://lcd.initiation-1.initia.xyz" }],
    api: [{ address: "https://api.initiation-1.initia.xyz" }],
  },
  fees: {
    fee_tokens: [{ denom: "uinit", fixed_min_gas_price: 0.15 }],
  },
  bech32_prefix: "init",
})

const initiaWalletWidget = initWalletWidget({ layer })

render(
  <WalletWidgetProvider widget={initiaWalletWidget}>
    <App />
  </WalletWidgetProvider>,
)
```

## Interface

```ts
interface ReactWalletWidget {
  /** Current wallet address. */
  address: string

  /** Current connected wallet. */
  wallet: Wallet

  /** Loading state: true on auto-reconnect at start, then false. */
  isLoading: boolean

  /** Opens a modal for wallet connection (e.g., Keplr, Metamask). */
  onboard(): void

  /** Shows a popover for the connected wallet to manage assets. */
  view(event: React.MouseEvent): void

  /** Disconnects the wallet. */
  disconnect(): Promise<void>

  /** Signs arbitrary data with the wallet. Returns the signature. */
  signArbitrary(data: string | Uint8Array): Promise<string>

  /** Checks the signature against the data. Returns true if valid. */
  verifyArbitrary(data: string | Uint8Array, signature: string): Promise<boolean>

  /** Signs and broadcasts a transaction. Returns transaction hash. */
  requestTx(
    txBodyValue: { messages: { typeUrl: string; value: Record<string, any> }[]; memo?: string },
    gas?: number,
  ): Promise<string>

  /** Signs and broadcasts a transaction using the @initia/initia.js library. Returns transaction hash. */
  requestInitiaTx(tx: { msgs: Msg[]; memo?: string }, gas?: number): Promise<string>
}
```

## Simple example

```tsx
import { useAddress, useWallet } from "@initia/react-wallet-widget"
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx"

const App = () => {
  const address = useAddress()
  const { onboard, view, requestTx } = useWallet()

  if (address) {
    const send = async () => {
      const messages = [
        {
          typeUrl: "/cosmos.bank.v1beta1.MsgSend",
          value: MsgSend.fromPartial({
            fromAddress: address,
            toAddress: address,
            amount: [{ amount: "1000000", denom: "uinit" }],
          }),
        },
      ]

      const transactionHash = await requestTx({ messages })
      console.log(transactionHash)
    }

    return (
      <>
        <button onClick={view}>{address}</button>
        <button onClick={send}>Send</button>
      </>
    )
  }

  return <button onClick={onboard}>Connect</button>
}
```

## Simple example using [@initia/initia.js](https://www.npmjs.com/package/@initia/initia.js)

```tsx
import { useAddress, useWallet } from "@initia/react-wallet-widget"
import { MsgSend } from "@initia/initia.js"

const App = () => {
  const address = useAddress()
  const { onboard, view, requestTx } = useWallet()

  if (address) {
    const send = async () => {
      const msgs = [
        MsgSend.fromProto({
          fromAddress: address,
          toAddress: address,
          amount: [{ amount: "1000000", denom: "uinit" }],
        }),
      ]

      // or
      const msgs = [new MsgSend(address, recipientAddress, { [denom]: toAmount(amount) })]
      const transactionHash = await requestInitiaTx({ msgs, memo })
      console.log(transactionHash)
    }

    return (
      <>
        <button onClick={view}>{address}</button>
        <button onClick={send}>Send</button>
      </>
    )
  }

  return <button onClick={onboard}>Connect</button>
}
```

## Usage in non-React projects

If you are not using React but wish to use the Wallet Widget in your project, you can leverage the core functionality by installing [@initia/wallet-widget](https://www.npmjs.com/package/@initia/wallet-widget). To install:

```bash
pnpm add @initia/wallet-widget
```
