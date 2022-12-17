import {
    ActionRowBuilder,
    APIEmbed,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction,
    ComponentType,
} from 'discord.js';
import { logException } from '../logger';

export default async function (interaction: CommandInteraction, pages: APIEmbed[], time = 60000) {
    try {
        if (!interaction) throw new Error('Invalid interaction provided');
        if (!pages) throw new Error('No pages provided');
        if (!Array.isArray(pages)) throw new Error('Pages must be an array');

        if (typeof time !== 'number') throw new Error('Time must be a number');
        if (time < 30000) throw new Error('Time must be more than 30 seconds');

        if (!interaction.deferred) await interaction.deferReply();

        if (pages.length === 1) {
            const page = await interaction.editReply({
                embeds: pages,
                components: [],
            });

            return page;
        }

        const prev = new ButtonBuilder()
            .setCustomId('prev')
            .setEmoji('◀')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true);
        const home = new ButtonBuilder()
            .setCustomId('home')
            .setEmoji('🏠')
            .setStyle(ButtonStyle.Danger)
            .setDisabled(true);
        const next = new ButtonBuilder()
            .setCustomId('next')
            .setEmoji('▶')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(false);

        const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(prev, home, next);
        let index = 0;

        const currentPage = await interaction.editReply({
            embeds: [pages[index]],
            components: [buttonRow],
        });

        const collector = await currentPage.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time,
        });

        collector.on('collect', async i => {
            try {
                if (i.user.id !== interaction.user.id) return;

                if (!i.deferred) await i.deferUpdate();

                if (i.customId === 'prev') {
                    if (index > 0) index--;
                } else if (i.customId === 'home') {
                    index = 0;
                } else if (i.customId === 'next') {
                    if (index < pages.length - 1) index++;
                }

                if (index === 0) {
                    prev.setDisabled(true);
                    home.setDisabled(true);
                } else {
                    prev.setDisabled(false);
                    home.setDisabled(false);
                }

                if (index === pages.length - 1) next.setDisabled(true);
                else next.setDisabled(false);

                await currentPage.edit({
                    embeds: [pages[index]],
                    components: [buttonRow],
                });

                collector.resetTimer();
            } catch (e) {
                console.log(e);
            }
        });

        collector.on('end', async i => {
            await currentPage.edit({
                embeds: [pages[index]],
                components: [],
            });
        });

        return currentPage;
    } catch (e) {
        logException(interaction, e);
    }
    return;
}
