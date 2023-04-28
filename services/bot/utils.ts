import * as fs from "fs/promises";

import Discord from "discord.js";
import chalk from "chalk";

import type { Listener } from "./index.ts";

// general

export function randFloat(a: number, b?: number): number {
    if (b === undefined) {
        return Math.random() * a;
    } else {
        return Math.random() * (b - a) + a;
    }
}

export function randInt(a: number, b?: number): number {
    return Math.floor(randFloat(a, b));
}

export function range(a: number, b?: number): Array<number> {
    if (b === undefined) {
        return new Array(a).fill(undefined).map((_, i) => i);
    } else {
        return new Array(b-a).fill(undefined).map((_, i) => i+a);
    }
}

export function trimNewlines(str: string): string {
    return str.replace(/^.*\n|\n.*$/g, "");
}

export function toEnglishList(array: Array<string>): string | undefined {
    switch (array.length) {
    case 0: {
        return undefined;
    }
    case 1: {
        return array[0];
    }
    case 2: {
        return `${array[0]} and ${array[1]}`;
    }
    default: {
        return `${array.slice(0, -1).join(", ")}, and ${array[-1]}`;
    }
    }
}

export async function sleep(ms: number): Promise<void> {
    return await new Promise(resolve => setTimeout(resolve, ms));
}

export function catchAsync<T extends unknown[]>(func: (...args: T) => void | Promise<void>): (...args: T) => Promise<void> {
    return async (...args: T) => {
        try {
            await func(...args);
        } catch (error) {
            console.error(error);
        }
    };
}

export async function readdirSafe(path: string): Promise<string[]> {
    try {
        return await fs.readdir(path);
    } catch (error) {
        if (!(error instanceof Error) || (<Error & { code?: string }>error).code !== "ENOENT") throw error;
        console.log(`No ${chalk.yellow(path)} folder found.`);
        return [];
    }
}

// Discord

export async function safeDelete(message: Discord.Message): Promise<Discord.Message> {
    try {
        return await message.delete();
    } catch (reason) {
        if (reason instanceof Discord.DiscordAPIError && reason.code === 10008) {
            return message;
        }
        throw reason;
    }
}

export function fetchGuildMessageById(id: Discord.Snowflake, guild: Discord.Guild): Promise<Discord.Message> {
    const textChannelsCache = guild.channels.cache.filter((channel): channel is Discord.TextChannel => channel instanceof Discord.TextChannel);
    return Promise.any(textChannelsCache.map(channel => channel.messages.fetch(id)));
}

export function makeListener<K extends keyof Discord.ClientEvents>(listenerArgs: Omit<Listener, "enable" | "disable">, event: K, listener: (...args: Discord.ClientEvents[K]) => void): Listener;
export function makeListener<S extends string | symbol>(listenerArgs: Omit<Listener, "enable" | "disable">, event: Exclude<S, keyof Discord.ClientEvents>, listener: (...args: unknown[]) => void): Listener;
export function makeListener(listenerArgs: Omit<Listener, "enable" | "disable">, event: string | symbol, listener: (...args: unknown[]) => void): Listener {
    const caughtListener = catchAsync(listener);
    return {
        ...listenerArgs,
        enable: client => void client.on(event, caughtListener),
        disable: client => void client.off(event, caughtListener),
    };
}
