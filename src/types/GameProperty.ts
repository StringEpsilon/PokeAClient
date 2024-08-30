export interface GameProperty {
	path: string,
	memoryContainer: string|null,
	address: number,
	length: number,
	size: number|null,
	reference: string|null, 
	bits: string|null,
	description: string|null,
	value: any,
	bytes: number[],
	isFrozen: boolean,
	isReadOnly: boolean,
	fieldsChanged: string[]
}

