import Discord from "discord.js";

import type { Command } from "../index.ts";
import { BotError } from "../errors.ts";

import config from "../config/config.ts";

export default {
    name: "help",
    data: new Discord.SlashCommandBuilder()
        .addStringOption(option => option
                .setName("command")
                .setDescription("The command. Leave blank to get a list of commands.")
        ),
    desc: "Provides the list of commands or information about a specific command.",
    execute: async (interaction, data) => {
        const embed = new Discord.EmbedBuilder({
            color: config.colors.info,
        });
        const name = interaction.options.getString("command");
        if (name === null) {
            embed
                .setTitle("Commands")
                .setDescription(`\
\`\`\`
${data.commands.map((val, key) => key).join("\n")}
\`\`\`
\`${config.prefix}help <command>\` for more information on a command.`,
                );
        } else {
            const command = data.commands.get(name);
            if (command === undefined) throw new BotError("Unknown command name", `\`${name}\` is not the name or alias of any command I have!`);
            embed
                .setTitle(command.name)
                .setDescription(`\
_${command.desc}_

${command.details !== undefined ? `${command.details}
` : ""}${command.usage !== undefined ? `\`\`\`
${config.prefix}${command.name} ${command.usage}
\`\`\`` : "" }`,
                );
        }
        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
} satisfies Command;
