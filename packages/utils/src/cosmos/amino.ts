import type { AminoConverter, AminoConverters } from "@cosmjs/stargate"
import { AminoTypes, createDefaultAminoConverters } from "@cosmjs/stargate"
import { Msg } from "@initia/initia.js"
import { createRegistry } from "./proto"
import messages from "./messages"

function createInitiaAminoConverters(): AminoConverters {
  const registry = createRegistry()

  return Object.fromEntries(
    Object.entries(messages)
      .filter(([, { aminoType }]) => aminoType)
      .map(([typeUrl, { aminoType }]) => {
        const aminoConverter: AminoConverter = {
          aminoType: aminoType!,
          toAmino: (value) => Msg.fromProto(registry.encodeAsAny({ typeUrl, value })).toAmino().value,
          fromAmino: (value) => Msg.fromAmino({ type: aminoType, value } as Msg.Amino).toProto(),
        }

        return [typeUrl, aminoConverter]
      }),
  )
}

export function createAminoConverters(): AminoConverters {
  return { ...createDefaultAminoConverters(), ...createInitiaAminoConverters() }
}

export function createAminoTypes(): AminoTypes {
  return new AminoTypes(createAminoConverters())
}
