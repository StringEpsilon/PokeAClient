import { GamePropertyType } from "./GamePropertyType";

export interface GameProperty<T=any> {
	path: string,
	memoryContainer: string|null,
	address: number,
	length: number,
	type: GamePropertyType,
	size: number|null,
	reference: string|null, 
	bits: string|null,
	description: string|null,
	value: T,
	bytes: number[],
	isFrozen: boolean,
	isReadOnly: boolean,
	fieldsChanged: string[]
}
