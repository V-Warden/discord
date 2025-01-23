import Footer from '@/components/sections/footer/default'
import Navbar from '@/components/sections/navbar/default'
import Glow from '@/components/ui/glow'
import type { Metadata } from 'next'

import { Roboto } from 'next/font/google'
import './globals.css'

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

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang='en'>
			<head>
				<style>{`:root { ${fontRoboto.variable}: ${fontRoboto.style.fontFamily}; }`}</style>
			</head>
			<body
				className={`${fontRoboto.variable} dark overflow-x-hidden font-roboto`}
			>
				<Navbar />
				<div className='noise-overlay absolute top-0 left-0 w-full h-full z-10 animate-appear opacity-0'>
					<div className='noise w-full h-full opacity-50' />
				</div>
				<main className='relative bg-transparent z-40'>
					<Glow
						variant='top'
						className='animate-appear-zoom opacity-0 delay-00'
						aria-hidden={true}
					/>
					<div className='relative z-30'>{children}</div>
				</main>
				<Footer />
			</body>
		</html>
	)
}
