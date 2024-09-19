import { fetchResult, fetchWithoutResult } from "../utils/fetchWrapper";
import { 
	ArchivedMapper, 
	ArchivedMappers,
	MapperFile,
	MapperUpdate, 
	MapperUpdateRequest,
} from "./types/RestTypes";

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
	
	/** Get a dictionary of archived mappers. */
	getArchivedMappersAsync = async () => {
		return await fetchResult<ArchivedMappers>(this._baseUrl + "/mapper/get_archived");
	}
	
	/** 
	 * Tell PokeAByte to restore specified archived mappers 
	 * @param mappers The mappers to restore.
	 * @returns A boolean indicating request success or error.
	 */
	restoreMapper = async (mappers: ArchivedMapper[]) => {
		return await fetchWithoutResult(this._baseUrl + "/mapper/restore_mappers", "POST", mappers);
	}

	/**
	 * Tell PokeAByte to delete specified archived mappers.
	 * @param mappers The mappers to deleted.
	 * @returns A boolean indicating request success or error.
	 */
	deleteMappers = async (mappers: ArchivedMapper[]) => {
		return await fetchWithoutResult(this._baseUrl + "/mapper/delete_mappers", "POST", mappers);
	}

	/**
	 * Tell PokeAByte to re-read the archived mappers from file system.
	 * @param mappers The mappers to deleted.
	 * @returns The dictionary of archived mappers.
	 */
	refreshArchivedList = async () => {
		return await fetchResult<ArchivedMappers>(this._baseUrl + "/mapper/refresh_archived_list");
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