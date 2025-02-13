import Footer from '@/components/sections/footer/default'
import Navbar from '@/components/sections/navbar/default'
import Glow from '@/components/ui/glow'
import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import SessionProviderWrapper from '@/lib/SessionProviderWrapper'

const fontRoboto = Roboto({
	variable: '--font-roboto',
	subsets: ['latin'],
	weight: ['400', '700'],
	display: 'swap', // Ensure the font is swapped correctly
})

export const metadata: Metadata = {
	title: 'Warden',
	description:
		'We strive to try and help the leaking and cheating problems within the CFX Community. By using Warden, you can help too!',
}

const RootLayout = ({
	children,
}: Readonly<{
	children: React.ReactNode
}>) => {
	return (
		<html lang='en'>
			<head>
				<style>{`:root { ${fontRoboto.variable}: ${fontRoboto.style.fontFamily}; }`}</style>
			</head>
			<body
				className={`${fontRoboto.variable} dark overflow-x-hidden font-roboto`}
			>
				<SessionProviderWrapper>
					<Navbar />
					<div className='noise-overlay fixed top-0 left-0 w-full h-full z-10 animate-appear opacity-0 fade-bottom'>
						<div className='noise w-full h-full opacity-50' />
					</div>
					<main className='relative bg-transparent z-40 min-h-dvh-minus-211 overflow-hidden'>
						<Glow
							variant='top'
							className='animate-appear-zoom opacity-0 delay-00'
							aria-hidden={true}
						/>
						<div className='relative z-30'>{children}</div>
						<Toaster />
					</main>
					<Footer />
				</SessionProviderWrapper>
			</body>
		</html>
	)
}

export default RootLayout
