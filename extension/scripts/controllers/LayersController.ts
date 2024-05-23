import { createHTTPClient } from "@initia/utils"
import type { Chain } from "@initia/initia-registry-types"
import { ChainSchema } from "@initia/initia-registry-types/zod"
import type { Sender } from "../types"
import storage from "../storage"
import { closePopup, openPopup } from "../utils/popup"
import { defaultChain } from "../shared/chains"

const STORAGE_KEY = { CHAIN_IDS: "ChainIds", CUSTOM_LAYERS: "CustomLayers" }

interface Requested {
  layer: Chain
  sender: Sender
  approve: () => Promise<void>
  reject: () => Promise<void>
}

class LayersController {
  #requested: Requested | undefined
  #registeredLayers: Chain[] = []
  #customLayers: Chain[] = []

  constructor() {
    this.init()
  }

  private async fetchChains(chainIds: string[]) {
    try {
      if (chainIds.length === 0) return []
      const omnitiaClient = createHTTPClient(defaultChain.omnitia)
      return omnitiaClient.get<Chain[]>("/v1/registry/chains", { chain_ids: chainIds })
    } catch (error) {
      return []
    }
  }

  private async fetchChain(chainId: string) {
    try {
      const omnitiaClient = createHTTPClient(defaultChain.omnitia)
      const layer = omnitiaClient.get<Chain>(`/v1/registry/chains/${chainId}`)
      return ChainSchema.parse(layer)
    } catch (error) {
      return null
    }
  }

  public async init() {
    const omnitiaClient = createHTTPClient(defaultChain.omnitia)
    const layer1 = await omnitiaClient.get("/v1/registry/chains/layer1")

    const storedChainIds = (await storage.get<string[]>(STORAGE_KEY.CHAIN_IDS)) || []
    const storedRegisteredLayers = await this.fetchChains(storedChainIds)
    this.#registeredLayers = [layer1, ...storedRegisteredLayers]

    const storedCustomLayers = (await storage.get<Chain[]>(STORAGE_KEY.CUSTOM_LAYERS)) || []
    this.#customLayers = storedCustomLayers

    return this.layers
  }

  get layers() {
    return [...this.#registeredLayers, ...this.#customLayers]
  }

  get registeredLayers() {
    return this.#registeredLayers
  }

  get customLayers() {
    return this.#customLayers
  }

  get requested() {
    if (!this.#requested) return undefined
    const { approve, reject, ...rest } = this.#requested
    return rest
  }

  findLayer(chainId?: string | null) {
    if (!chainId) return undefined
    return this.layers.find((layer) => layer.chain_id === chainId)
  }

  private async storeChainIds() {
    await storage.set(
      STORAGE_KEY.CHAIN_IDS,
      this.#registeredLayers.slice(1).map((layer) => layer.chain_id),
    )
  }

  private async storeCustomLayers() {
    await storage.set(STORAGE_KEY.CUSTOM_LAYERS, this.#customLayers)
  }

  async addLayer(layer: Chain) {
    if (this.findLayer(layer.chain_id)) return
    this.#registeredLayers.push(layer)
    await this.storeChainIds()
  }

  async addCustomLayer(layer: Chain) {
    if (this.findLayer(layer.chain_id)) return
    this.#customLayers.push(layer)
    await this.storeCustomLayers()
  }

  async deleteLayer(chainId: string) {
    this.#registeredLayers = this.#registeredLayers.filter((layer) => layer.chain_id !== chainId)
    this.#customLayers = this.#customLayers.filter((layer) => layer.chain_id !== chainId)
    await this.storeChainIds()
    await this.storeCustomLayers()
  }

  request(requestedLayer: Chain, sender: Sender) {
    return new Promise<void>(async (resolve, reject) => {
      if (this.findLayer(requestedLayer.chain_id)) {
        resolve()
        return
      }

      if (requestedLayer.metadata?.is_l1) {
        throw new Error("Layer 1 already exists")
      }

      const registeredLayer = await this.fetchChain(requestedLayer.chain_id)
      const layer = registeredLayer ?? requestedLayer

      this.#requested = {
        layer,
        sender,
        approve: async () => {
          this.#requested = undefined
          try {
            if (registeredLayer) await this.addLayer(layer)
            else await this.addCustomLayer(layer)
            resolve()
          } catch (error) {
            reject(error)
          }

          await closePopup()
        },
        reject: async () => {
          this.#requested = undefined
          reject(new Error("User rejected"))
          await closePopup()
        },
      }

      await openPopup()
    })
  }

  async approve() {
    await this.#requested?.approve()
  }

  async reject() {
    await this.#requested?.reject()
  }
}

export default LayersController
