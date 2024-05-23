import LayerManager from "../layers/LayerManager"

export function getLayers() {
  const layersManagerInstance = LayerManager.getInstance()
  return layersManagerInstance.layers
}

export function findLayer(chainId: string) {
  const layersManagerInstance = LayerManager.getInstance()
  return layersManagerInstance.findLayer(chainId)
}
