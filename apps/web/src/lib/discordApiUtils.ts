interface Guild {
	id: string
	name: string
	icon: string
	banner: string
	owner: boolean
	permissions: number
	permissions_new: string
	features: string[]
}

class FetchError extends Error {
	constructor(message: string, public status: number) {
		super(message)
		this.name = 'FetchError'
	}
}

const getAuthHeaders = (token: string, isBot = false): HeadersInit => {
	return {
		Authorization: `${isBot ? 'Bot' : 'Bearer'} ${token}`,
	}
}

const fetchWithRetry = async (url: string, options: RequestInit, retries = 3, backoff = 3000): Promise<Response> => {
	for (let i = 0; i < retries; i++) {
		const response = await fetch(url, options)
		if (response.ok) {
			return response
		}
		if (response.status === 429 && i < retries - 1) {
			await new Promise(resolve => setTimeout(resolve, backoff * (i + 1)))
			continue
		}
		throw new FetchError(`Failed to fetch: ${response.statusText}`, response.status)
	}
	throw new FetchError('Max retries reached', 500)
}

const fetchGuilds = async (userId: string, accessToken: string): Promise<Guild[]> => {
	'use cache'
	try {
		const response = await fetchWithRetry('https://discord.com/api/users/@me/guilds', {
			headers: getAuthHeaders(accessToken),
			next: { tags: [`guilds-${userId}`] },
		})
		return response.json()
	} catch (error) {
		console.error('Error fetching guilds:', (error as Error).message)
		return []
	}
}

export { getAuthHeaders, fetchWithRetry, fetchGuilds }
