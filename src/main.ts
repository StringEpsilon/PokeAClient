import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from "@microsoft/signalr";
import { GameProperty } from "./types/GameProperty";
import { PokeAByteMessages } from "./types/PokeAByteMessages";
import { Driver } from "./types/Driver";
import { Mapper } from "./types/Mapper";
import { PokeAClientCallbacks } from "./types/PokeAClientCallbacks";
import { ClientOptions, ChangedField } from "./types/ClientOptions";
import { FetchMapperResponse } from "./types/FetchMapperResponse";


export class PokeAClient {
	private _mapper: Mapper | null = null;
	private _properties: Record<string, GameProperty> = {};
	private _glossary: Record<string, any> = {};
	private _connection: HubConnection;
	private _callbacks: PokeAClientCallbacks = {}
	private _options: ClientOptions;

	/**
	 * Creates an instance of PokeAClient.
	 *
	 * @constructor
	 * @param {PokeAClientCallbacks} callbacks The event callbacks to invoke.
	 * @param {Partial<ClientOptions>} [options={}] Additional client options. 
	 */
	constructor(callbacks: PokeAClientCallbacks, options: Partial<ClientOptions> = {}) {
		this._options = {
			pokeAByteUrl: options.pokeAByteUrl ?? "http://localhost:8085",
			reconnectDelayMs: options.reconnectDelayMs ?? 2000,
			updateOn: [ChangedField.bytes, ChangedField.value]
		};

		this._callbacks = callbacks;
		this._connection = new HubConnectionBuilder()
			.withUrl(this._options.pokeAByteUrl + "/updates")
			.configureLogging(LogLevel.Critical)
			.withAutomaticReconnect(
				{ nextRetryDelayInMilliseconds: () => this._options.reconnectDelayMs }
			)
			.build();

		this._connection.on(
			PokeAByteMessages.PropertiesChanged, 
			(properties) => {
				this._onPropertiesChanged(properties);
			});
		this._connection.on(
			PokeAByteMessages.MapperLoaded, 
			async () => {
				console.log("[PokeAClient] " + PokeAByteMessages.MapperLoaded);
				await this._refreshMapper()
			});
		this._connection.on(
			PokeAByteMessages.InstanceReset, 
			() => {
				console.log("[PokeAClient] " + PokeAByteMessages.InstanceReset);				
				this._mapper = null;
				this._properties = {};
				this._glossary = {}
				if (this._callbacks.onMapperChange ) {
					this._callbacks.onMapperChange() ;
				}
			});
		this._connection.onclose(this._onClose);
	}

	private _onClose = () => {
		if (this._callbacks.onConnectionChange) {
			this._callbacks.onConnectionChange(false);
		}
		if (this._callbacks.onDisconnect) {
			this._callbacks.onDisconnect();
		}
	}

	private _onPropertyChanged = (property: GameProperty) => {
		if (this._options.updateOn.some(x => property.fieldsChanged.includes(x))) {
			this._properties[property.path] = {
				...this._properties[property.path],
				value: property.value,
				bits: property.bits,
				bytes: property.bytes,
				isFrozen: property.isFrozen,
			}
			if (this._callbacks.onPropertyChange) {
				this._callbacks.onPropertyChange(property.path);
			}
		}
	}

	private _onPropertiesChanged = (properties: GameProperty[]) => {
		properties.forEach(property => this._onPropertyChanged(property));
		if (this._callbacks.onPropertiesChanged) {
			const paths: string[] = properties.map(property => property.path);
			this._callbacks.onPropertiesChanged(paths);
		}
	}

	private _fetch = async (requestUrl: string, method: string, body: any) => {
		try {
			var response = await fetch(requestUrl, { method, body, headers: { 'Content-Type': 'application/json' } });
			return response.ok;
		} catch {
			return false
		}
	}

	private _refreshMapper = async () => {
		const requestUrl = this._options.pokeAByteUrl + "/mapper";
		return fetch(requestUrl)
			.then(async (response) => {
				if (response.ok) {
					let data = await response.json() as FetchMapperResponse;

					this._mapper = data?.meta ?? null;
					this._glossary = data?.glossary ?? null;
					this._properties = {};
					if (this._callbacks.onMapperChange) {
						this._callbacks.onMapperChange();
					}
					if (data) {
						data.properties.forEach((x: GameProperty) => this._properties[x.path] = x);
						data.properties.forEach(x => this._onPropertyChanged(x));
					}
				};
			})
			.catch(() => {
				if (this._callbacks.onMapperChange) {
					this._callbacks.onMapperChange();
				}
				return null;
			});
	}

	/**
	 * Connect to PokeAByte.
	 */
	connect = async () => {
		try {
			await this._connection.start();
			await this._refreshMapper();
			if (this._callbacks.onConnectionChange) {
				this._callbacks.onConnectionChange(true);
			}
			if (this._callbacks.onConnect) {
				this._callbacks.onConnect();
			}
		} catch {
			setTimeout(() => this.connect(), this._options.reconnectDelayMs);
		}
	}

	/**
	 * Get target game property. Returns null if the property does not exist.
	 * @param {string} path The path of the property to retrieve.
	 * @returns {(GameProperty|undefined)}
	 */
	getProperty = <T=any>(path: string): GameProperty<T>|null => this._properties[path] ?? null;
	
	
	/**
	 * Get the current mapper metadata. Returns null if no mapper is loaded or if there is no connection to PokeAByte.
	 * @returns {Mapper | null} 
	 */
	getMapper = ():Mapper | null => this._mapper;
	
	/**
	 * Get the current mapper glossary. The glossary is an empty object if there is no connection to PokeAByte or if
	 * no mapper is currently loaded. 
	 * @returns {Record<string, any>} 
	 */
	getGlossary = ():Record<string, any> => this._glossary;

	/**
	 * Check whether the client is currently connected to PokeAByte
	 * @returns {boolean} 
	 */
	isConnected = (): boolean => this._connection.state === HubConnectionState.Connected;

	/** 
	 * Request PokeAByte to load a specific mapper/driver combination. 
	 * @param {string} id The GUID of the mapper to load. See also {@link Mapper.id}.
	 * @param {Driver} driver Which driver to use for the mapper. 
	 * @returns {boolean} Whether the request was succesful.
	 */
	changeMapper = async (id: string, driver: Driver) => {
		const requestUrl = this._options.pokeAByteUrl + "/mapper";
		const body = JSON.stringify({ id, driver });
		return await this._fetch(requestUrl, "PUT", body);
	}

	/** 
	 * Request PokeAByte to freeze or unfreeze the value of a specific property.
	 * @param {string} path The path of the property to change.
	 * @param {boolean} freeze Whether to freeze (`true`) or unfreeze (`false`) the property.
	 * @returns {boolean} Whether the request was succesful.
	 */
	freezeProperty = async (path: string, freeze: boolean) => {
		const requestUrl = this._options.pokeAByteUrl + "/mapper/set-property-frozen";
		const body = JSON.stringify({ path, freeze });
		return await this._fetch(requestUrl, "POST", body);
	}

	/** 
	 * Request PokeAByte to change the value of a specific property.
	 * @param {string} path The path of the property to change.
	 * @param {*} value The value to set for the property.
	 * @param {boolean?} freeze Optional: Whether to freeze (`true`) or unfreeze (`false`) the property. 
	 * Leave undefined to not change the frozen status of the property.
	 * @returns {boolean} Whether the request was succesful.
	 */
	updatePropertyValue = async (path: string, value: any, freeze?: boolean) => {
		const requestUrl = this._options.pokeAByteUrl + "/mapper/set-property-value";
		const body = JSON.stringify({ path, value, freeze });
		return await this._fetch(requestUrl, "POST", body);
	}
	/** 
	 * Request PokeAByte to change a property by setting the raw bytes.
	 * @param {string} path The path of the property to change.
	 * @param {number[]} bytes The byte array to set on the property.
	 * @param {boolean?} freeze Optional: Whether to freeze (`true`) or unfreeze (`false`) the property. 
	 * Leave undefined to not change the frozen status of the property.
	 * @returns {boolean} Whether the request was succesful.
	 */
	updatePropertyBytes = async (path: string, bytes: number[], freeze?: boolean) => {
		const requestUrl = this._options.pokeAByteUrl + "/mapper/set-property-bytes";
		const body = JSON.stringify({ path, bytes, freeze });
		return await this._fetch(requestUrl, "POST", body);
	}
}

export { ChangedField } from  "./types/ClientOptions";
export type { 
	GameProperty, 
	PokeAByteMessages, 
	Driver, 
	Mapper, 
	PokeAClientCallbacks, 
	ClientOptions, 
	FetchMapperResponse 
};
