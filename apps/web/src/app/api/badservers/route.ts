import { findBadServerById, getBadServers } from '@warden/database'
import { type NextRequest, NextResponse } from 'next/server'

const mapServerType = (type: string) => {
	switch (type) {
		case 'CHEATING':
			return 'Cheating'
		case 'LEAKING':
			return 'Leaking'
		case 'RESELLING':
		case 'ADVERTISING':
		case 'OTHER':
			return 'Other'
		default:
			return type
	}
}

const getServers = async (limit: number, offset: number) => {
	const result = await getBadServers(limit, offset)
	const servers = result.badServers.map(server => {
		if (server) {
			const { updatedBy, createdBy, updatedAt, invite, oldNames, type, ...filteredServer } = server
			return { ...filteredServer, type: mapServerType(type) }
		}
		return null
	})
	return { servers, count: result.count }
}

const getServer = async (id: string) => {
	const server = await findBadServerById(id)
	if (!server) return null
	const { updatedBy, createdBy, updatedAt, invite, oldNames, type, ...filteredServer } = server
	return { ...filteredServer, type: mapServerType(type) }
}

export const GET = async (req: NextRequest) => {
	const { searchParams } = new URL(req.url)
	const search = searchParams.get('search') || false
	const offset = Number.parseInt(searchParams.get('offset') || '0', 10)

	if (search) {
		const serverResult = await getServer(search)
		return NextResponse.json({ servers: serverResult ? [serverResult] : [], count: serverResult ? 1 : 0 })
	}
	const serversResult = await getServers(10, offset)
	return NextResponse.json(serversResult)
}
