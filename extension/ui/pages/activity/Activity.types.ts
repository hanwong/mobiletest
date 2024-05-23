import type { Event } from "@cosmjs/stargate/build/events"

export interface TxItem {
  tx: Tx
  code: number
  events: Event[]
  txhash: string
  timestamp: Date
}

interface Tx {
  body: Body
}

interface Body {
  memo: string
  messages: Message[]
}

interface Message {
  "@type": string
  [key: string]: unknown
}
