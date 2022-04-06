# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.2.1](https://github.com/t3xtm3/VVarden/compare/v1.2.0...v1.2.1) (2022-04-03)


### Features

* **upstatus:** update appeals manually ([90bac5a](https://github.com/t3xtm3/VVarden/commit/90bac5af2e862a3ca2f2fc2029c98bb4815591bf))


### Bug Fixes

* **appeal:** remove embed on catch ([94b3544](https://github.com/t3xtm3/VVarden/commit/94b35446982441ea8225d23d57837456b3f70c13))
* **cooldowns:** change to a guild level cooldown ([ca0ca47](https://github.com/t3xtm3/VVarden/commit/ca0ca4748d8152a78d19f33e5ebc0f562cf08de6))
* **fixguild:** change from integer to string ([4d6d019](https://github.com/t3xtm3/VVarden/commit/4d6d019152d45ab43afbd0d0eddfa2357b1c1060))
* **fixguild:** change from user type to integer ([24797b1](https://github.com/t3xtm3/VVarden/commit/24797b1ea3b7e751d2d98b609fcaec9ce50f5e2f))
* **messages/sendEmbed:** defer reply if not deferred ([a637fe7](https://github.com/t3xtm3/VVarden/commit/a637fe7c790a3a1d88c294b0714249a841a5e754))
* **processing:** fix types ([8f1d7ec](https://github.com/t3xtm3/VVarden/commit/8f1d7ec993f0c9fa57c2eb6696e8adf184cfe953))
* **punishUser:** add other switch ([b92b7af](https://github.com/t3xtm3/VVarden/commit/b92b7af583e83ff332cedaf9b4adbbcf2f4d8901))
* **punishUser:** add other switch ([1ff57a5](https://github.com/t3xtm3/VVarden/commit/1ff57a5f6897a6fead55bcc5e2f0c7b38ae49835))


### Chores

* **appeal:** fix logging spam ([b54c121](https://github.com/t3xtm3/VVarden/commit/b54c1213b7427bb3b8f42e7ce8cce4a0464cc06c))
* **interactionCreate:** add catch ([0b52e09](https://github.com/t3xtm3/VVarden/commit/0b52e09ebc7c1f7bf4fbaff85c3d519f517a64c8))
* **package:** remove fast-csv as imports are now json ([68424fd](https://github.com/t3xtm3/VVarden/commit/68424fd1f2e9271b07bf654248dfc5e5345249f4))
* **Processing:** optimise api calls ([5dac4cd](https://github.com/t3xtm3/VVarden/commit/5dac4cda391a27d23c45b1497206208d8294c55a))
* **ready:** delete old command(s) ([4e2f437](https://github.com/t3xtm3/VVarden/commit/4e2f437b14fd40a953f426d44852867432ffddf4))

## [1.2.0](https://github.com/t3xtm3/VVarden/compare/v1.1.0...v1.2.0) (2022-03-31)


### Features

* **badserver:** ability to update bad server name from id ([78a0ae0](https://github.com/t3xtm3/VVarden/commit/78a0ae0dde200c9c1f7120ddad1499cc4c6692c4))
* **badserver:** ability to update bad server name from id ([f75a7c0](https://github.com/t3xtm3/VVarden/commit/f75a7c012537ad994f6c214df34e5a2e9d0ac89e))
* **checkserver:** implement search by name ([f878692](https://github.com/t3xtm3/VVarden/commit/f878692a612240567cce5f7d0bef6b9ced735589))
* **checkuseradmin:** show amount of appeals ([10da2d7](https://github.com/t3xtm3/VVarden/commit/10da2d7f13fba9a7a2613305ea451e41877ee9b8))
* **fixguild:** allow bot devs to fix unknown guilds ([3085816](https://github.com/t3xtm3/VVarden/commit/308581632fe2ffcb44b01cc2d8a7a48babaf67d2))


### Bug Fixes

* **appeal:** fixed accumlator ([f932824](https://github.com/t3xtm3/VVarden/commit/f932824cfa8d134dc7edf3b202282228f15cbaec))
* **checkserver:** mention user who added ([15788ff](https://github.com/t3xtm3/VVarden/commit/15788ff5a19018f800ac3cff484b6ba222ee18a4))
* **checkuser:** added userid validation ([56d5e94](https://github.com/t3xtm3/VVarden/commit/56d5e949d85fc12e57b5bef859da98af3614b1b8))
* **guildMemberAdd:** act like any other guild for main ([1329768](https://github.com/t3xtm3/VVarden/commit/1329768785f5bce81722bf0f58cdddba0ada5525))
* **guildMemberAdd:** action on perm blacklisted in main guild ([cc49e92](https://github.com/t3xtm3/VVarden/commit/cc49e9219459caeb54dce221edfb93523422680f))
* **guildMemberAdd:** fix for main server ([f0b9731](https://github.com/t3xtm3/VVarden/commit/f0b9731519c5d4af3515b84649f054922968b0fd))
* **Logger:** implement exception and rejection logs ([369400e](https://github.com/t3xtm3/VVarden/commit/369400e5f6b0c38924dc542b8df4c33b3e551fdf))
* **Processing:** remove supporter for resellers ([257af46](https://github.com/t3xtm3/VVarden/commit/257af46dc84955c1bd65e14f4de7a6d205c04d6a))
* **Processing:** server count display ([ea7f214](https://github.com/t3xtm3/VVarden/commit/ea7f21420c6410a33277757d27a685f761373917))
* **Processing:** updated to newest importing style ([620bb6e](https://github.com/t3xtm3/VVarden/commit/620bb6eb76a7815b3bfffe1673db8fe9194376b9))
* **Processing:** updated to newest importing style ([63a3118](https://github.com/t3xtm3/VVarden/commit/63a3118c1dc9164e78332eeb6f82586979dc7be8))
* **procfile:** add whitelist functionality ([a6f4c12](https://github.com/t3xtm3/VVarden/commit/a6f4c1237341fdf2d99ff4c01ed9756be2f24b16))
* **procfile:** fix whitelist functionality ([fa59822](https://github.com/t3xtm3/VVarden/commit/fa59822ab196251d26d05db84e93589c80bd867d))
* **procfile:** fix whitelisting ([67bcf49](https://github.com/t3xtm3/VVarden/commit/67bcf497bfc8f94140b74729aa01a27baf4eac1a))
* **procfile:** optimisation ([d57ef5f](https://github.com/t3xtm3/VVarden/commit/d57ef5fdcff254bed71fe15108598ec980a73c36))
* **procfile:** update user status on update ([95bfe17](https://github.com/t3xtm3/VVarden/commit/95bfe17f83732fa670d9c161a7e3338d5d53701e))
* **punishUser:** fix cache channel not updating to real ([d9cae4b](https://github.com/t3xtm3/VVarden/commit/d9cae4bc524a1d2bd7b4764efb6ef9e26dcf4f85))


### Chores

* **anonymise:** cleanup ([6027fb4](https://github.com/t3xtm3/VVarden/commit/6027fb4ac6c0259c3220d8d608863e6d0d30fefb))
* **badserver:** remove log ([8bbc30a](https://github.com/t3xtm3/VVarden/commit/8bbc30aeef9774bd3f51135b0e992d979d709ee8))
* **badservers:** changed badserver to badservers ([f780f71](https://github.com/t3xtm3/VVarden/commit/f780f713e3142dcf95edb58401baa679b98830df))
* **badservers:** changed dev commands to use bsm ([4df6abe](https://github.com/t3xtm3/VVarden/commit/4df6abeb8f2a35f8512e4a92e6da1da708787643))
* **CHANGELOG:** update ([153efbb](https://github.com/t3xtm3/VVarden/commit/153efbbe0b262201f8089a4cb4d9007eb3af9a4d))
* **checkserver:** cleanup ([5e6d82f](https://github.com/t3xtm3/VVarden/commit/5e6d82fddc5f727bd4591923cf1509c62fa3ff48))
* cleanup ([022154f](https://github.com/t3xtm3/VVarden/commit/022154f9c28331a5899784f52147b8b276c3e31f))
* **commands/dev:** changed descriptions ([fb97318](https://github.com/t3xtm3/VVarden/commit/fb9731825ca10b18bb5c5f75b9e3aaddda879b82))
* **forcecheck:** optimise by ~1.7x ([84dc9c6](https://github.com/t3xtm3/VVarden/commit/84dc9c6a8d53d5a7448bb42c7007b0ebabfb69dd))
* **guildMemberAdd:** update logging ([dfb08ba](https://github.com/t3xtm3/VVarden/commit/dfb08ba25b46539d3622674b0ea4313238b41345))
* **procfile:** cleanup ([cbdb709](https://github.com/t3xtm3/VVarden/commit/cbdb70914150c275eee54b5e3adb47b93c997667))
* **scanusers:** cleanup ([fd7ac50](https://github.com/t3xtm3/VVarden/commit/fd7ac50de17c489e0adc0055134f451b7c35a1de))

## 1.1.0 (2022-03-27)


### Features

* **anonymize:** Add Anonymize Command ([#7](https://github.com/t3xtm3/VVarden/issues/7)) ([731b9a0](https://github.com/t3xtm3/VVarden/commits/ts-refactor/731b9a04cccb23575895c4cc71ddcc4a8f23adb9))
* **automod:** Add UserID to Automod Log ([8e9da1f](https://github.com/t3xtm3/VVarden/commits/ts-refactor/8e9da1fbfad560641f2cdb2bf1569f1e4391b05a))
* **automod:** DM users when automodded ([68104a3](https://github.com/t3xtm3/VVarden/commits/ts-refactor/68104a369dadfce8a17626ff2b56a0e94e38f528))
* **badservers:** Server types added ([d0b14a0](https://github.com/t3xtm3/VVarden/commits/ts-refactor/d0b14a0c1f2075effbf2a9b713ee289ca6b82988))
* **badservers:** Server types added ([ef2a2dc](https://github.com/t3xtm3/VVarden/commits/ts-refactor/ef2a2dcdad0b5c908cc4158c8098bd39301c74ba))
* **badservers:** Upsert instead of add ([80d25b5](https://github.com/t3xtm3/VVarden/commits/ts-refactor/80d25b50aaa2765395d4ca185917a30835d232b8))
* **badservers:** View, remove and add ([9d6426a](https://github.com/t3xtm3/VVarden/commits/ts-refactor/9d6426ace37d2125805f85173e1ef37f29b270c5))
* **checkserver:** Added /checkserver <id> ([6c3108e](https://github.com/t3xtm3/VVarden/commits/ts-refactor/6c3108eb318897a043173264e68b8e98abe648d1))
* **checkuser:** Add admin checkuser command ([3ea7963](https://github.com/t3xtm3/VVarden/commits/ts-refactor/3ea7963b38caf2ca6e7293ee623c7d58ad1049eb))
* **command:** Add appeal command to quickly update user status ([6dfd450](https://github.com/t3xtm3/VVarden/commits/ts-refactor/6dfd4501cc7d704c640d0f6d009b824257359403))
* Consolidate import messages into summary; disable scan while importing ([7485ad7](https://github.com/t3xtm3/VVarden/commits/ts-refactor/7485ad7e751fd84d975297e9b7b4d810496deb71))
* **contributing:** PR Contributing Guide ([b017dc6](https://github.com/t3xtm3/VVarden/commits/ts-refactor/b017dc64b97ba8d6671819a2be68b475387091be))
* **cooldowns:** Added cooldown system to prevent abuse ([c7a31e4](https://github.com/t3xtm3/VVarden/commits/ts-refactor/c7a31e48f800018bf70d33a71b14553f75726530))
* **database:** Convert Database to Unicode for Symbols ([e8e9789](https://github.com/t3xtm3/VVarden/commits/ts-refactor/e8e9789bef71cdecda98d6a35083af7582b490e7))
* **donate:** Add Donation Command As Asked ([86b14b2](https://github.com/t3xtm3/VVarden/commits/ts-refactor/86b14b2e4d4f4c19c26f8d4153e43faca7f5a9b6))
* **enum/UserStatus:** Added whitelist option and converted to enums ([ce456ca](https://github.com/t3xtm3/VVarden/commits/ts-refactor/ce456cacd040b93419113a85f2052af9456df485))
* **forcecheck:** Add ForceCheck Command ([0824c60](https://github.com/t3xtm3/VVarden/commits/ts-refactor/0824c606206c028df57e91b3a0314e9f001e79b1))
* **globalFind:** Automod Users Global when Blacklisted ([d7da7ed](https://github.com/t3xtm3/VVarden/commits/ts-refactor/d7da7edfa91db367f02f3a7b99e9232039b5e8df))
* **interactions:** Add more interactions, fix others ([b22c3c2](https://github.com/t3xtm3/VVarden/commits/ts-refactor/b22c3c2b6d7bba0555aef2e7befd43aba9d18890))
* **interactions:** Add New Interactions ([45b377c](https://github.com/t3xtm3/VVarden/commits/ts-refactor/45b377ccfc4f63cfd8ef353bfcb67cb4e6a5955a))
* **log:** Add currently unused message wrapper ([e9169ee](https://github.com/t3xtm3/VVarden/commits/ts-refactor/e9169ee1be277577688e39c182b722b25f67ff2c))
* **logging:** Add Logging for Bot Staff Commands ([c3adda8](https://github.com/t3xtm3/VVarden/commits/ts-refactor/c3adda81ad5a4ce4f9f134024d360c395f6e1ef1))
* **mysql:** Merge MySQL2 and Prepared Statements ([edb52bd](https://github.com/t3xtm3/VVarden/commits/ts-refactor/edb52bde672dc70a3878d5d05a1e765126abb46d))
* **perms:** Add Invalid Permissions Message ([9f4aef6](https://github.com/t3xtm3/VVarden/commits/ts-refactor/9f4aef65654242bf0c34f331aa1474b40dbf353c))
* **prefix:** Set Guild Prefixes on Boot ([46c6f9b](https://github.com/t3xtm3/VVarden/commits/ts-refactor/46c6f9bf0f869cb58f1fe8ef8d8b34d3a9dbcdef))
* **procfile:** process data from imports/** folders ([606639c](https://github.com/t3xtm3/VVarden/commits/ts-refactor/606639c99edfc57cd24cdccdf591164564403e01))
* **punUser:** Improve Punish Log Msgs ([2f54011](https://github.com/t3xtm3/VVarden/commits/ts-refactor/2f54011838371ff025f9c950d18124f5e5c44f14))
* **rank:** Give Leah Special Treatment ([d49340b](https://github.com/t3xtm3/VVarden/commits/ts-refactor/d49340b4015c3b02e977f40275a7fbe7d2b29b43))
* **reactions:** Initial Example Reactions Commit ([c9732e4](https://github.com/t3xtm3/VVarden/commits/ts-refactor/c9732e4ff036b4f7de3d1a841adf39fe5bcb737e))
* setup nodemon and scripts ([665ceb4](https://github.com/t3xtm3/VVarden/commits/ts-refactor/665ceb465ceb0d1aea7e2456704f9674ed132b93))
* **sharding:** Enable Sharding ([97ffb42](https://github.com/t3xtm3/VVarden/commits/ts-refactor/97ffb429381dcf44bdf2df1879ee5b4fcc6ba08f))
* **shrink:** Shrink and Improve CU, CUA, Ping ([8a4d428](https://github.com/t3xtm3/VVarden/commits/ts-refactor/8a4d42895524e4d28ed8914630a1aa09c4e2d332))
* **status:** Add Status appealed and permblacklisted ([d9ca7d4](https://github.com/t3xtm3/VVarden/commits/ts-refactor/d9ca7d4e437e7f1f766fd4b7783db0b6bdc53404))
* **upstatus:** Add User Type to upstatus command ([aa4b4f4](https://github.com/t3xtm3/VVarden/commits/ts-refactor/aa4b4f4fc6685e39e030c5b37b82fc3f2de0bb48))


### Bug Fixes

* ./ ([d4a3f47](https://github.com/t3xtm3/VVarden/commits/ts-refactor/d4a3f4760b17d8fbb93b8942b735632c9af21f76))
* Actually require the badservers file ([09f2518](https://github.com/t3xtm3/VVarden/commits/ts-refactor/09f25181f3a8a1358883666571c54c2397eec3d6))
* **adduser:** Adduser to Developer Only ([69978f5](https://github.com/t3xtm3/VVarden/commits/ts-refactor/69978f5777c09e82b77138cffe92d2c18c73c454))
* **adduser:** Join is not valid ([3285854](https://github.com/t3xtm3/VVarden/commits/ts-refactor/32858543ca108ae43849c3cb8b98316bae5e0f8a))
* **admin:** Fix Admin Checking ([28b3a2f](https://github.com/t3xtm3/VVarden/commits/ts-refactor/28b3a2fe24c25d39f0829acb9faea9c2b1011db9))
* **automod:** Only automod blacklist kekw ([f57d091](https://github.com/t3xtm3/VVarden/commits/ts-refactor/f57d091f14eec70e78b19b8761eede517f4ad82c))
* Change message scope and ensure blacklistCount increments ([0685efe](https://github.com/t3xtm3/VVarden/commits/ts-refactor/0685efebfd9720f5849a1e06ecbc43261b96eab1))
* **checkuser:** Check if userInfo is defined ([888b522](https://github.com/t3xtm3/VVarden/commits/ts-refactor/888b5222a941eeb4f134014639ed8b63cf75bce5))
* **checkuser:** Fix roles embed value overflow ([118436d](https://github.com/t3xtm3/VVarden/commits/ts-refactor/118436d18679150badf83e525704d4d6f10d7ff1))
* **checkuser:** msg.mentions[0].id Returns User Obj not ID ([40f34c4](https://github.com/t3xtm3/VVarden/commits/ts-refactor/40f34c4b373a3f8f72a16ca4ce7d4f0a1f6d0e11))
* **connect:** Attempt to catch Connection Reset by Peer ([543060a](https://github.com/t3xtm3/VVarden/commits/ts-refactor/543060a7c54a320c4a49d0b8334c08d3f8891879))
* **CU:** Actually Remove Roles from CU ([aa8f628](https://github.com/t3xtm3/VVarden/commits/ts-refactor/aa8f628e8df60a147223c5c2904a00513f9a68e6))
* Display name from badservers; post blacklisted user to logmaster ([bc8b71e](https://github.com/t3xtm3/VVarden/commits/ts-refactor/bc8b71e61d41fca42967760db29ae220e51c8b5e))
* **DMs:** Fix Bot DMs on Kicks/Bans & Restruct ([b378c5f](https://github.com/t3xtm3/VVarden/commits/ts-refactor/b378c5fb9ca40515add8932df29cd7af29479aa0))
* **func:** Catch Bad Logchan ([1ef6459](https://github.com/t3xtm3/VVarden/commits/ts-refactor/1ef645917f480b6918906ef35969920523bac3ce))
* **functions:** properly report permanently blacklisted users ([baffc6b](https://github.com/t3xtm3/VVarden/commits/ts-refactor/baffc6b74e41a4b656db96811fc521871ab80eaf))
* **functions:** split the filename to retrieve serverid ([d3d7d07](https://github.com/t3xtm3/VVarden/commits/ts-refactor/d3d7d0788dc1343f11ca20f420c37339a858dfab))
* **GlobalPunish:** Fix Rate Limiting for fetchAllMembers ([97e47ca](https://github.com/t3xtm3/VVarden/commits/ts-refactor/97e47ca81de820cc8e2a92dd4afa0ab01d3afd34))
* **guildCreate:** Fix guild.systemChannelID Null ([aff009b](https://github.com/t3xtm3/VVarden/commits/ts-refactor/aff009b7bff26ebbe3ab46118dd940978fb2a813))
* **GuildMemberAdd:** Stop Ignoring Status ([daa7deb](https://github.com/t3xtm3/VVarden/commits/ts-refactor/daa7debd8017fca2d68ad2bb6506229004e88570))
* **help:** Fix procfile Help ([fd035df](https://github.com/t3xtm3/VVarden/commits/ts-refactor/fd035df7513e918b6db7889feb99a2c4aaa8bee0))
* **indents and cua:** Fix CUA Interaction and Indent Horror ([1204173](https://github.com/t3xtm3/VVarden/commits/ts-refactor/120417341f0734d69d0a37d69f0444f9b25562d9))
* **logchan:** Att Fix Logchan Null on GuildCreate ([3c05c2c](https://github.com/t3xtm3/VVarden/commits/ts-refactor/3c05c2c9c686ec30542a628419689438ec0fea13))
* **logging:** Fix Issues with last Logging Commit ([952f60c](https://github.com/t3xtm3/VVarden/commits/ts-refactor/952f60c5a806d6ef69c193229bee1bfe0d89b1fa))
* **logs:** Join array before log ([20bc962](https://github.com/t3xtm3/VVarden/commits/ts-refactor/20bc962ac97de976004f6f7e7f34c004da36ac16))
* **punishUser:** Pass Whole User, Fix Errors ([a4cca7f](https://github.com/t3xtm3/VVarden/commits/ts-refactor/a4cca7fe053b8f3a36f653bfd75bafed2e870dd0))
* **punishUser:** Wrong Variable ([a0d68a3](https://github.com/t3xtm3/VVarden/commits/ts-refactor/a0d68a357f1d0b01b69ea927608781987c7a75d9))
* resolve issues with previous update ([74a4dd2](https://github.com/t3xtm3/VVarden/commits/ts-refactor/74a4dd23c3dc03aeaf016c7cb80262fc06274074))
* return and await promises ([defbc4f](https://github.com/t3xtm3/VVarden/commits/ts-refactor/defbc4f084cf437a77100f66ce31e0065e99daf8))
* Send correct query for inserting users; add error catching ([d06a34a](https://github.com/t3xtm3/VVarden/commits/ts-refactor/d06a34afb9a6434ec55900fb5872dcfc6fee35b0))
* **shards:** Fix Shard Count Hang ([1fb086d](https://github.com/t3xtm3/VVarden/commits/ts-refactor/1fb086dc8a20b59f600d247d1585b6cc40b2e9be))
* **SQL:** Fix UPDATE SQL Syntax ([438dd0d](https://github.com/t3xtm3/VVarden/commits/ts-refactor/438dd0d3ef50d3beb65710fc780e5bfbaefa144b))
* **switch:** Missing Break after upstatus ([9adf282](https://github.com/t3xtm3/VVarden/commits/ts-refactor/9adf282259ecefad72b241e01dc756b6362dcffb))
* Utilise promises to await users to be added to database ([e23f056](https://github.com/t3xtm3/VVarden/commits/ts-refactor/e23f056d5b3d3886d67b4b0cec46f8217be9b2ad))
* When formatting time, return if using old timestamp ([de756ba](https://github.com/t3xtm3/VVarden/commits/ts-refactor/de756ba6a6bb3488543a4b2e7f35b79dd0f5b2c1))


### Chores

* **@types:** Added Colour enum ([129f2fc](https://github.com/t3xtm3/VVarden/commits/ts-refactor/129f2fc36e863a3e7767ed1217b0a65a170d44f3))
* Added docstrings ([ab8ffc4](https://github.com/t3xtm3/VVarden/commits/ts-refactor/ab8ffc4193b2e394fa3f13a34a84ca955f336570))
* Added docstrings ([ea1ac59](https://github.com/t3xtm3/VVarden/commits/ts-refactor/ea1ac59a99dc75e16b2e6697303ace29366b7e6e))
* **commands:** Organisation ([a46746d](https://github.com/t3xtm3/VVarden/commits/ts-refactor/a46746d8807c4804b058ddc9a63216c700f16b8d))
* General fixes and tweaks ([95d6af5](https://github.com/t3xtm3/VVarden/commits/ts-refactor/95d6af5515356d33719cdbeebfa02c972c531b90))
* General fixes and tweaks ([7360aec](https://github.com/t3xtm3/VVarden/commits/ts-refactor/7360aec13431a7ea2b7f47aacf9a452d77149e68))
* **globals/funcs:** Reduced Globals, Cleaned Functions ([6670693](https://github.com/t3xtm3/VVarden/commits/ts-refactor/66706930717ab6cd4feac614c95bf9bf3e7f4074))
* implement husky ([9641205](https://github.com/t3xtm3/VVarden/commits/ts-refactor/964120517285024e71c6151b3c23bf803649e125))
* Lint ([1a40799](https://github.com/t3xtm3/VVarden/commits/ts-refactor/1a407990a7be46ecf05c31ac5bc754569a17e71a))
* Lint ([58d151e](https://github.com/t3xtm3/VVarden/commits/ts-refactor/58d151ed19a11027cc18973ae85005870850d189))
* Organisation ([95a291c](https://github.com/t3xtm3/VVarden/commits/ts-refactor/95a291c48f40217ab3140d5cb2e4465ae27d4eec))
* **package:** add husky ([8da487e](https://github.com/t3xtm3/VVarden/commits/ts-refactor/8da487e3d3eeafba4521c06a3c34340fcecad77b))
* **sql:** Add SQL Structure File ([56fa8ac](https://github.com/t3xtm3/VVarden/commits/ts-refactor/56fa8ac5b86cf1a1adc2ebf1416c08e23480f67a))
* update dependencies ([755d6bb](https://github.com/t3xtm3/VVarden/commits/ts-refactor/755d6bb42396ec7b8054858725619d1e5540099d))
