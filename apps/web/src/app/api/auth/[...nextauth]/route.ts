import {
	fetchGuilds,
	fetchWithRetry,
	getAuthHeaders,
} from "@/lib/discordApiUtils";
import { findGuildById } from "@warden/database";
import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { revalidateTag } from "next/cache";

declare module "next-auth" {
	interface User {
		name: string;
		email: string;
		image: string;
		id: string;
	}

	interface Session {
		user: User;
		expires: string;
		accessToken: string;
		guilds: Guild[];
	}
}

interface Guild {
	id: string;
	name: string;
	icon: string | null;
	banner: string | null;
	owner: boolean;
	permissions: number;
	permissions_new: string;
	features: string[];
}

const ADMINISTRATOR_PERMISSION = 0x8;

const isBotInGuild = async (
	userId: string,
	guildId: string,
): Promise<boolean> => {
	"use cache";
	try {
		const response = await fetchWithRetry(
			`https://discord.com/api/guilds/${guildId}`,
			{
				headers: getAuthHeaders(process.env.DISCORD_TOKEN ?? "", true),
				next: { tags: [`bot-${userId}`] },
			},
		);
		return response.ok;
	} catch (error) {
		console.error("Error checking bot in guild:", (error as Error).message);
		return false;
	}
};

const handler = NextAuth({
	providers: [
		DiscordProvider({
			clientId: process.env.DISCORD_CLIENT_ID || "",
			clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
			authorization: { params: { scope: "identify guilds" } },
		}),
	],
	callbacks: {
		async jwt({ token, account }) {
			if (account) {
				token.accessToken = account.access_token;
				token.providerAccountId = account.providerAccountId;
				revalidateTag(`guilds-${account.providerAccountId}`);
				revalidateTag(`bot-${account.providerAccountId}`);
				revalidateTag(`roles-${account.providerAccountId}`);
				revalidateTag(`hash-${account.providerAccountId}`);
				revalidateTag(`badservers-${account.providerAccountId}`);
			}
			return token;
		},
		async session({ session, token }) {
			session.accessToken = token.accessToken as string;
			session.user.id = token.providerAccountId as string;

			try {
				const guilds = await fetchGuilds(session.user.id, session.accessToken);

				if (Array.isArray(guilds)) {
					const adminGuilds = await Promise.all(
						guilds.map(async (guild) => {
							const dbGuild = await findGuildById(guild.id);
							if (dbGuild) {
								const botInGuild = await isBotInGuild(
									session.user.id,
									guild.id,
								);
								if (
									botInGuild &&
									((guild.permissions & ADMINISTRATOR_PERMISSION) ===
										ADMINISTRATOR_PERMISSION ||
										guild.owner)
								) {
									return {
										...guild,
										icon: guild.icon ?? null,
										banner: guild.banner ?? null,
										permissions_new: guild.permissions_new ?? "",
										features: guild.features ?? [],
									} as Guild;
								}
							}
							return null;
						}),
					);

					session.guilds = adminGuilds.filter(
						(guild): guild is Guild => guild !== null,
					);
				}
			} catch (error) {
				console.error("Failed to fetch guilds:", (error as Error).message);
				session.guilds = [];
			}

			return session;
		},
	},
});

export { handler as GET, handler as POST };
