import { BehaviorSubject } from "rxjs"
import { AsyncLocalStorage, createHTTPClient } from "@initia/utils"
import type { Chain } from "@initia/initia-registry-types"
import { STORAGE_KEYS } from "../shared/constants"
import { omnitiaURL } from "../stores/config"
import InitiaLayer from "./InitiaLayer"

export default class LayerManager {
  public static instance: LayerManager

  private layersSubject = new BehaviorSubject<Chain[]>([])

  public get layers$() {
    return this.layersSubject.asObservable()
  }

  public get layers() {
    return this.layersSubject.getValue()
  }

  public static async initialize(layer: Chain): Promise<void> {
    if (!LayerManager.instance) {
      LayerManager.instance = new LayerManager()
      await LayerManager.instance.restoreLayers(layer)
    }
  }

  public static getInstance(): LayerManager {
    if (!LayerManager.instance) {
      throw new Error("Layers not initialized")
    }

    return LayerManager.instance
  }

  private async restoreLayers(layer: Chain): Promise<void> {
    const storedChainIds = await AsyncLocalStorage.getItem<string[]>(STORAGE_KEYS.CHAIN_IDS)

    let storedLayers: Chain[] = []
    if (storedChainIds?.length) {
      storedLayers = await createHTTPClient(omnitiaURL).get<Chain[]>("/v1/registry/chains", {
        chain_ids: storedChainIds,
      })
    }

    const layers = [layer, ...storedLayers]

    await Promise.all(layers.map((layer) => InitiaLayer.initialize(layer)))

    this.layersSubject.next(layers)
  }

  public findLayer(chainId: string): Chain | undefined {
    return this.layers.find((layer) => layer.chain_id === chainId)
  }

  private checkLayerExists(chainId: string): void {
    if (this.findLayer(chainId)) {
      throw new Error(`Layer ${chainId} already exists`)
    }
  }

  private async storeLayers(): Promise<void> {
    const layers = this.layers
    await AsyncLocalStorage.setItem(
      STORAGE_KEYS.CHAIN_IDS,
      layers.slice(1).map((layer) => layer.chain_id),
    )
  }

  public async addLayer(layer: Chain): Promise<void> {
    this.checkLayerExists(layer.chain_id)
    await InitiaLayer.initialize(layer)
    this.layersSubject.next([...this.layers, layer])
    await this.storeLayers()
  }

  public async addLayerWithChainId(chainId: string): Promise<void> {
    this.checkLayerExists(chainId)
    const [layer] = await createHTTPClient(omnitiaURL).get<Chain[]>("/v1/registry/chains", { chain_ids: [chainId] })
    await this.addLayer(layer)
  }

  public async deleteLayer(chainId: string): Promise<void> {
    const next = this.layers.filter((layer) => layer.chain_id !== chainId)
    this.layersSubject.next(next)
    await this.storeLayers()
  }
}
