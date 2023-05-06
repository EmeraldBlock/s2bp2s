import Discord from "discord.js";

import type { Command } from "../index.ts";
import { BotError } from "../errors.ts";

import config from "../config/config.ts";

import { deserialize } from "../../../src/serializer.ts";
import { render } from "../../../src/renderer.ts";

export default {
    name: "draw",
    data: new Discord.SlashCommandBuilder()
        .addStringOption(option => option
                .setName("blueprint")
                .setDescription("The blueprint string.")
                .setRequired(true)
        ),
    desc: "Draws a schematic of a blueprint string.",
    execute: async (interaction, data) => {
        const serialized = interaction.options.getString("blueprint")!;
        try {
            const blueprint = await deserialize(serialized);
            await interaction.deferReply();
            const buffer = render(blueprint);
            const attachment = new Discord.AttachmentBuilder(buffer, { name: "schematic.png" });
            const embed = new Discord.EmbedBuilder({
                color: config.colors.info,
                title: `${blueprint.BP.Entries.length} buildings`,
                image: { url: "attachment://schematic.png" },
            });
            await interaction.editReply({ embeds: [embed], files: [attachment] });
        } catch (err) {
            if (err instanceof TypeError) {
                throw new BotError("Invalid blueprint string", "Check that your blueprint string is complete and has no stray characters!");
            }
            throw err;
        }
    },
} satisfies Command;
