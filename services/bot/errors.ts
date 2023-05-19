import Discord from "discord.js";

import config from "./config/config.ts";

export class BotError extends Error {
	description: string;

	constructor(message: string, description: string) {
		super(message);
		this.name = "BotError";
		this.description = description;
	}

	getEmbed() {
		return new Discord.EmbedBuilder({
			title: this.message,
			description: this.description,
			color: config.colors.warn,
		});
	}
}

export class AggregateBotError extends AggregateError {
	constructor(public botErrors: BotError[]) {
		super(botErrors, botErrors.map((botError) => botError.message).join(", "));
		this.name = "AggregateBotError";
	}

	static fromBotErrors(botErrors: BotError[]): BotError | AggregateBotError {
		if (botErrors.length === 1) {
			return botErrors[0];
		} else {
			return new this(botErrors);
		}
	}

	getEmbed() {
		return new Discord.EmbedBuilder({
			color: config.colors.warn,
			fields: this.botErrors.map((botError) => ({
				name: botError.message,
				value: botError.description,
			})),
		});
	}
}
