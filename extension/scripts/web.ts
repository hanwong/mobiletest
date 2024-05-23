import type { BehaviorSubject } from "rxjs"
import { EVENT } from "./shared/constants"
import { selectedInitiaAddress, locked } from "./data/subjects"

function subscribe<T>(name: string, subject: BehaviorSubject<T>) {
  subject.subscribe(() => {
    window.dispatchEvent(new Event(name))
  })
}

subscribe(EVENT.LOCKED, locked)
subscribe(EVENT.ADDRESS, selectedInitiaAddress)

export { default as request } from "./handlers/internal"
