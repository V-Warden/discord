'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { signIn, signOut, useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
	Navbar as NavbarComponent,
	NavbarLeft,
	NavbarRight,
} from '../../ui/navbar'

import logo from '@/assets/warden.png'

const NavbarContent = () => {
	const { data: session } = useSession()
	const pathname = usePathname()

	return (
		<header className='top-0 z-50 p-0 m-0 sticky border-b-2 bg-black/50 border-solid border-slate-700 overflow-hidden'>
			<div className='absolute left-0 h-full w-full bg-background/15 backdrop-blur-lg' />
			<div className='relative mx-auto max-w-container pb-1 pt-1 px-3'>
				<NavbarComponent>
					<NavbarLeft className='gap-5'>
						<Link
							href='/'
							className='flex items-center gap-3 text-xl font-bold mr-3 group'
						>
							<Image
								src={logo}
								alt='Warden'
								width={32}
								height={32}
								className='rounded-full group-hover:animate-spin'
							/>
							Warden
						</Link>
						<Link
							className={`text-muted-foreground hover:text-foreground transition-colors ${
								pathname === '/bad-servers'
									? 'underline text-white/80 transition-colors'
									: ''
							}`}
							href='/bad-servers'
						>
							Bad servers
						</Link>
						<Link
							className={`text-muted-foreground hover:text-foreground transition-colors ${
								pathname === '/server-checker' ? 'underline text-white/80' : ''
							}`}
							href='/server-checker'
						>
							Server checker
						</Link>
						{(session?.guilds?.length ?? 0) > 0 ? (
							<Link
								className={`text-color/50 text-muted-foreground hover:text-foreground transition-colors animate-fade-in delay-100 opacity-0 ${
									pathname === '/dashboard' ? 'underline text-white/80' : ''
								}`}
								href='/dashboard'
							>
								Dashboard
							</Link>
						) : null}
					</NavbarLeft>
					<NavbarRight>
						{session?.user?.image ? (
							<Avatar className='animate-fade-in delay-100 opacity-0'>
								<AvatarImage src={session.user.image} />
								<AvatarFallback>CN</AvatarFallback>
							</Avatar>
						) : null}
						<Button variant='outline' size='lg' asChild>
							<a href='https://discord.gg/MVNZR73Ghf'>Join Warden</a>
						</Button>
						{session ? (
							<Button
								variant='default'
								size='lg'
								onClick={() => signOut()}
								className='animate-fade-in delay-100 opacity-0'
							>
								Logout
							</Button>
						) : (
							<Button variant='default' size='lg' onClick={() => signIn('discord')}>
								Login with Discord
							</Button>
						)}
					</NavbarRight>
				</NavbarComponent>
			</div>
		</header>
	)
}

export default NavbarContent
