import { MenuType } from '../@types'

export class ContextMenu {
    constructor(menuOptions: MenuType) {
        Object.assign(this, menuOptions)
    }
}
