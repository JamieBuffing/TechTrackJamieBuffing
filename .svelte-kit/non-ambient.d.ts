
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/api" | "/api/achievements" | "/api/friends-stats" | "/api/genres" | "/api/hidden-gems" | "/api/library-value" | "/api/owned-games-simple" | "/api/profile" | "/api/top-games" | "/auth" | "/auth/steam" | "/auth/steam/logout" | "/auth/steam/return";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/": Record<string, never>;
			"/api": Record<string, never>;
			"/api/achievements": Record<string, never>;
			"/api/friends-stats": Record<string, never>;
			"/api/genres": Record<string, never>;
			"/api/hidden-gems": Record<string, never>;
			"/api/library-value": Record<string, never>;
			"/api/owned-games-simple": Record<string, never>;
			"/api/profile": Record<string, never>;
			"/api/top-games": Record<string, never>;
			"/auth": Record<string, never>;
			"/auth/steam": Record<string, never>;
			"/auth/steam/logout": Record<string, never>;
			"/auth/steam/return": Record<string, never>
		};
		Pathname(): "/" | "/api" | "/api/" | "/api/achievements" | "/api/achievements/" | "/api/friends-stats" | "/api/friends-stats/" | "/api/genres" | "/api/genres/" | "/api/hidden-gems" | "/api/hidden-gems/" | "/api/library-value" | "/api/library-value/" | "/api/owned-games-simple" | "/api/owned-games-simple/" | "/api/profile" | "/api/profile/" | "/api/top-games" | "/api/top-games/" | "/auth" | "/auth/" | "/auth/steam" | "/auth/steam/" | "/auth/steam/logout" | "/auth/steam/logout/" | "/auth/steam/return" | "/auth/steam/return/";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/robots.txt" | string & {};
	}
}