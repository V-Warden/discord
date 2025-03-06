import type { EmbedField } from "@discordeno/bot";

const icon =
	"https://cdn.discordapp.com/avatars/874059310869655662/664df2f6618282fdfffa75976d8d4903.webp?size=64";

const colors = {
	blue: 0xb7c9cf, // #b7c9cf
	green: 0x99ff99, // #99ff99
	orange: 0xffd1b3, // #ffd1b3
	red: 0xffb3b3, // #ffb3b3
};

/**
 * Create an embed with the info color
 * @param title The title of the embed
 * @param description The description of the embed
 * @param fields The fields of the embed
 * @returns The embed
 */
const embedInfo = (
	title: string,
	description?: string,
	fields?: EmbedField[],
) => {
	return {
		title: title,
		description: description,
		color: colors.blue,
		fields: fields,
		timestamp: new Date().toISOString(),
		footer: {
			text: "Warden",
			iconUrl: icon,
		},
	};
};

/**
 * Create an embed with the error color
 * @param title The title of the embed
 * @param description The description of the embed
 * @param fields The fields of the embed
 * @returns The embed
 */
const embedError = (
	title: string,
	description?: string,
	fields?: EmbedField[],
) => {
	return {
		title: title,
		description: description,
		color: colors.red,
		fields: fields,
		timestamp: new Date().toISOString(),
		footer: {
			text: "Warden",
			iconUrl: icon,
		},
	};
};

/**
 * Create an embed with the success color
 * @param title The title of the embed
 * @param description The description of the embed
 * @param fields The fields of the embed
 * @returns The embed
 */
const embedSuccess = (
	title: string,
	description?: string,
	fields?: EmbedField[],
) => {
	return {
		title: title,
		description: description,
		color: colors.green,
		fields: fields,
		timestamp: new Date().toISOString(),
		footer: {
			text: "Warden",
			iconUrl: icon,
		},
	};
};

/**
 * Create an embed with the warning color
 * @param title The title of the embed
 * @param description The description of the embed
 * @param fields The fields of the embed
 * @returns The embed
 */
const embedWarning = (
	title: string,
	description?: string,
	fields?: EmbedField[],
) => {
	return {
		title: title,
		description: description,
		color: colors.orange,
		fields: fields,
		timestamp: new Date().toISOString(),
		footer: {
			text: "Warden",
			iconUrl: icon,
		},
	};
};

export { embedInfo, embedError, embedSuccess, embedWarning };
