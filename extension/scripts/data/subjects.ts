import { BehaviorSubject } from "rxjs"

export const locked = new BehaviorSubject(true)
export const selectedInitiaAddress = new BehaviorSubject<string>("")
