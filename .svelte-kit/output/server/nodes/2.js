import * as universal from '../entries/pages/_page.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+page.js";
export const imports = ["_app/immutable/nodes/2.DULDwNg5.js","_app/immutable/chunks/Dw3S_qJL.js","_app/immutable/chunks/DlXnFa2w.js","_app/immutable/chunks/CUxHRG_m.js","_app/immutable/chunks/B1slai5c.js","_app/immutable/chunks/DpnZby0m.js","_app/immutable/chunks/C7EHMB04.js","_app/immutable/chunks/DgZX1hg6.js","_app/immutable/chunks/8PJQ-ggv.js","_app/immutable/chunks/U150nBVQ.js"];
export const stylesheets = ["_app/immutable/assets/2.4Gi6tEy4.css"];
export const fonts = [];
