import * as universal from '../entries/pages/_page.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+page.js";
export const imports = ["_app/immutable/nodes/2.CCCngvgO.js","_app/immutable/chunks/B20stkQR.js","_app/immutable/chunks/BplkUxLQ.js","_app/immutable/chunks/BPPguxYx.js","_app/immutable/chunks/ClflXhKl.js","_app/immutable/chunks/B2Fygcga.js","_app/immutable/chunks/C_JGXJtS.js","_app/immutable/chunks/Bb-bYzV9.js","_app/immutable/chunks/DIax3sE1.js","_app/immutable/chunks/B2HC9mBy.js"];
export const stylesheets = ["_app/immutable/assets/2.4Gi6tEy4.css"];
export const fonts = [];
