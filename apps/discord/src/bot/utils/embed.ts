import type { EmbedField } from "@discordeno/bot";

const colors = {
	blue: 0xb7c9cf, // #b7c9cf
	green: 0x00ff00, // #00ff00
	orange: 0xffa500, // #ffa500
	red: 0xff0000, // #ff0000
};

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
		},
	};
};

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
		},
	};
};

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
		},
	};
};

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
		},
	};
};

export { embedInfo, embedError, embedSuccess, embedWarning };
