import * as url from "url";

import Discord from "discord.js";
import chalk from "chalk";
import minimist from "minimist";

import { readdirSafe } from "./utils.ts";
import { COMMANDS_DIR } from "./constants.ts";

import secrets from "./config/secrets.ts";

import type { Command } from "./index.ts";

(async () => {
    const args = minimist<{
        help: boolean,
        global: boolean,
        guild?: string | string[],
    }>(process.argv.slice(2), {
        string: ["guild"],
        boolean: ["help", "global"],
    });

    if (args.help) {
        console.log(`\
Options:
    --help
        Display this help message.
    --global
        Deploy to global commands.
    --guild
        Deploy to configured dev guild's commands.
        Default when none of --global or --guild[=<ID>] is present.
    --guild=[<ID>]
        Deploy to specific guild's commands. May be repeated.`
        );
        return;
    }

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
        console.log("Starting deploying commands.");
        if (args.global) {
            await rest.put(
                Discord.Routes.applicationCommands(secrets.clientId),
                { body: commands },
            );
            console.log("   Deployed to global.");
        }
        for (const id of [args.guild ?? ""].flat()) {
            await rest.put(
                Discord.Routes.applicationGuildCommands(secrets.clientId, id == "" ? secrets.devGuildId : id),
                { body: commands },
            );
            console.log(`   Deployed to guild ${id == "" ? "dev" : id}.`);
        }
        console.log("Successfully deployed commands.")
    } catch (err) {
        console.error("Failed to deploy commands.");
        console.error(err);
        process.exit(1);
    }
})();
