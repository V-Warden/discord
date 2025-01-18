module.exports = {
	useTabs: false,
	printWidth: 100,
	tabWidth: 2,
	semi: true,
	trailingComma: "none",
	singleQuote: true,
	plugins: [],
	overrides: [
		{
			files: "**/*.svx",
			options: { parser: "markdown" },
		},
		{
			files: "**/*.ts",
			options: { parser: "typescript" },
		},
		{
			files: "**/CHANGELOG.md",
			options: {
				requirePragma: true,
			},
		},
	],
};
