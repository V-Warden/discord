import type { ImportSelect, UserSelect } from "@warden/database";

const typeOrder = ["OTHER", "LEAKER", "CHEATER", "SUPPORTER", "OWNER"];

/**
 * Formats the user status string.
 * @param status - The status string to format.
 * @returns The formatted status string.
 */
const formatStatus = (status: string): string => {
	if (status === "APPEALED") {
		return "Appealed";
	}
	if (status === "BLACKLISTED") {
		return "Blacklisted";
	}
	if (status === "PERM_BLACKLISTED") {
		return "Perm Blacklisted";
	}
	if (status === "WHITELISTED") {
		return "Whitelisted";
	}
	return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

/**
 * Formats the user type string.
 * @param type - The type string to format.
 * @returns The formatted type string.
 */
const formatType = (type: string): string => {
	if (type === "OTHER") {
		return "Other";
	}
	if (type === "LEAKER") {
		return "Leaker";
	}
	if (type === "CHEATER") {
		return "Cheater";
	}
	if (type === "SUPPORTER") {
		return "Supporter";
	}
	if (type === "OWNER") {
		return "Owner";
	}
	if (type === "BOT") {
		return "Bot";
	}
	return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
};

/**
 * Returns all types for a user in a specific order.
 * @param userType - The user.
 * @param importTypes - The import.
 * @returns The types for a user.
 */
const getAllTypes = (userType: UserSelect, importTypes: ImportSelect[]) => {
	const types = new Set<string>();
	types.add(userType.type);
	for (const importType of importTypes) {
		if (importType.type !== null) {
			types.add(importType.type);
		}
	}
	return Array.from(types).sort(
		(a, b) => typeOrder.indexOf(a) - typeOrder.indexOf(b),
	);
};

export { formatStatus, formatType, getAllTypes };
