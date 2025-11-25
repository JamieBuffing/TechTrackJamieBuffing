import * as server from '../entries/pages/_layout.server.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { server };
export const server_id = "src/routes/+layout.server.js";
export const imports = ["_app/immutable/nodes/0.hGjzc5vh.js","_app/immutable/chunks/B20stkQR.js","_app/immutable/chunks/BplkUxLQ.js","_app/immutable/chunks/BPPguxYx.js","_app/immutable/chunks/C_JGXJtS.js"];
export const stylesheets = ["_app/immutable/assets/0.De60sV5G.css"];
export const fonts = [];
