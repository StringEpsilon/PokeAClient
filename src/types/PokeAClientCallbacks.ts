export interface PokeAClientCallbacks {
	onPropertyChange?: ((path: string) => void);
	onMapperChange?: (() => void);
	onConnectionChange?: ((connected: boolean) => void);
	onConnect?: (() => void);
	onDisconnect?: (() => void);
}
