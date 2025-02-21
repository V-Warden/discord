import { getToken } from "next-auth/jwt"
import { revalidateTag } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'

export const GET = async (req: NextRequest) => {
	const token = await getToken({ req })

	if (!token || !token.accessToken) {
		return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 })
	}

	const { searchParams } = new URL(req.url)
	const userId = searchParams.get('userid') || false

	if (userId !== token.providerAccountId) return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 })

	if (userId) {
		revalidateTag(`guilds-${userId}`)
		revalidateTag(`badservers-${userId}`)
		revalidateTag(`hash-${userId}`)

		return NextResponse.json({ status: 'success', message: 'Rechecking guilds and hash' })
	}

	return NextResponse.json({ status: 'error', message: 'Missing user ID' }, { status: 400 })
}
