import { ServerType } from '@prisma/client';

export interface ProcessingData {
    id: string;
    server: string;
    server_type: ServerType;
    roles: string;
    avatar: string;
    username: string;
    is_boosting: boolean | string;
    permissions: string[];
}
