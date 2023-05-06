import * as url from "url";
import { strict as assert } from "assert/strict";

import Discord from "discord.js";
import chalk from "chalk";

import { BotError, AggregateBotError } from "./errors.ts";
import { readdirSafe } from "./utils.ts";
import { COMMANDS_DIR, LISTENERS_DIR } from "./constants.ts";

import config from "./config/config.ts";
import secrets from "./config/secrets.ts";

export type Command = {
    name: string,
    desc: string,
    data: Omit<Discord.SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">,
    details?: string,
    usage?: string,
    init?: () => void | Promise<void>,
    auth?: (interaction: Discord.ChatInputCommandInteraction) => boolean,
    execute: (interaction: Discord.ChatInputCommandInteraction, data: Data) => void | Promise<void>,
};

export type Listener = {
    name: string,
    init?: () => void | Promise<void>,
    enable: (client: Discord.Client) => void | Promise<void>,
    disable: (client: Discord.Client) => void | Promise<void>,
};

type Data = {
    commands: Discord.Collection<string, Command>,
    listeners: Discord.Collection<string, Listener>,
};

const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent,
    ],
});

async function initDir<T extends { name: string, init?: () => void | Promise<void> }>(dir: string): Promise<Discord.Collection<string, T>> {
    const files = (await readdirSafe(dir)).filter(file => file.endsWith(".ts"));

    const collection: Discord.Collection<string, T> = new Discord.Collection();
    for (const file of files) {
        const val = await import(url.pathToFileURL(`${dir}${file}`).href) as { default: T };
        const item = val.default;
        const { name, init } = item;
        if (collection.has(name)) {
            console.log(`Duplicate name or alias ${chalk.yellow(name)}.`);
            continue;
        }
        if (init !== undefined) {
            await init();
        }
        collection.set(name, item);
    }

    return collection;
}

async function initData(): Promise<Data> {
    return {
        commands: await initDir(COMMANDS_DIR),
        listeners: await initDir(LISTENERS_DIR),
    };
}

async function runBot() {
    const data = await initData();
    for (const listener of data.listeners.values()) {
        await listener.enable(client);
    }

    client.once(Discord.Events.ClientReady, async () => {
        assert(client.user !== null);
        console.log(chalk.yellow(client.user.tag) + " has logged on!");
        await client.user.setPresence({ activities: [{ name: `/help` }] });
    });

    client.on(Discord.Events.InteractionCreate, async interaction => {
        if (!interaction.isChatInputCommand()) return;

        if (interaction.channel instanceof Discord.DMChannel) {
            await interaction.reply("Sorry, I don't support DMs yet!");
            return;
        }

        const name = interaction.commandName;

        const command = data.commands.get(name);
        try {
            if (command === undefined) {
                throw new BotError("Unknown command name", `\`${name}\` is not the name or alias of any command I have!`);
            }

            if (command.auth !== undefined && !command.auth(interaction)) {
                throw new BotError("Missing permissions", `You do not have the required permissions to use this command!`);
            }

            await command.execute(interaction, data);
        } catch (err) {
            const embed = (() => {
                if (err instanceof BotError || err instanceof AggregateBotError) {
                    return err.getEmbed();
                } else if (err instanceof Error) {
                    console.error(err);
                    return new Discord.EmbedBuilder({
                        title: err.name,
                        description: err.message,
                        color: config.colors.error,
                    });
                } else {
                    console.error(`Nonstandard Error: ${err}`);
                    return new Discord.EmbedBuilder({
                        title: "An error occurred",
                        color: config.colors.error,
                    });
                }
            })();
            if (interaction.deferred || interaction.replied) {
                interaction.editReply({ embeds: [embed] });
            } else {
                interaction.reply({ embeds: [embed], ephemeral: true });
            }
        }
    });

    await client.login(secrets.token);
}

try {
    await runBot();
} catch (err) {
    console.error("Failed to start bot.");
    console.error(err);
    process.exit(1);
}
