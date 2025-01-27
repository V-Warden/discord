'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Footer, FooterBottom } from '../../ui/footer'

const FooterSection = () => {
	const pathname = usePathname()

	return (
		<footer className='w-full px-4 relative z-50 fade-top bg-black/30'>
			<div className='mx-auto max-w-container'>
				<Footer>
					<FooterBottom>
						<div>Warden</div>
						<div className='flex items-center gap-4'>
							<Link
								href='/privacy'
								className={`text-color/50 text-muted-foreground hover:text-foreground transition-colors ${
									pathname === '/privacy' ? 'underline text-white/80' : ''
								}`}
							>
								Privacy Policy
							</Link>
						</div>
					</FooterBottom>
				</Footer>
			</div>
		</footer>
	)
}

export default FooterSection
