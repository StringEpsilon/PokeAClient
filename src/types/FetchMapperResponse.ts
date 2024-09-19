import { GameProperty } from "./GameProperty";
import { Glossary } from "./Glossary";
import { Mapper } from "./Mapper";

export interface FetchMapperResponse {
	meta: Mapper,
	properties: GameProperty[],
	glossary: Glossary,
}