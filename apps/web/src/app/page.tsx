'use client'

import Hero from '@/components/sections/hero/default'
import Items from '@/components/sections/items/default'
import { Section } from '@/components/ui/section'

export default function Home() {
	return (
		<Section className='md:py-0 sm:py-0 px-0 min-h-dvh'>
			<Hero />
			<Items />
		</Section>
	)
}
