'use client'

import { Button } from '@/components/ui/button'
import { Section } from '@/components/ui/section'
import { useTheme } from 'next-themes'

export default function Hero() {
	const { resolvedTheme } = useTheme()
	let src: string

	switch (resolvedTheme) {
		case 'light':
			src = '/app-light.png'
			break
		case 'dark':
			src = '/app-dark.png'
			break
		default:
			src = '/app-dark.png'
			break
	}

	return (
		<Section className='overflow-hidden pb-0 sm:pb-0 md:pb-0 mb-12 md:mb-32'>
			<div className='mx-auto flex max-w-container flex-col gap-12 sm:gap-24'>
				<div className='flex flex-col items-center gap-6 text-center sm:gap-12'>
					<h1 className='relative z-10 inline-block animate-appear bg-gradient-to-r from-foreground opacity-0 to-muted-foreground bg-clip-text text-4xl font-semibold leading-tight text-transparent drop-shadow-2xl sm:text-6xl sm:leading-tight md:text-8xl md:leading-tight'>
						Hello, I'm <span className='text-primary'>Warden</span>
					</h1>
					<p className='text-md relative z-10 max-w-[550px] animate-appear font-medium text-muted-foreground opacity-0 delay-100 sm:text-xl'>
						A bot by the CFX Community, for the CFX Community.
					</p>
					<div className='relative z-10 flex animate-appear justify-center gap-4 opacity-0 delay-300'>
						<div className='relative z-10 flex animate-appear justify-center gap-4 opacity-0 delay-300'>
							<Button variant='default' size='lg' asChild>
								<a href='/'>Invite</a>
							</Button>
						</div>
					</div>
				</div>
			</div>
		</Section>
	)
}
