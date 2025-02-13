import { findPunishmentById, updatePunishment } from '@warden/database/functions'
import { getToken } from "next-auth/jwt"
import { type NextRequest, NextResponse } from 'next/server'

class FetchError extends Error {
	constructor(message: string, public status: number) {
		super(message)
		this.name = 'FetchError'
	}
}

interface Role {
	id: string
	name: string
	permissions: number
}

interface GuildSettings {
	enabled: boolean
	roleId: string
	unban: {
		other: boolean
		owner: boolean
		leaker: boolean
		cheater: boolean
		enabled: boolean
		supporter: boolean
	}
	owner: string
	supporter: string
	leaker: string
	cheater: string
	other: string
}

const ADMINISTRATOR_PERMISSION = 0x8

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

const fetchIfAdmin = async (guildId: string, userId: string): Promise<boolean> => {
	try {
		const memberResponse = await fetchWithRetry(`https://discord.com/api/guilds/${guildId}/members/${userId}`, {
			headers: getAuthHeaders(process.env.DISCORD_TOKEN ?? '', true),
		})
		const member = await memberResponse.json()

		const guildResponse = await fetchWithRetry(`https://discord.com/api/guilds/${guildId}`, {
			headers: getAuthHeaders(process.env.DISCORD_TOKEN ?? '', true),
		})
		const guild = await guildResponse.json()

		if (guild.owner_id === userId) {
			return true
		}

		if (member.user.id === userId && member.roles?.length > 0) {
			const rolesResponse = await fetchWithRetry(`https://discord.com/api/guilds/${guildId}/roles`, {
				headers: getAuthHeaders(process.env.DISCORD_TOKEN ?? '', true),
			})
			const roles: { id: string, permissions: number }[] = await rolesResponse.json()

			let permissions = 0
			for (const roleId of member.roles) {
				const role = roles.find(role => role.id === roleId)
				if (role) {
					permissions |= role.permissions
				}
			}

			if (permissions & ADMINISTRATOR_PERMISSION) {
				return true
			}
		}
		return false
	} catch (error) {
		console.error('Error fetching member, roles, or guild:', (error as Error).message)
		return false
	}
}

const fetchGuildRoles = async (guildId: string): Promise<Role[]> => {
	try {
		const response = await fetchWithRetry(`https://discord.com/api/guilds/${guildId}/roles`, {
			headers: getAuthHeaders(process.env.DISCORD_TOKEN ?? '', true),
		})
		return response.json()
	} catch (error) {
		console.error('Error fetching roles:', (error as Error).message)
		return []
	}
}

const fetchGuildSettings = async (guildId: string): Promise<GuildSettings> => {
	const settings = await findPunishmentById(guildId)
	if (!settings) {
		throw new FetchError('Guild settings not found', 404)
	}

	const { guildId: _, createdAt, updatedAt, createdBy, updatedBy, ...filteredSettings } = settings

	return filteredSettings as GuildSettings
}

export const GET = async (req: NextRequest) => {
	const token = await getToken({ req })

	if (!token || !token.accessToken) {
		return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 })
	}

	const { searchParams } = new URL(req.url)
	const guildId = searchParams.get('guildid') || false
	const userId = searchParams.get('userid') || false

	if (guildId && userId) {
		const isAdmin = await fetchIfAdmin(guildId, userId)
		if (isAdmin) {
			try {
				const roles = await fetchGuildRoles(guildId)
				const settings = await fetchGuildSettings('1258775623929692322')

				return NextResponse.json({ status: 'success', roles, settings })
			} catch (error) {
				return NextResponse.json({ status: 'error', message: (error as Error).message }, { status: (error as FetchError).status })
			}
		}

		return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 })
	}

	return NextResponse.error()
}

export const PATCH = async (req: NextRequest) => {
	const body = await req.json()
	if (!body) {
		return NextResponse.json({ status: 'error', message: 'Invalid request body' }, { status: 400 })
	}
	const guildId = body.guildId
	const userId = body.userId
	const data = body.data

	if (guildId && userId) {
		const isAdmin = await fetchIfAdmin(guildId, userId)
		if (isAdmin) {
			try {
				console.log(data.roleid)
				await updatePunishment(guildId, {
					enabled: data.enabled,
					roleId: data.roleid === 'none' ? null : data.roleid,
					unban: {
						enabled: data.unbanenabled,
						other: data.unbanother,
						owner: data.unbanowner,
						leaker: data.unbanleaker,
						cheater: data.unbancheater,
						supporter: data.unbansupporter,
					},
					owner: data.punishmentowner,
					supporter: data.punishmentsupporter,
					cheater: data.punishmentcheater,
					leaker: data.punishmentleaker,
					other: data.punishmentother,
				})
				return NextResponse.json({ status: 'success', message: 'Punishment updated' })
			} catch (error) {
				console.error(error)
				return NextResponse.json({ status: 'error', message: (error as Error).message }, { status: 500 })
			}
		}

		return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 })
	}

	return NextResponse.error()
}
