import Hero from '@/components/sections/hero/default'
import { Section } from '@/components/ui/section'

const Privacy = () => {
	return (
		<Section className='md:py-0 sm:py-0 px-0'>
			<Hero
				title='Our Privacy Policy'
				content='You can download our privacy policy by clicking the button below.'
				buttonTitle='Download'
				buttonLink='/Warden_Privacy_Policy.pdf'
			/>
		</Section>
	)
}

export default Privacy
