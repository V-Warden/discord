import {
    BadServers,
    Bans,
    Guild,
    Imports,
    Notes,
    Prisma,
    PrismaClient,
    Punishments,
    Roles,
    Users,
    UserType,
} from '@prisma/client';
import { HistoryResponse, ReturnGuild } from '../@types/DB';

export class Database {
    prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    increaseAppealsStaff(id: string) {
        return this.prisma.staff.update({
            where: { id: id },
            data: {
                appeals: { increment: 1 },
            },
        });
    }

    /**
     * BadServer Getters/Setters
     */

    getBadServers(server: string[]): Promise<{ name: string }[]> {
        return this.prisma.badServers.findMany({ where: { id: { in: server } }, select: { name: true } });
    }

    getAllBadServers(): Promise<{ name: string; id: string }[]> {
        return this.prisma.badServers.findMany({ select: { id: true, name: true } });
    }

    getBadServer(lookup: Prisma.BadServersWhereInput): Promise<BadServers | null> {
        return this.prisma.badServers.findFirst({ where: lookup });
    }

    countAllBlacklistedServers(): Promise<number> {
        return this.prisma.badServers.count({});
    }

    updateBadServer(id: string, data: Prisma.BadServersUpdateInput): Promise<BadServers> {
        return this.prisma.badServers.update({ where: { id }, data });
    }

    createBadServer(data: Prisma.BadServersCreateInput): Promise<BadServers> {
        return this.prisma.badServers.create({ data });
    }

    deleteBadServer(id: string): Promise<BadServers> {
        return this.prisma.badServers.delete({ where: { id } });
    }

    /**
     * User Getters/Setters
     */
    getUser(id: string): Promise<Users | null> {
        return this.prisma.users.findUnique({ where: { id } });
    }

    deleteUser(id: string): Promise<Users | null> {
        return this.prisma.users.delete({ where: { id: id } });
    }

    getManyUsers(where: Prisma.UsersWhereInput): Promise<Users[]> {
        return this.prisma.users.findMany({
            where,
        });
    }

    async userExist(id: string): Promise<Boolean> {
        return (await this.prisma.users.count({ where: { id } })) === 1;
    }

    updateUser(id: string, data: Prisma.UsersUpdateInput): Promise<Users> {
        return this.prisma.users.update({ where: { id }, data });
    }

    countAllBlacklistedUsers(): Promise<number> {
        return this.prisma.users.count({
            where: { status: { in: ['BLACKLISTED', 'PERM_BLACKLISTED'] } },
        });
    }

    createUser(data: Prisma.UsersCreateInput): Promise<Users> {
        return this.prisma.users.create({ data });
    }

    createArchiveRole(data: Prisma.RolesCreateInput): Promise<Roles> {
        return this.prisma.roles.create({
            data,
        });
    }

    createArchiveRoles(data: Prisma.RolesCreateManyInput[]): Promise<Prisma.BatchPayload> {
        return this.prisma.roles.createMany({ data });
    }

    getAllRoles(where: Prisma.RolesWhereInput): Promise<Roles[]> {
        return this.prisma.roles.findMany({ where });
    }

    removeAllRoles(where: Prisma.RolesWhereInput): Promise<Prisma.BatchPayload> {
        return this.prisma.roles.deleteMany({ where });
    }

    countNotes(id: string): Promise<number> {
        return this.prisma.notes.count({ where: { id } });
    }

    deleteNote(nId: number): Promise<Notes> {
        return this.prisma.notes.delete({ where: { nId } });
    }

    getUserNotes(id: string) {
        return this.prisma.notes.findMany({
            where: { id },
            select: { user: true, staff: true, note: true, createdAt: true, nId: true },
        });
    }

    createNote(user: string, note: string, staff: string): Promise<Notes> {
        return this.prisma.notes.create({
            data: {
                user: {
                    connect: {
                        id: user,
                    },
                },
                note,
                staff: {
                    connectOrCreate: {
                        where: {
                            id: staff,
                        },
                        create: {
                            id: staff,
                            role: 'ADMIN',
                        },
                    },
                },
            },
        });
    }

    async getHistory(id: string): Promise<HistoryResponse[]> {
        const history: HistoryResponse[] = [];
        try {
            const dbHistory = await this.prisma.imports.findMany({
                where: { id, appealed: true },
                select: {
                    BadServer: { select: { name: true, oldNames: true, id: true } },
                    type: true,
                    roles: true,
                    createdAt: true,
                },
            });

            for (let i = 0; i < dbHistory.length; i++) {
                const x = dbHistory[i];

                if (x.roles.includes('"servers":')) {
                    const parsed = JSON.parse(x.roles);
                    const servers = parsed['servers'].split(';');

                    try {
                        const badServers = await this.prisma.badServers.findMany({
                            where: { id: { in: servers } },
                            select: { name: true },
                        });

                        const names = badServers.map(x => x.name);
                        const roles = parsed['roles'].split(';');

                        history.push({ name: 'Legacy Data', servers: names, roles });
                    } catch (d) {
                        console.log(d);
                    }
                } else {
                    history.push({ name: x.BadServer.name, roles: x.roles, type: x.type });
                }
            }
        } catch (e) {
            console.log(e);
        }

        return history;
    }

    getAppealedImports(id: string) {
        return this.prisma.imports.findMany({
            where: { id, appealed: true },
            select: {
                BadServer: true,
                server: true,
                roles: true,
                type: true,
                createdAt: true,
            },
        });
    }

    getImports(id: string) {
        return this.prisma.imports.findMany({
            where: { id, appealed: false },
            select: {
                BadServer: true,
                server: true,
                roles: true,
                type: true,
                createdAt: true,
            },
        });
    }

    getAllImports(id: string) {
        return this.prisma.imports.findMany({
            where: { id },
            select: {
                BadServer: true,
                server: true,
                roles: true,
                type: true,
                createdAt: true,
                appealed: true,
            },
        });
    }

    getAllImportsByBadServer(id: string) {
        return this.prisma.imports.findMany({
            where: { server: id },
            select: {
                User: {
                    select: {
                        servers: true,
                        id: true,
                        type: true,
                        status: true,
                    },
                },
            },
        });
    }

    async failSafeStatus(user: Users): Promise<boolean> {
        const allImports = await this.getAllImports(user.id);

        const countAll = allImports.length;
        const appealedCount = allImports.filter(x => x.appealed === true).length;
        if (countAll === appealedCount) {
            await this.updateUser(user.id, { status: 'APPEALED' });
            return true;
        }

        return false;
    }

    countUnappealedImports(id: string): Promise<number> {
        return this.prisma.imports.count({ where: { id, appealed: false } });
    }

    appealImports(id: string): Promise<Prisma.BatchPayload> {
        return this.prisma.imports.updateMany({ where: { id, appealed: false }, data: { appealed: true } });
    }

    appealSpecificImport(id: string, server: string): Promise<Imports> {
        return this.prisma.imports.update({
            where: { id_server: { id: id, server: server } },
            data: { appealed: true },
        });
    }

    createImport(id: string, server: string, type: UserType): Promise<Imports> {
        return this.prisma.imports.upsert({
            where: { id_server: { id, server } },
            create: {
                User: {
                    connect: {
                        id: id,
                    },
                },
                BadServer: {
                    connect: {
                        id: server,
                    },
                },
                type,
                roles: 'Undefined',
                appealed: false,
            },
            update: {
                type,
                appealed: false,
            },
        });
    }

    getAllGuilds(where: Prisma.GuildWhereInput, select?: Prisma.GuildSelect): Promise<ReturnGuild[]> {
        return this.prisma.guild.findMany({
            where,
            select,
        });
    }

    createGuild(data: Prisma.GuildCreateInput): Promise<Guild> {
        return this.prisma.guild.create({ data });
    }

    getGuild(where: Prisma.GuildWhereInput, select?: Prisma.GuildSelect): Promise<ReturnGuild | null> {
        return this.prisma.guild.findFirst({
            where,
            select,
        });
    }

    updateGuild(where: Prisma.GuildWhereUniqueInput, data: Prisma.GuildUpdateInput): Promise<Guild> {
        return this.prisma.guild.update({ where, data });
    }

    updatePunishments(
        where: Prisma.PunishmentsWhereUniqueInput,
        data: Prisma.PunishmentsUpdateInput
    ): Promise<Punishments> {
        return this.prisma.punishments.update({ where, data });
    }

    getAllBans(where: Prisma.BansWhereInput): Promise<Bans[]> {
        return this.prisma.bans.findMany({ where });
    }

    removeAllBans(where: Prisma.BansWhereInput): Promise<Prisma.BatchPayload> {
        return this.prisma.bans.deleteMany({ where });
    }

    createBan(data: Prisma.BansCreateInput): Promise<Bans> {
        return this.prisma.bans.create({ data });
    }

    createBans(data: Prisma.BansCreateManyInput[]): Promise<Prisma.BatchPayload> {
        return this.prisma.bans.createMany({ data });
    }

    findHighestType(types: UserType[]): UserType {
        if (types.includes('OWNER')) return 'OWNER';
        else if (types.includes('SUPPORTER')) return 'SUPPORTER';
        else if (types.includes('CHEATER')) return 'CHEATER';
        else if (types.includes('LEAKER')) return 'LEAKER';
        else if (types.includes('OTHER')) return 'OTHER';
        else if (types.includes('BOT')) return 'BOT';

        return types[0];
    }
}
