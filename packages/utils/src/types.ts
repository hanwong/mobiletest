import z from "zod"

export const EncodeObjectSchema = z.object({
  typeUrl: z.string(),
  value: z.record(z.any()),
})

export const TxBodyValueSchema = z.object({
  messages: z.array(EncodeObjectSchema),
  memo: z.string().optional(),
})

export type EncodeObject = z.infer<typeof EncodeObjectSchema>
export type TxBodyValue = z.infer<typeof TxBodyValueSchema>

export const CoinSchema = z.object({
  amount: z.string(),
  denom: z.string(),
})

export class TimeoutError extends Error {
  transactionHash: string

  constructor(transactionHash: string) {
    super("Pending transaction. Check your transaction in the explorer.")
    this.name = "TimeoutError"
    this.transactionHash = transactionHash
  }
}
