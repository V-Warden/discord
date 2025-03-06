import type { ImportSelect, UserSelect } from "@warden/database";

export type UserCheck = {
	user: UserSelect;
	imports: ImportSelect[];
};
