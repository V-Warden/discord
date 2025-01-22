import Link from 'next/link'
import { Footer, FooterBottom } from '../../ui/footer'
import { ModeToggle } from '../../ui/mode-toggle'

export default function FooterSection() {
	return (
		<footer className='w-full bg-background px-4 relative z-50 fade-top'>
			<div className='mx-auto max-w-container'>
				<Footer>
					<FooterBottom>
						<div>Warden</div>
						<div className='flex items-center gap-4'>
							<Link href='/privacy'>Privacy Policy</Link>
							<ModeToggle />
						</div>
					</FooterBottom>
				</Footer>
			</div>
		</footer>
	)
}
