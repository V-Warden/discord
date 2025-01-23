'use client'

import { Section } from '@/components/ui/section'
import { SessionProvider, useSession } from 'next-auth/react'

const NavbarContent = () => {
	const { data: session } = useSession()

	return (
		<Section className='md:py-0 sm:py-0 px-0'>
			{session ? 'You are signed in' : 'You are not signed in'}
		</Section>
	)
}

const Navbar = () => {
	return (
		<SessionProvider>
			<NavbarContent />
		</SessionProvider>
	)
}

export default Navbar
