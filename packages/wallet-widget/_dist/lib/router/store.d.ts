/// <reference types="svelte" />
interface Route {
    path: string;
    state?: unknown;
}
interface RouterState {
    current: Route;
    history: Route[];
}
export declare const router: {
    subscribe: (this: void, run: import('svelte/store').Subscriber<RouterState>, invalidate?: import('svelte/store').Invalidator<RouterState> | undefined) => import('svelte/store').Unsubscriber;
    navigate: (path: string, state?: unknown) => void;
    goBack: () => void;
};
export {};
