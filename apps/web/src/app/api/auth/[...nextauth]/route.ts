import NextAuth from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'

const handler = NextAuth({
	providers: [
		DiscordProvider({
			clientId: process.env.DISCORD_CLIENT_ID || '',
			clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
		}),
	],
	callbacks: {
		async session({ session, token, user }) {
			// Add custom session handling logic here
			return session
		},
		async redirect({ url, baseUrl }) {
			return `${baseUrl}/dashboard`
		},
	},
})

export { handler as GET, handler as POST }
