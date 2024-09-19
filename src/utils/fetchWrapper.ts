export async function fetchWithoutResult(requestUrl: string, method: string, body: any = null) {
	try {
		var response = await fetch(
			requestUrl, 
			{ method, body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }
		);
		return response.ok;
	} catch {
		return false
	}
}

export async function fetchResult<T>(requestUrl: string, method: string = "GET", body: any = null) {
	try {
		var response = await fetch(
			requestUrl, 
			{ method, body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }
		);
		if (!response.ok) {
			return null;
		}
		return (await response.json()) as T
	} catch {
		return null
	}
}