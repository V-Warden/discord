import { findGuildById } from '@warden/database/functions'
import { getToken } from "next-auth/jwt"
import { type NextRequest, NextResponse } from 'next/server'

declare module 'next-auth' {
	interface Permissions {
		adminGuilds: Guild[]
		accessToken?: string
	}
}

interface Guild {
	id: string
	name: string
	permissions: number
	owner: boolean
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
	const response = await fetchWithRetry('https://discord.com/api/users/@me/guilds', {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	})
	return response.json()
}

export const POST = async (req: NextRequest) => {
	const token = await getToken({ req })

	if (!token || !token.accessToken) {
		return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 })
	}

	let serverId: string
	try {
		const body = await req.json()
		serverId = body.serverId
	} catch (error) {
		console.error('Failed to parse request body:', (error as Error).message)
		return NextResponse.json({ status: 'error', message: 'Invalid request body' }, { status: 400 })
	}

	if (!serverId) {
		return NextResponse.json({ status: 'error', message: 'Server ID is required' }, { status: 400 })
	}

	try {
		const guilds = await fetchGuilds(token.accessToken as string)

		if (Array.isArray(guilds)) {
			const adminGuilds = await Promise.all(guilds.map(async (guild) => {
				const dbGuild = await findGuildById(guild.id)
				if (dbGuild && ((guild.permissions & ADMINISTRATOR_PERMISSION) === ADMINISTRATOR_PERMISSION || guild.owner)) {
					return guild
				}
				return null
			}))

			if (adminGuilds.some(guild => guild && guild.id === serverId)) {
				return NextResponse.json({ status: 'success', message: 'Update available' }, { status: 200 })
			}
		}
		return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 })
	} catch (error) {
		console.error('Failed to fetch guilds:', (error as Error).message)
		return NextResponse.json({ status: 'error', message: 'Internal Server Error' }, { status: 500 })
	}
}
