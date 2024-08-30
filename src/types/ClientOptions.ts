/**
 * PokeAClient options
 */
export interface ClientOptions {
	/**
	 * The base URL to connect to PokeAClient. Default: http://localhost:8085
	 */
	pokeAByteUrl: string;
	/**
	 * The time between connect/reconnect-attempts in milliseconds. Default: 2000ms.
	 */
	reconnectDelayMs: number;
}
