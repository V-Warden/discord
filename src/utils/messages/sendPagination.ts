import {
    BaseCommandInteraction,
    Message,
    MessageActionRow,
    MessageButton,
    MessageEmbed,
} from 'discord.js';

/**
 * Creates a pagination embed
 * @param {Interaction} interaction
 * @param {MessageEmbed[]} pages
 * @param {number} timeout
 * @returns
 */

export async function sendPagination(
    interaction: BaseCommandInteraction,
    pages: MessageEmbed[],
    timeout: number
) {
    if (!pages) throw new Error('Pages are not given.');

    const buttons = [
        new MessageButton().setCustomId('previous').setLabel('Previous').setStyle('DANGER'),
        new MessageButton().setCustomId('next').setLabel('Next').setStyle('SUCCESS'),
    ];

    let page = 0;

    const row = new MessageActionRow().addComponents(buttons);

    //has the interaction already been deferred? If not, defer the reply.
    if (interaction.deferred === false) {
        await interaction.deferReply();
    }

    const curPage = (await interaction.editReply({
        embeds: [pages[page].setFooter({ text: `Page ${page + 1} / ${pages.length}` })],
        components: [row],
    })) as Message;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter = (i: any) => i.customId === buttons[0].customId || i.customId === buttons[1].customId;

    const collector = await curPage.createMessageComponentCollector({
        filter,
        time: timeout,
    });

    collector.on('collect', async i => {
        switch (i.customId) {
            case buttons[0].customId:
                page = page > 0 ? --page : pages.length - 1;
                break;
            case buttons[1].customId:
                page = page + 1 < pages.length ? ++page : 0;
                break;
            default:
                break;
        }
        await i.deferUpdate();
        await i.editReply({
            embeds: [pages[page].setFooter({ text: `Page ${page + 1} / ${pages.length}` })],
            components: [row],
        });
        collector.resetTimer();
    });

    collector.on('end', (_, reason: string) => {
        if (reason !== 'messageDelete') {
            const disabledRow = new MessageActionRow().addComponents(
                buttons[0].setDisabled(true),
                buttons[1].setDisabled(true)
            );
            curPage.edit({
                embeds: [pages[page].setFooter({ text: `Page ${page + 1} / ${pages.length}` })],
                components: [disabledRow],
            });
        }
    });

    return curPage;
}
