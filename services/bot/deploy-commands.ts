import * as url from "url";

import Discord from "discord.js";
import chalk from "chalk";

import { readdirSafe } from "./utils.ts";
import { COMMANDS_DIR } from "./constants.ts";

import secrets from "./config/secrets.ts";

import type { Command } from "./index.ts";

const files = (await readdirSafe(COMMANDS_DIR)).filter(file => file.endsWith(".ts"));

const commands: Array<Discord.RESTPostAPIApplicationCommandsJSONBody> = [];
const collection: Discord.Collection<string, Command> = new Discord.Collection();
for (const file of files) {
    const val = await import(url.pathToFileURL(`${COMMANDS_DIR}${file}`).href) as { default: Command };
    const item = val.default;
    const name = item.name;
    item.data
        .setName(name)
        .setDescription(item.desc);
    if (collection.has(name)) {
        console.log(`Duplicate name or alias ${chalk.yellow(name)}.`);
        continue;
    }
    collection.set(name, item);
    commands.push(item.data.toJSON());
}

const rest = new Discord.REST().setToken(secrets.token);

try {
    console.log("Starting to deploy commands.");
    /** @todo support deploying global commands */
    await rest.put(
        Discord.Routes.applicationGuildCommands(secrets.clientId, secrets.devGuildId),
        { body: commands },
    );
    console.log("Successfully deployed commands.")
} catch (err) {
    console.error("Failed to deploy commands.");
    console.error(err);
    process.exit(1);
}
