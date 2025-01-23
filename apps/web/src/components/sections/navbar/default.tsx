import { Button } from '@/components/ui/button'
import { faShield } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'
import {
	Navbar as NavbarComponent,
	NavbarLeft,
	NavbarRight,
} from '../../ui/navbar'

export default function Navbar() {
	return (
		<header className='top-0 z-50 p-0 m-0 sticky border-b-2 bg-black/50 border-solid border-slate-700 overflow-hidden'>
			<div className='absolute left-0 h-24 w-full bg-background/15 backdrop-blur-lg' />
			<div className='relative mx-auto max-w-container pb-1 pt-1 px-5'>
				<NavbarComponent>
					<NavbarLeft>
						<Link href='/' className='flex items-center gap-2 text-xl font-bold'>
							<FontAwesomeIcon
								icon={faShield}
								width={20}
								className='text-primary text-xl'
							/>{' '}
							Warden
						</Link>
					</NavbarLeft>
					<NavbarRight>
						<Button variant='outline' size='lg' asChild>
							<a href='https://discord.gg/MVNZR73Ghf'>Join Warden</a>
						</Button>
						<Button variant='default' size='lg' asChild>
							<a href='/'>Sign in</a>
						</Button>
					</NavbarRight>
				</NavbarComponent>
			</div>
		</header>
	)
}
