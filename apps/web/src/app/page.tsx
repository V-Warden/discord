'use client'

import Hero from '@/components/sections/hero/default'
import Items from '@/components/sections/items/default'
import { Section } from '@/components/ui/section'

export default function Home() {
	return (
		<Section className='md:py-0 sm:py-0 px-0 min-h-dvh-minus-209'>
			<Hero
				title={
					<span>
						Hello, I'm <span className='text-primary'>Warden</span>
					</span>
				}
				content={'A bot by the CFX Community, for the CFX Community.'}
				buttonTitle={'Invite me'}
				buttonLink={
					'https://discord.com/api/oauth2/authorize?client_id=874059310869655662&permissions=8&scope=bot%20applications.commands'
				}
			/>
			<Items />
		</Section>
	)
}
