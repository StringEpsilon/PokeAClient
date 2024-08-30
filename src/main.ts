import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from "@microsoft/signalr";
import { GameProperty } from "./types/GameProperty";
import { PokeAByteMessages } from "./types/PokeAByteMessages";
import { Driver } from "./types/Driver";
import { Mapper } from "./types/Mapper";
import { PokeAClientCallbacks } from "./types/PokeAClientCallbacks";
import { ClientOptions } from "./types/ClientOptions";
import { FetchMapperResponse } from "./types/FetchMapperResponse";

export class PokeAClient {
	private _mapper: Mapper | null = null;
	private _properties: Record<string, GameProperty> = {};
	private _glossary: Record<string, any> = {};
	private _connection: HubConnection;
	private _callbacks: PokeAClientCallbacks = {}
	private _options: ClientOptions;

	constructor(callbacks: PokeAClientCallbacks, options: Partial<ClientOptions> = {}) {
		this._options = {
			pokeAByteUrl: options.pokeAByteUrl ?? "http://localhost:8085",
			reconnectDelay: options.reconnectDelay ?? 2000,
		};

		this._callbacks = callbacks;
		this._connection = new HubConnectionBuilder()
			.withUrl(this._options.pokeAByteUrl + "/updates")
			.configureLogging(LogLevel.Critical)
			.withAutomaticReconnect(
				{ nextRetryDelayInMilliseconds: () => this._options.reconnectDelay }
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
				await this.refreshMapper()
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
		if (property.fieldsChanged.includes("value")) {
			this._properties[property.path] = property;
			if (this._callbacks.onPropertyChange) {
				this._callbacks.onPropertyChange(property.path);
			}
		}
	}

	private _onPropertiesChanged = (properties: GameProperty[]) => {
		properties.forEach(x => this._onPropertyChanged(x));
	}

	private _fetch = async (requestUrl: string, method: string, body: any) => {
		try {
			var response = await fetch(requestUrl, { method, body });
			return response.ok;
		} catch {
			return false
		}
	}

	connect = async () => {
		try {
			await this._connection.start();
			await this.refreshMapper();
			if (this._callbacks.onConnectionChange) {
				this._callbacks.onConnectionChange(true);
			}
			if (this._callbacks.onConnect) {
				this._callbacks.onConnect();
			}
		} catch {
			setTimeout(() => this.connect(), this._options.reconnectDelay);
		}
	}

	getProperty = (path: string) => this._properties[path];

	getMapper = () => this._mapper;

	getGlossary = () => this._glossary;

	isConnected = () => this._connection.state === HubConnectionState.Connected;

	refreshMapper = async () => {
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

	changeMapper = async (id: string, driver: Driver) => {
		const requestUrl = this._options.pokeAByteUrl + "/mapper";
		const body = JSON.stringify({ id, driver });
		return await this._fetch(requestUrl, "PUT", body);
	}

	freezeProperty = async (path: string, freeze: boolean) => {
		const requestUrl = this._options.pokeAByteUrl + "/mapper/set-property-frozen";
		const body = JSON.stringify({ path, freeze });
		return await this._fetch(requestUrl, "POST", body);
	}

	updatePropertyValue = async (path: string, value: any, freeze?: boolean) => {
		const requestUrl = this._options.pokeAByteUrl + "/mapper/set-property-value";
		const body = JSON.stringify({ path, value, freeze });
		return await this._fetch(requestUrl, "POST", body);
	}

	updatePropertyBytes = async (path: string, bytes: number[], freeze?: boolean) => {
		const requestUrl = this._options.pokeAByteUrl + "/mapper/set-property-bytes";
		const body = JSON.stringify({ path, bytes, freeze });
		return await this._fetch(requestUrl, "POST", body);
	}
}
