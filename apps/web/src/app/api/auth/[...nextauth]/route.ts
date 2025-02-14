import { findGuildById } from '@warden/database/functions'
import NextAuth from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'
import { unstable_cacheLife as cacheLife, revalidateTag } from 'next/cache'

declare module 'next-auth' {
	interface User {
		name: string
		email: string
		image: string
		id: string
	}

	interface Session {
		user: User
		expires: string
		accessToken: string
		guilds: Guilds[]
	}
}

interface Guild {
	id: string
	name: string
	permissions: number
	owner: boolean
}
interface Guilds extends Guild {
	id: string
	name: string
	icon: string | null
	banner: string | null
	owner: boolean
	permissions: number
	permissions_new: string
	features: string[]
}

const ADMINISTRATOR_PERMISSION = 0x8

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
			next: { tags: [userId] },
		})
		return response.json()
	} catch (error) {
		console.error('Error fetching guilds:', (error as Error).message)
		return []
	}
}

const isBotInGuild = async (userId: string, guildId: string): Promise<boolean> => {
	'use cache'
	try {
		const response = await fetchWithRetry(`https://discord.com/api/guilds/${guildId}`, {
			headers: getAuthHeaders(process.env.DISCORD_TOKEN ?? '', true),
			next: { tags: [userId] },
		})
		return response.ok
	} catch (error) {
		console.error('Error checking bot in guild:', (error as Error).message)
		return false
	}
}

const handler = NextAuth({
	providers: [
		DiscordProvider({
			clientId: process.env.DISCORD_CLIENT_ID || '',
			clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
			authorization: { params: { scope: 'identify guilds' } },
		}),
	],
	callbacks: {
		async jwt({ token, account }) {
			if (account) {
				token.accessToken = account.access_token
				token.providerAccountId = account.providerAccountId
				revalidateTag(account.providerAccountId)
			}
			return token
		},
		async session({ session, token }) {
			session.accessToken = token.accessToken as string
			session.user.id = token.providerAccountId as string

			try {
				const guilds = await fetchGuilds(session.user.id, session.accessToken)

				if (Array.isArray(guilds)) {
					const adminGuilds = await Promise.all(
						guilds.map(async (guild) => {
							const dbGuild = await findGuildById(guild.id)
							if (dbGuild) {
								const botInGuild = await isBotInGuild(session.user.id, guild.id)
								if (botInGuild && ((guild.permissions & ADMINISTRATOR_PERMISSION) === ADMINISTRATOR_PERMISSION || guild.owner)) {
									return guild
								}
							}
							return null
						})
					)

					session.guilds = adminGuilds.filter((guild): guild is Guilds => guild !== null)
				}
			} catch (error) {
				console.error('Failed to fetch guilds:', (error as Error).message)
				session.guilds = []
			}

			const sessionAge = 24 * 60 * 60 * 1000
			session.expires = new Date(Date.now() + sessionAge).toISOString()

			return session
		},
		async redirect({ baseUrl }) {
			return `${baseUrl}/dashboard`
		},
	},
})

export { handler as GET, handler as POST }
