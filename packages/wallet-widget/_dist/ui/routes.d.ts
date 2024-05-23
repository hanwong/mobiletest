import { SvelteComponent } from 'svelte';

declare const routes: {
    "/": typeof SvelteComponent;
    "/layers": typeof SvelteComponent;
    "/collection": typeof SvelteComponent;
    "/nft": typeof SvelteComponent;
    "/send": typeof SvelteComponent;
    "/swap": typeof SvelteComponent;
    "/confirm": typeof SvelteComponent;
    "/result": typeof SvelteComponent;
    "/*": typeof SvelteComponent;
};
export default routes;
