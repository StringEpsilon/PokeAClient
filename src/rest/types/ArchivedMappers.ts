import { MapperVersion } from "./MapperUpdate"

export type ArchivedMapper = {
	pathDisplayName: string,
	fullPath: string,
	mapper: MapperVersion
}
export type ArchivedMappers = Record<string, ArchivedMapper[]>