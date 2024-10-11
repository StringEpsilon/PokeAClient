# 0.4.0 (2024-10-11)
- Added `previous` parameter to `PokeAClientCallbacks.onPropertyChange`, which contains the property state before the
  update. 

```ts
const client = new PokeAClient({
	onPropertyChange: (path: string, previous: GameProperty|null) => {
		const property = client.getProperty(path);
        if (property?.fieldsChanged.includes("value")) {
          console.log(`${path} changed value from: ${previous?.value} to ${property.value}`);
        }
	}
});
```

# 0.3.2 (2024-10-06)
- Fixed wrong typing for `ArchivedMappers`
- 
# 0.3.2 (2024-09-23)
- Fixed FilesClient.getGithubSettings fetching from wrong URL.
- Fixed FilesClient.saveGithubSettings fetching from wrong URL.

# 0.3.0 (2024-09-20)
- `changeMapper`  now calls `/mapper-service/change-mapper` and no longer needs the driver parameter.
- Added better typing for the glossary.
- Added `writeMemory()`.
- Added `PokeAClient.files` to talk to the PokeAByte files api.
- Fixed missing type export for `GamePropertyType`.

# 0.2.1 (2024-09-07)
- Fixed missing "/" in get-mappers URI.

# 0.2.0 (2024-09-07)
- Feature: If the "MapperLoaded" message has payload, the client uses that instead of making a fetch call.
- Feature: Support the new /mapper-service/get-mappers endpoint.

# 0.1.3 (2024-09-07)

- Fix: The option "updateOn" was not respected. 

# 0.1.2 (2024-09-07)

- Fixed the export of "ChangedField".

# 0.1.1 (2024-09-05)

- Fixed types missing from main.d.ts