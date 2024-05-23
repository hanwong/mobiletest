import { TxBody } from "cosmjs-types/cosmos/tx/v1beta1/tx"
import { createRegistry } from "@initia/utils"

const registry = createRegistry()

/**
 * Decodes a transaction body from a Uint8Array and returns an object with decoded messages and memo.
 * The messages are further decoded using the registry to convert the Uint8Array values to their respective types.
 * This function is used for simulation, broadcasting, and rendering from the user interface.
 * @param txBody - The transaction body in Uint8Array format to be decoded.
 * @returns An object with decoded messages and memo.
 */
export const decodeTxBody = (txBody: Uint8Array) => {
  const { memo, ...decoded } = TxBody.decode(txBody)
  const messages = decoded.messages.map((message) => ({ ...message, value: registry.decode(message) }))
  return { messages, memo }
}

export default registry
