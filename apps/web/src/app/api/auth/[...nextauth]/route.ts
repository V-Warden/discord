import { findGuildById } from '@warden/database/functions'
import NextAuth from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'

declare module 'next-auth' {
	interface Session {
		adminGuilds: GuildWithRoles[]
		accessToken?: string
	}
}

interface Guild {
	id: string
	name: string
	permissions: number
	owner: boolean
}

interface Role {
	id: string
	name: string
	permissions: number
}

interface GuildWithRoles extends Guild {
	roles: Role[]
}

const ADMINISTRATOR_PERMISSION = 0x8

async function fetchWithRetry(url: string, options: RequestInit, retries = 3, backoff = 3000): Promise<Response> {
	for (let i = 0; i < retries; i++) {
		const response = await fetch(url, options)
		if (response.ok) {
			return response
		}
		if (response.status === 429 && i < retries - 1) {
			await new Promise(resolve => setTimeout(resolve, backoff * (i + 1)))
			continue
		}
		throw new Error(`Failed to fetch: ${response.statusText}`)
	}
	throw new Error('Max retries reached')
}

async function fetchGuilds(accessToken: string): Promise<Guild[]> {
	try {
		const response = await fetchWithRetry('https://discord.com/api/users/@me/guilds', {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		})
		if (!response.ok) {
			throw new Error(`Failed to fetch guilds: ${response.statusText}`)
		}
		return response.json()
	} catch (error) {
		console.error('Error fetching guilds:', (error as Error).message)
		return []
	}
}

async function fetchGuildRoles(guildId: string): Promise<Role[]> {
	try {
		const response = await fetchWithRetry(`https://discord.com/api/guilds/${guildId}/roles`, {
			headers: {
				Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
			},
		})
		if (!response.ok) {
			throw new Error(`Failed to fetch roles for guild ${guildId}: ${response.statusText}`)
		}
		return response.json()
	} catch (error) {
		console.error('Error fetching roles:', (error as Error).message)
		return []
	}
}

async function isBotInGuild(guildId: string): Promise<boolean> {
	try {
		const response = await fetchWithRetry(`https://discord.com/api/guilds/${guildId}`, {
			headers: {
				Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
			},
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
			}
			return token
		},
		async session({ session, token }) {
			session.accessToken = token.accessToken as string

			try {
				const guilds = await fetchGuilds(token.accessToken as string)

				if (Array.isArray(guilds)) {
					const adminGuilds = await Promise.all(
						guilds.map(async (guild) => {
							const dbGuild = await findGuildById(guild.id)
							if (dbGuild) {
								const botInGuild = await isBotInGuild(guild.id)
								if (botInGuild && ((guild.permissions & ADMINISTRATOR_PERMISSION) === ADMINISTRATOR_PERMISSION || guild.owner)) {
									const roles = await fetchGuildRoles(guild.id)
									return { ...guild, roles }
								}
							}
							return null
						})
					)

					session.adminGuilds = adminGuilds.filter((guild): guild is GuildWithRoles => guild !== null)
				}
			} catch (error) {
				console.error('Failed to fetch guilds:', (error as Error).message)
				session.adminGuilds = []
			}

			console.log('Session:', session)

			return session
		},
		async redirect({ url, baseUrl }) {
			return `${baseUrl}/dashboard`
		},
	},
})

export { handler as GET, handler as POST }
