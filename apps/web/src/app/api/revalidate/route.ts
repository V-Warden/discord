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
	const type = searchParams.get('type') || false

	if (userId === false) {
		return NextResponse.json({ status: 'error', message: 'Missing userId' }, {
			status: 400,
		})
	}

	if (type === false) {
		return NextResponse.json({ status: 'error', message: 'Missing type' }, { status: 400 })
	}

	if (userId !== token.providerAccountId) return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 })

	if (type === 'check') {
		revalidateTag(`guilds-${userId}`)
		revalidateTag(`badservers-${userId}`)
		revalidateTag(`hash-${userId}`)

		return NextResponse.json({ status: 'success', message: 'Done' })
	}

	if (type === 'roles') {
		revalidateTag(`roles-${userId}`)

		return NextResponse.json({ status: 'success', message: 'Done' })
	}
}
