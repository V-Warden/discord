import { faHeart, faLock, faPen } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Item, ItemDescription, ItemIcon, ItemTitle } from '../../ui/item'
import { Section } from '../../ui/section'

export default function Items() {
	return (
		<Section className='z-50 relative bg-transparent'>
			<div className='mx-auto flex max-w-container flex-col items-center gap-6 sm:gap-20'>
				<h2 className='max-w-[560px] text-center text-3xl font-semibold leading-tight sm:text-5xl sm:leading-tight animate-appear opacity-0 delay-300'>
					Features
				</h2>
				<div className='grid auto-rows-fr grid-cols-1 gap-0 sm:grid-cols-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-3'>
					<Item className='animate-appear opacity-0 delay-300'>
						<FontAwesomeIcon
							icon={faHeart}
							className='text-primary text-4xl mb-2'
							width={31.5}
						/>{' '}
						<ItemTitle className='flex items-center gap-2'>
							Created with Passion
						</ItemTitle>
						<ItemDescription>
							We strive to try and help the leaking and cheating problems within the
							CFX Community. By using Warden, you can help too!
						</ItemDescription>
					</Item>
					<Item className='animate-appear opacity-0 delay-300'>
						<FontAwesomeIcon
							icon={faPen}
							className='text-primary text-4xl mb-2'
							width={31.5}
						/>{' '}
						<ItemTitle className='flex items-center gap-2'>
							You're in Control
						</ItemTitle>
						<ItemDescription>
							Warden has been designed to let you use it how you see fit. Configure it
							to your hearts desire.
						</ItemDescription>
					</Item>
					<Item className='animate-appear opacity-0 delay-300'>
						<FontAwesomeIcon
							icon={faLock}
							className='text-primary text-4xl mb-2'
							width={31.5}
						/>{' '}
						<ItemTitle className='flex items-center gap-2'>Always Watching</ItemTitle>
						<ItemDescription>
							Warden is constantly inspecting new users who join your discord, offering
							you peace of mind.
						</ItemDescription>
					</Item>
				</div>
			</div>
		</Section>
	)
}
