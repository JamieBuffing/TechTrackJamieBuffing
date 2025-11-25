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
		client: {start:"_app/immutable/entry/start.prEEahq1.js",app:"_app/immutable/entry/app.DBBG7AEe.js",imports:["_app/immutable/entry/start.prEEahq1.js","_app/immutable/chunks/B2HC9mBy.js","_app/immutable/chunks/BplkUxLQ.js","_app/immutable/chunks/DIax3sE1.js","_app/immutable/entry/app.DBBG7AEe.js","_app/immutable/chunks/BplkUxLQ.js","_app/immutable/chunks/ClflXhKl.js","_app/immutable/chunks/B20stkQR.js","_app/immutable/chunks/DIax3sE1.js","_app/immutable/chunks/B2Fygcga.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('../output/server/nodes/0.js')),
			__memo(() => import('../output/server/nodes/1.js')),
			__memo(() => import('../output/server/nodes/2.js'))
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
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/achievements/_server.js'))
			},
			{
				id: "/api/friends-stats",
				pattern: /^\/api\/friends-stats\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/friends-stats/_server.js'))
			},
			{
				id: "/api/genres",
				pattern: /^\/api\/genres\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/genres/_server.js'))
			},
			{
				id: "/api/hidden-gems",
				pattern: /^\/api\/hidden-gems\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/hidden-gems/_server.js'))
			},
			{
				id: "/api/library-value",
				pattern: /^\/api\/library-value\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/library-value/_server.js'))
			},
			{
				id: "/api/owned-games-simple",
				pattern: /^\/api\/owned-games-simple\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/owned-games-simple/_server.js'))
			},
			{
				id: "/api/profile",
				pattern: /^\/api\/profile\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/profile/_server.js'))
			},
			{
				id: "/api/top-games",
				pattern: /^\/api\/top-games\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/top-games/_server.js'))
			},
			{
				id: "/auth/steam",
				pattern: /^\/auth\/steam\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/auth/steam/_server.js'))
			},
			{
				id: "/auth/steam/logout",
				pattern: /^\/auth\/steam\/logout\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/auth/steam/logout/_server.js'))
			},
			{
				id: "/auth/steam/return",
				pattern: /^\/auth\/steam\/return\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/auth/steam/return/_server.js'))
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
