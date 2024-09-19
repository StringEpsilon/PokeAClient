export type MapperVersion = {
	display_name: string
	path: string
	date_created: string
	version: string
}
export type MapperUpdate = {currentVersion: MapperVersion, latestVersion: MapperVersion}

export type MapperUpdateRequest = {currentVersion: MapperVersion, latestVersion: MapperVersion};