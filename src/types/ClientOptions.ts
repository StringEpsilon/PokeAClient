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

	/**
	 * On which changed fields to update properties and call `onPropertyChange`.
	 */
	updateOn: ChangedField[],
}

export enum ChangedField {
	value = "value", 
	bytes = "bytes", 
	frozen = "frozen",
	memoryContainer = "memoryContainer",
	address = "address",
	length = "length",
	size = "size",
	bits = "bits",
	reference = "reference",
	description = "description"
}