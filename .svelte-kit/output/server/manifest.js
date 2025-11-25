export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["robots.txt"]),
	mimeTypes: {".txt":"text/plain"},
	_: {
		client: {start:"_app/immutable/entry/start.DYN0wIqi.js",app:"_app/immutable/entry/app.CiGhOXFG.js",imports:["_app/immutable/entry/start.DYN0wIqi.js","_app/immutable/chunks/U150nBVQ.js","_app/immutable/chunks/DlXnFa2w.js","_app/immutable/chunks/8PJQ-ggv.js","_app/immutable/entry/app.CiGhOXFG.js","_app/immutable/chunks/DpnZby0m.js","_app/immutable/chunks/DlXnFa2w.js","_app/immutable/chunks/B1slai5c.js","_app/immutable/chunks/Dw3S_qJL.js","_app/immutable/chunks/8PJQ-ggv.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/api/achievements",
				pattern: /^\/api\/achievements\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/achievements/_server.js'))
			},
			{
				id: "/api/friends-stats",
				pattern: /^\/api\/friends-stats\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/friends-stats/_server.js'))
			},
			{
				id: "/api/genres",
				pattern: /^\/api\/genres\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/genres/_server.js'))
			},
			{
				id: "/api/hidden-gems",
				pattern: /^\/api\/hidden-gems\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/hidden-gems/_server.js'))
			},
			{
				id: "/api/library-value",
				pattern: /^\/api\/library-value\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/library-value/_server.js'))
			},
			{
				id: "/api/owned-games-simple",
				pattern: /^\/api\/owned-games-simple\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/owned-games-simple/_server.js'))
			},
			{
				id: "/api/profile",
				pattern: /^\/api\/profile\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/profile/_server.js'))
			},
			{
				id: "/api/top-games",
				pattern: /^\/api\/top-games\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/top-games/_server.js'))
			},
			{
				id: "/auth/steam",
				pattern: /^\/auth\/steam\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/auth/steam/_server.js'))
			},
			{
				id: "/auth/steam/logout",
				pattern: /^\/auth\/steam\/logout\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/auth/steam/logout/_server.js'))
			},
			{
				id: "/auth/steam/return",
				pattern: /^\/auth\/steam\/return\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/auth/steam/return/_server.js'))
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
