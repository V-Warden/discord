import Link from 'next/link'
import { Footer, FooterBottom } from '../../ui/footer'

const FooterSection = () => {
	return (
		<footer className='w-full px-4 relative z-50 fade-top bg-black/30'>
			<div className='mx-auto max-w-container'>
				<Footer>
					<FooterBottom>
						<div>Warden</div>
						<div className='flex items-center gap-4'>
							<Link href='/privacy'>Privacy Policy</Link>
						</div>
					</FooterBottom>
				</Footer>
			</div>
		</footer>
	)
}

export default FooterSection
