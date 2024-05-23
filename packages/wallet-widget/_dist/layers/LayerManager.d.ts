import { Chain } from '@initia/initia-registry-types';

export default class LayerManager {
    static instance: LayerManager;
    private layersSubject;
    get layers$(): import('rxjs').Observable<Chain[]>;
    get layers(): Chain[];
    static initialize(layer: Chain): Promise<void>;
    static getInstance(): LayerManager;
    private restoreLayers;
    findLayer(chainId: string): Chain | undefined;
    private checkLayerExists;
    private storeLayers;
    addLayer(layer: Chain): Promise<void>;
    addLayerWithChainId(chainId: string): Promise<void>;
    deleteLayer(chainId: string): Promise<void>;
}
