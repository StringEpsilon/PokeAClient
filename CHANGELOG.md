# 0.3.0 (future)
- `changeMapper`  now calls `/mapper-service/change-mapper` and no longer needs the driver parameter.
- Added better typing for the glossary.
- Added `writeMemory()`.
- Added `PokeAClient.files` to talk to the PokeAByte files api.
  - Implemented `FilesClient.getMapperFiles()`
  - Implemented `FilesClient.checkForUpdates()`
  - Implemented `FilesClient.getMapperUpdatesAsync()`
  - Implemented `FilesClient.downloadMapperUpdatesAsync()`

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