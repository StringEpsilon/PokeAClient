import { fetchResult, fetchWithoutResult } from "../utils/fetchWrapper";
import { MapperFile } from "./types/MapperFile";
import { MapperUpdate, MapperUpdateRequest } from "./types/MapperUpdate";

export class FilesClient {
	_baseUrl: string;

	constructor(baseUrl: string) {
		this._baseUrl = baseUrl + "/files";
	}

	getMapperFiles = async () => {
		return await fetchResult<MapperFile[]>(this._baseUrl + "/mappers")
	}
	
	/** 
	 * Ask PokeAByte to check for mapper updates. 
	 * @returns True, if there are updates available.
	*/
	checkForUpdates = async () => {
		return await fetchResult<boolean>(this._baseUrl + "/mapper/check_for_updates")
	}
	
	/**
	 * Get available mapper updates.
	 * @returns An array of mappers which can be updated.
	*/
	getMapperUpdatesAsync = async () => {
		return await fetchResult<MapperUpdate[]>(this._baseUrl + "/mapper/get_updates")
	}

	/** Tell PokeAByte to update mappers from github. */
	downloadMapperUpdatesAsync = async (mappers: MapperUpdateRequest[]) => {
		return await fetchWithoutResult(this._baseUrl + "/mapper/download_updates", "POST", mappers);
	}

	getArchivedMappersAsync = async () => {
		throw Error("Not implemented.");
	}

	restoreMapper = async () => {
		throw Error("Not implemented.");
	}

	deleteMappers = async () => {
		throw Error("Not implemented.");
	}

	refreshArchivedList = async () => {
		throw Error("Not implemented.");
	}

	getGithubSettings = async () => {
		throw Error("Not implemented.");
	}

	saveGithubSettingsAsync = async () => {
		throw Error("Not implemented.");
	}

	testGithubSettingsAsync = async () => {
		throw Error("Not implemented.");
	}

	openMapperFolder = async () => {
		throw Error("Not implemented.");
	}

	openMapperArchiveFolder = async () => {
		throw Error("Not implemented.");
	}

	getGithubLink = async () => {
		throw Error("Not implemented.");
	}
}