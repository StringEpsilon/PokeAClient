import { fetchResult, fetchWithoutResult } from "../utils/fetchWrapper";
import { 
	ArchivedMapper, 
	ArchivedMappers,
	MapperFile,
	MapperUpdate, 
	MapperUpdateRequest,
	GithubSettings
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

	/**
	 * Get the GitHub settings used to retrieve and update the mapper files.
	 * 
	 * @returns The GitHub settings.
	 */
	getGithubSettings = async () => {
		const json = await fetchResult<string>(this._baseUrl + "/get_github_settings");
		return  json !== null 
			? JSON.parse(json) as GithubSettings
			: null;
	}
	
	/**
	 * Update the GitHub settings used to retrieve and update the mapper files.
	 * 
	 * @param settings The new GitHub settings.
	 * @returns A boolean indicating request success.
	 */
	saveGithubSettings = async (settings: GithubSettings) => 
		await fetchWithoutResult(this._baseUrl + "/save_github_settings", "POST", settings );

	/** 
	 * Let PokeAByte test the current GitHub configuration.
	 * @returns A status message indicating whether the GitHub settings work.
	 * Either "Successfully connected to Github Api!" or 
	 * "Failed to connect to Github Api - Reason: {reason}"	 *
	 */
	testGithubSettingsAsync = async () => await fetchResult<string>(this._baseUrl + "/test_github_settings");

	/** Tell PokeAByte to open the local mapper folder in the default file browser.  */
	openMapperFolder = async () => await fetchWithoutResult(this._baseUrl + "/open_mapper_folder");
	
	/** Tell PokeAByte to open the local mapper archive folder in the default file browser.  */
	openMapperArchiveFolder = async () => await fetchWithoutResult(this._baseUrl + "/open_mapper_archive_folder");
	
	/** 
	 * Retrieve the link to the mapper github repository. 	 * 
	 * @returns The github repository URL.
	*/
	getGithubLink = async () => await fetchResult<string>(this._baseUrl + "/get_github_link");
}