import { GameProperty } from "./GameProperty";

/**
 * Callbacks for all the events from the PokeAByte client.
 */
export interface PokeAClientCallbacks {
	/**
	 * Invoked whenever a game property changes. This callback is invoked before onPropertiesChanged.
	 * @param path The path of the property.
	 * @param previous The previous state of the property. This may be null if the property was newly added.
	 */
	onPropertyChange?: (path: string, previous: GameProperty|null) => void;
	/**
	 * Invoked whenever PokeAByte informs the client of property changes.
	 * @param paths An array of paths of all the properties that have changed.
	 */
	onPropertiesChanged?: (paths: string[]) => void;
	/**
	 * Invoked whenever PokeAByte changes the mapper. Either on load or unload. It is also invoked when the 
	 * connection to PokeAByte is first established and the mapper data is retrieved.
	 */
	onMapperChange?: () => void;
	/**
	 * Invoked when the connection status to PokeAByte changes. 
	 * @param connected `true` if a connection was established. `false` on disconnect. 
	 */
	onConnectionChange?: (connected: boolean) => void;
	/**
	 * Invoked when the connection to PokeAByte was established.
	 */
	onConnect?: () => void;
	/**
	 * Invoked when the connection got lost.
	 */
	onDisconnect?: () => void;
}
