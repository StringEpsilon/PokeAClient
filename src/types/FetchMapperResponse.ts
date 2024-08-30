import { GameProperty } from "./GameProperty";
import { Mapper } from "./Mapper";

export interface FetchMapperResponse {
	meta: Mapper,
	properties: GameProperty[],
	glossary: Record<string, any>,
}