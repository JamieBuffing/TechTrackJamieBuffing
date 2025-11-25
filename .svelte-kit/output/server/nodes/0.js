import * as server from '../entries/pages/_layout.server.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { server };
export const server_id = "src/routes/+layout.server.js";
export const imports = ["_app/immutable/nodes/0.CmhTLrgm.js","_app/immutable/chunks/Dw3S_qJL.js","_app/immutable/chunks/DlXnFa2w.js","_app/immutable/chunks/CUxHRG_m.js","_app/immutable/chunks/C7EHMB04.js"];
export const stylesheets = ["_app/immutable/assets/0.De60sV5G.css"];
export const fonts = [];
