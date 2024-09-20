export async function fetchWithoutResult(requestUrl: string, method: string = "GET", body: any = null) {
	try {
		var response = await fetch(
			method === "GET" 
				? requestUrl + ((body && new URLSearchParams(body).toString() )|| "")
				: requestUrl, 
			{ 
				method, 
				body: method === "GET" ? null : JSON.stringify(body), 
				headers: { 'Content-Type': 'application/json' } 
			}
		);
		return response.ok;
	} catch {
		return false
	}
}

export async function fetchResult<T>(requestUrl: string, method: string = "GET", body: any = null) {
	try {
		var response = await fetch(
			method === "GET" 
				? requestUrl + ((body && new URLSearchParams(body).toString() )|| "")
				: requestUrl, 
			{ 
				method, 
				body: method === "GET" ? null : JSON.stringify(body), 
				headers: { 'Content-Type': 'application/json' }
			}
		);
		if (!response.ok) {
			return null;
		}
		return (await response.json()) as T
	} catch {
		return null
	}
}