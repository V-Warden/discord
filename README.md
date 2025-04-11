# Warden Discord Bot

Extra information here is To-Do

## Contribution Guide

1. Make sure you have [pnpm](https://pnpm.io/installation#using-npm) installed.
2. Go to the [Discord Developer Portal](https://discord.com/developers/applications), make an application if you haven't and create a bot there if you haven't either.
3. Now you can see the Bot Token, save this one because you'll have to reset it if you lose it.
4. Enable the `Presence Intent`, the `Server Members Intent` and the `Message Content Intent` on the same page.
5. Now navigate to the OAuth2 page and to the URL Generator tab, there you select the option `bot` and `application.commands`. After that you can select the permissions, for ease just select `Administrator`. Then you can copy the link and invite the bot to your server to get started with actually starting the bot.
6. Clone this repository (If using git clone, use `git clone --recursive https://github.com/V-Warden/discord.git` so the prisma folder is also pulled, otherwise make sure you've also cloned the prisma folder)
7. Open this in a code editor of your choice.
8. Open a terminal in this folder (VSCode for example has one built-in).
9. Run the command `pnpm i`.
10. Create file called `.env` in this folder.
11. Copy the contents of `.env.example` to the newly created file and edit them accordingly:
   * `token` is the token of your [Discord Developer App Bot](https://discord.com/developers/applications).
   * `environment` is the environment the bot should run in, the options are `dev`, `prod` and `debug`. `dev` is recommended for contributing.
   * `guildId` is the ID of your the discord server that the bot should act in, you can see how to do that [here](https://www.remote.tools/remote-work/how-to-find-discord-id).
   * `DATABASE_URL` should speak for itself, that is the data for your database which the bot runs with, it's recommended to setup some kind of MySQL Server (if you have no password, you can remove the `:PASSWORD` part).
12. Now run the command `npx prisma migrate dev --name init`.
13. Now you can safely run `pnpm start:dev` to run the bot.
