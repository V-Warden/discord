/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
	verbose: true,
	projects: [
		{
			preset: "ts-jest/presets/default-esm",
			testEnvironment: "node",
			displayName: "@warden/discord",
			setupFiles: ["./test/setupTest.ts"],
			testMatch: [
				"<rootDir>/src/**/*.(test).{js,jsx,ts,tsx}",
				"<rootDir>/src/**/?(*.)(spec|test).{js,jsx,ts,tsx}",
			],
			rootDir: ".",
			modulePathIgnorePatterns: ["<rootDir>/dist/"],
			transform: {
				"^.+\\.[t]sx?$": [
					"ts-jest",
					{
						tsconfig: { moduleResolution: "Node10", module: "CommonJS" },
					},
				],
			},
		},
	],
};
