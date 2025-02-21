import { fetchGuilds } from '@/lib/discordApiUtils'
import { findBadServerById } from '@warden/database/functions'
import { createCanvas, loadImage } from 'canvas'
import { getToken } from "next-auth/jwt"
import { unstable_cacheTag as cacheTag } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'

interface Guild {
	id: string
	name: string
	icon: string | null
	banner: string | null
	owner: boolean
	permissions: number
	permissions_new: string
	features: string[]
}

const createImage = async (userId: string, randomHash: string, timestamp: number) => {
	const width = 800
	const height = 480
	const canvas = createCanvas(width, height)
	const context = canvas.getContext('2d')

	context.fillStyle = '#303846'
	context.fillRect(0, 0, width, height)

	context.strokeStyle = '#1a2436'
	context.lineWidth = 1
	for (let i = -height; i < width; i += 20) {
		context.beginPath()
		context.moveTo(i, 0)
		context.lineTo(i + height, height)
		context.stroke()
	}

	context.fillStyle = '#ca4a23'
	context.fillRect(0, 0, width, 100)

	context.fillStyle = '#ffffff'
	context.font = 'bold 20pt Arial'
	context.fillText('User volumed', 50, 60)

	context.font = '18pt Arial'
	context.fillText(`Random hash: ${randomHash}`, 50, 200)
	context.fillText(`User ID: ${userId}`, 50, 250)
	context.fillText(`UTC: ${new Date(timestamp * 1000).toUTCString()}`, 50, 300)

	context.font = 'bold 19pt Arial'
	context.fillText('Has not been found in any blacklisted servers.', 50, 400)

	await loadImage(`${process.env.NEXTAUTH_URL}/warden.png`).then((image) => {
		context.save()
		context.beginPath()
		context.arc(720, 50, 30, 0, Math.PI * 2, true)
		context.closePath()
		context.clip()
		context.drawImage(image, 690, 20, 60, 60)
		context.restore()
	})

	const buffer = canvas.toBuffer('image/png')

	return buffer
}

const createRandomHash = async (userId: string) => {
	'use cache'
	cacheTag(`hash-${userId}`)
	const hash = () => {
		return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
	}
	const timestamp = Math.floor(Date.now() / 1000)
	const randomHash = hash()

	return { randomHash, timestamp }
}

const checkGuilds = async (guilds: Guild[], userId: string) => {
	'use cache'
	cacheTag(`badservers-${userId}`)
	const badServers = []

	for (const guild of guilds) {
		const badServer = await findBadServerById(guild.id)

		if (badServer) {
			badServers.push(guild)
		}
	}

	return badServers
}

export const GET = async (req: NextRequest) => {
	const token = await getToken({ req })

	if (!token || !token.accessToken) {
		return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 })
	}

	const { searchParams } = new URL(req.url)
	const userId = searchParams.get('userid') || false

	if (userId !== token.providerAccountId) return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 })

	if (userId) {
		const guilds = await fetchGuilds(userId, token.accessToken as string)

		if (guilds.length === 0) {
			return NextResponse.json({ status: 'error', message: 'No guilds found' }, { status: 404 })
		}

		const badServers = await checkGuilds(guilds, userId)

		const { randomHash, timestamp } = await createRandomHash(userId)

		return NextResponse.json({ status: 'success', guilds: badServers, randomHash: randomHash, timestamp: timestamp })
	}

	return NextResponse.json({ status: 'error', message: 'Missing user ID' }, { status: 400 })
}

export const POST = async (req: NextRequest) => {
	const token = await getToken({ req })

	if (!token || !token.accessToken) {
		return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 })
	}

	const body = await req.json()
	if (!body) {
		return NextResponse.json({ status: 'error', message: 'Invalid request body' }, { status: 400 })
	}
	const userId = body.userId

	if (userId !== token.providerAccountId) return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 })

	if (userId) {
		const { randomHash, timestamp } = await createRandomHash(userId)
		const buffer = await createImage(userId, randomHash, timestamp)

		return new NextResponse(buffer, {
			headers: {
				'Content-Type': 'image/png',
			},
		})
	}

	return NextResponse.json({ status: 'error', message: 'Missing user ID' }, { status: 400 })
}
