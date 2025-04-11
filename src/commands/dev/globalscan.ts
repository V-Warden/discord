import { Command } from '../../structures/Command'
// import actionGlobal from '../../utils/actioning/actionGlobal';
import { sendSuccess } from '../../utils/messages'

export default new Command({
    name: 'globalscan',
    description: 'Initiates a global scan',
    main: true,
    defaultMemberPermissions: 'Administrator',
    run: async ({ interaction }) => {
        sendSuccess(interaction, 'Global scan is disabled')
    },
})
