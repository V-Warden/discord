import { Colours } from '../../@types/Colours'
import { Command } from '../../structures/Command'
import logger from '../../utils/logger'
import sendEmbed from '../../utils/messages/sendEmbed'

export default new Command({
    name: 'about',
    description: 'Information about this bot, its purpose and author',
    run: async ({ interaction }) => {
        logger.info({
            labels: { command: 'about', userId: interaction?.user?.id, guildId: interaction?.guild?.id },
            message: `${interaction?.user?.tag} (${interaction?.user?.id}) requested information about the bot`,
        })

        return sendEmbed({
            interaction,
            embed: {
                title: 'About Me',
                description: `Hello, my name is VVarden!
                          You can call me Warden or 5 Warden (V Warden).
                          \nI was created by Vampire#8144 in an effort to combat the prevalence of pirated code and cheating within the FiveM community.
                          \nI am the frontend for a database of users in Leaking and Cheating Discord servers, with settings to prevent those users from entering your discord server.
                          \nYou can join the Official Discord for more information: <https://discord.com/invite/MVNZR73Ghf>
                          \nFeel free to contribute here: <https://github.com/V-Warden/discord>`,
                color: Colours.BLUE,
            },
        })
    },
})
