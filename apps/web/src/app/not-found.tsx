'use client'

import Hero from '@/components/sections/hero/default'
import { Section } from '@/components/ui/section'
import scrollToTop from '@/lib/scrollToTop'
import { useEffect } from 'react'

const NotFound = () => {
	useEffect(() => {
		scrollToTop()
	}, [])

	return (
		<Section className='md:py-0 sm:py-0 px-0'>
			<Hero
				title={
					<span>
						404 Page <span className='text-primary'>Not Found</span>
					</span>
				}
				content={'The page you are looking for does not exist.'}
				buttonTitle={'Go back home'}
				buttonLink={'/'}
			/>
		</Section>
	)
}

export default NotFound
