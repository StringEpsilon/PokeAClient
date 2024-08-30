## PokeAClient

A client library for [PokeAByte](https://github.com/PokeAByte/PokeAByte) writte from scratch to allow for a permissive
license, since the default client PokeAByte provides falls under the AGPL which may not suite every project.

## Usage

```js
import { PokeAClient } from "pokeaclient";

var client = new PokeAClient({
	onMapperChange:  handleMapperChange,
	onPropertyChange:  handlePropertyChange,
	onConnectionChange:  handleConnectionChange,

});
client.connect();
```

The callbacks do not provide the full information each time they are invoked. Their signatures are:

```ts
interface PokeAClientCallbacks {
    onPropertyChange?: ((propertyPath: string) => void);
    onMapperChange?: (() => void);
    onConnectionChange?: ((connected: boolean) => void);
    onConnect?: (() => void);
    onDisconnect?: (() => void);
}
```

When notified by `onMapperChange` for instance, you will have to retrieve the mapper state and glossary data yourself 
via `PokeAClient.getMapper` and `PokeAClient.getGlossary`. And game properties can be accessed via `PokeAClient.getProperty(path)`.