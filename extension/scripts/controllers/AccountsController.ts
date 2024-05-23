import { insertAll } from "ramda"
import { createInitiaUsernamesClient, isUsernameValid } from "@initia/utils"
import type { Account } from "../types"
import getId from "../utils/getId"
import storage from "../storage"
import { defaultChain } from "../shared/chains"
import { selectedInitiaAddress } from "../data/subjects"

const STORAGE_KEY = { ADDRESS: "Address", ACCOUNTS: "Accounts" }

class AccountsController {
  #accounts: Account[] = []

  constructor() {
    this.init()
  }

  private async init() {
    this.#accounts = (await storage.get<Account[]>(STORAGE_KEY.ACCOUNTS)) ?? []
    selectedInitiaAddress.next((await storage.get<string>(STORAGE_KEY.ADDRESS)) ?? "")
  }

  get accounts() {
    return this.#accounts
  }

  get initiaAddress() {
    return selectedInitiaAddress.value
  }

  findAccount(initiaAddress: string) {
    return this.accounts.find((account) => account.initiaAddress === initiaAddress)
  }

  get account() {
    return this.findAccount(this.initiaAddress)
  }

  private async findUsername(address: string) {
    try {
      const { rest, modules } = defaultChain
      if (!modules.usernames) throw new Error("Usernames module not found")
      const usernames = createInitiaUsernamesClient(rest, modules.usernames)
      return await usernames.getUsername(address)
    } catch {
      return null
    }
  }

  async findName({ initiaAddress, ...account }: Account) {
    const candidates = insertAll(
      1,
      account.type === "privateKey" ? [account.payload?.email, account.payload?.name] : [],
      [await this.findUsername(initiaAddress), `Account ${this.accounts.length + 1}`],
    )

    for (const candidate of candidates) {
      if (candidate && !this.accounts.find(({ name }) => name === candidate)) {
        return candidate
      }
    }

    return getId()
  }

  async addAccount(account: Account) {
    // if address already exists, update the account
    this.#accounts = this.accounts.filter(({ initiaAddress }) => initiaAddress !== account.initiaAddress)
    this.#accounts.push({ ...account, name: await this.findName(account) })
    await storage.set(STORAGE_KEY.ACCOUNTS, this.accounts)
    this.selectAccount(account.initiaAddress)
  }

  async changeAccountName(address: string, name: string) {
    if (!name) throw new Error("Name is required")
    const nameLengthLimit = isUsernameValid(name) ? 64 + 5 : 16
    if (name.length > nameLengthLimit) throw new Error("Name is too long")
    if (this.accounts.some((account) => account.name === name)) throw new Error("Name already exists")
    const account = this.accounts.find((account) => account.initiaAddress === address)
    if (!account) return
    account.name = name
    await storage.set(STORAGE_KEY.ACCOUNTS, this.accounts)
  }

  async deleteAccount(address: string) {
    this.#accounts = this.accounts.filter((account) => account.initiaAddress !== address)
    await storage.set(STORAGE_KEY.ACCOUNTS, this.accounts)
    if (selectedInitiaAddress.value === address) this.selectAccount(this.accounts.at(0)?.initiaAddress ?? "")
  }

  async selectAccount(address: string) {
    selectedInitiaAddress.next(address)
    await storage.set(STORAGE_KEY.ADDRESS, address)
  }
}

export default AccountsController
