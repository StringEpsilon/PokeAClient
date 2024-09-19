import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from "@microsoft/signalr";
import { GameProperty } from "./types/GameProperty";
import { PokeAByteMessages } from "./types/PokeAByteMessages";
import { Driver } from "./types/Driver";
import { Mapper } from "./types/Mapper";
import { PokeAClientCallbacks } from "./types/PokeAClientCallbacks";
import { ClientOptions, ChangedField } from "./types/ClientOptions";
import { FetchMapperResponse } from "./types/FetchMapperResponse";
import { AvailableMapper } from "./types/AvailableMapper";
import { Glossary, GlossaryItem } from "./types/Glossary";

export class PokeAClient {
	private _mapper: Mapper | null = null;
	private _properties: Record<string, GameProperty> = {};
	private _glossary: Glossary = {};
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
			updateOn: options.updateOn ?? [ChangedField.bytes, ChangedField.value],
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
			async (data: FetchMapperResponse | undefined) => {
				console.log("[PokeAClient] " + PokeAByteMessages.MapperLoaded);
				if (data) {
					this._updateEverything(data?.meta, data?.glossary, data?.properties);
				} else {
					await this._refreshMapper();
				}
			});
		this._connection.on(
			PokeAByteMessages.InstanceReset,
			() => {
				console.log("[PokeAClient] " + PokeAByteMessages.InstanceReset);
				this._mapper = null;
				this._properties = {};
				this._glossary = {}
				if (this._callbacks.onMapperChange) {
					this._callbacks.onMapperChange();
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

	private _fetch = async (requestUrl: string, method: string, body: any = null) => {
		try {
			var response = await fetch(requestUrl, { method, body, headers: { 'Content-Type': 'application/json' } });
			return response.ok;
		} catch {
			return false
		}
	}

	private _fetchResult = async <T>(requestUrl: string) => {
		try {
			var response = await fetch(requestUrl, { headers: { 'Content-Type': 'application/json' } });

			if (!response.ok) {
				return null;
			}
			return (await response.json()) as T
		} catch {
			return null
		}
	}

	private _updateEverything(
		meta: Mapper | undefined,
		glossary: Glossary | undefined,
		properties: GameProperty[] | undefined
	) {
		this._mapper = meta ?? null;
		this._glossary = glossary ?? {};
		this._properties = {};
		if (this._callbacks.onMapperChange) {
			this._callbacks.onMapperChange();
		}
		if (properties) {
			properties.forEach((x: GameProperty) => this._properties[x.path] = x);
			properties.forEach(x => this._onPropertyChanged(x));
		}
	}

	private _refreshMapper = async () => {
		const requestUrl = this._options.pokeAByteUrl + "/mapper";
		return fetch(requestUrl)
			.then(async (response) => {
				if (response.ok) {
					let data = await response.json() as FetchMapperResponse;
					this._updateEverything(data?.meta, data?.glossary, data?.properties);
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
	getProperty = <T = any>(path: string): GameProperty<T> | null => this._properties[path] ?? null;


	/**
	 * Get the current mapper metadata. Returns null if no mapper is loaded or if there is no connection to PokeAByte.
	 * @returns {Mapper | null} 
	 */
	getMapper = (): Mapper | null => this._mapper;

	/**
	 * Get the current mapper glossary. The glossary is an empty object if there is no connection to PokeAByte or if
	 * no mapper is currently loaded. 
	 * @returns {Glossary} 
	 */
	getGlossary = (): Glossary => this._glossary;

	/**
	 * Check whether the client is currently connected to PokeAByte
	 * @returns A boolean indicating the connection status.
	 */
	isConnected = (): boolean => this._connection.state === HubConnectionState.Connected;

	/** 
	 * Request PokeAByte to freeze or unfreeze the value of a specific property.
	 * @param path The path of the property to change.
	 * @param freeze Whether to freeze (`true`) or unfreeze (`false`) the property.
	 * @returns Whether the request was succesful.
	 */
	freezeProperty = async (path: string, freeze: boolean): Promise<boolean> => {
		const requestUrl = this._options.pokeAByteUrl + "/mapper/set-property-frozen";
		const body = JSON.stringify({ path, freeze });
		return await this._fetch(requestUrl, "POST", body);
	}

	/** 
	 * Request PokeAByte to change the value of a specific property.
	 * @param path The path of the property to change.
	 * @param value The value to set for the property.
	 * @param freeze Optional: Whether to freeze (`true`) or unfreeze (`false`) the property. 
	 * Leave undefined to not change the frozen status of the property.
	 * @returns Whether the request was succesful.
	 */
	updatePropertyValue = async (path: string, value: any, freeze?: boolean): Promise<boolean> => {
		const requestUrl = this._options.pokeAByteUrl + "/mapper/set-property-value";
		const body = JSON.stringify({ path, value, freeze });
		return await this._fetch(requestUrl, "POST", body);
	}
	/** 
	 * Request PokeAByte to change a property by setting the raw bytes.
	 * @param path The path of the property to change.
	 * @param bytes The byte array to set on the property.
	 * @param freeze Optional: Whether to freeze (`true`) or unfreeze (`false`) the property. 
	 * Leave undefined to not change the frozen status of the property.
	 * @returns Whether the request was succesful.
	 */
	updatePropertyBytes = async (path: string, bytes: number[], freeze?: boolean): Promise<boolean> => {
		const requestUrl = this._options.pokeAByteUrl + "/mapper/set-property-bytes";
		const body = JSON.stringify({ path, bytes, freeze });
		return await this._fetch(requestUrl, "POST", body);
	}

	/**
	 * Request the list of available mappers from PokeAByte.
	 * @returns The array of mappers, or null if the request failed for some reason.
	 */
	getMappers = async (): Promise<AvailableMapper[]|null> => {
		const requestUrl = this._options.pokeAByteUrl + "/mapper-service/get-mappers";
		return await this._fetchResult<AvailableMapper[]>(requestUrl);
	}

	getIsMapperConnected = async () => {
		const requestUrl = this._options.pokeAByteUrl + "/mapper-service/is-connected";
		return await this._fetchResult<boolean>(requestUrl);
	}

	setMapper = async (mapperId: string) => {
		const requestUrl = this._options.pokeAByteUrl + "/mapper-service/change-mapper";
		return await this._fetch(requestUrl, "POST", { mapperId });
	}

	unloadMapper = async () => {
		const requestUrl = this._options.pokeAByteUrl + "/mapper-service/unload-mapper";
		return await this._fetch(requestUrl, "PUT");
	}

	/** 
	 * Request PokeAByte to load a specific mapper/driver combination. 
	 * @param mapperId The human readable ID of the mapper to change to. See {@link AvailableMapper.id}.
	 * @returns Whether the request was succesful.
	 */
	changeMapper = async (mapperId: string | null) => {
		if (!mapperId) {
			return false;
		}
		const requestUrl = this._options.pokeAByteUrl + "/mapper-service/change-mapper";
		return await this._fetch(requestUrl, "PUT", mapperId);
	}
}

export { ChangedField } from "./types/ClientOptions";
export type {
	GameProperty,
	PokeAByteMessages,
	Driver,
	Mapper,
	PokeAClientCallbacks,
	ClientOptions,
	FetchMapperResponse,
	AvailableMapper,
	Glossary,
	GlossaryItem,
};
