import type { z } from "zod";
import { zUserRequired, zUserUpdateSchema } from "../schemas/user.js";
export declare function findUserById(id: string): Promise<{
    id: string;
    createdAt: Date | null;
    updatedAt: Date | null;
} | undefined>;
export declare function createUser(input: z.infer<typeof zUserRequired> & {
    id: string;
}): Promise<{
    id: string;
    createdAt: Date | null;
    updatedAt: Date | null;
}>;
export declare function updateUser(id: string, input: z.infer<typeof zUserUpdateSchema>): Promise<void>;
export declare function deleteUser(id: string): Promise<void>;
//# sourceMappingURL=user.d.ts.map