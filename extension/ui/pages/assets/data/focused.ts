import { atom } from "recoil"

export const focusedState = atom<{ layer?: string; tokenKey?: string }>({
  key: "focused",
  default: { layer: undefined, tokenKey: undefined },
})
