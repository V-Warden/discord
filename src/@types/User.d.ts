import { FilterType, UserStatus, UserType } from '@prisma/client';

/**
 * Interface for user data stored
 */
export interface UserData {
    id: string;
    avatar: string;
    last_username: string;
    status: UserStatus;
    user_type: UserType;
    servers: string;
    roles?: string;
    reason: string;
    filter_type: FilterType;
}
