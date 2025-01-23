import Hero from '@/components/sections/hero/default'
import { Section } from '@/components/ui/section'

const Privacy = () => {
	return (
		<Section className='md:py-0 sm:py-0 px-0 min-h-dvh-minus-209'>
			<Hero
				title='Our Privacy Policy'
				content='You can download our privacy policy by clicking the button below.'
				buttonTitle='Download'
				buttonLink='/'
			/>
		</Section>
	)
}

export default Privacy
