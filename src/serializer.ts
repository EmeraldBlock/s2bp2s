import { promisify } from "util";
import * as zlib from "zlib";
const gunzip = promisify(zlib.gunzip);

import { validate } from "./blueprint.ts";

const VERSION = "1";

const PREFIX = "SHAPEZ2";
const DIVIDER = "-";
const SUFFIX = "$";

export async function deserialize(serialized: string) {
	if (!serialized.endsWith(SUFFIX)) {
		throw new TypeError(`Blueprint has bad suffix, expected ${SUFFIX}`);
	}
	const [prefix, version, content, ...rest] = serialized
		.slice(0, -SUFFIX.length)
		.split(DIVIDER);
	// not about to turn on noUncheckedIndexedAccess!
	if ((content as string | undefined) === undefined) {
		throw new TypeError(`Blueprint has too few data entries`);
	}
	if (rest.length !== 0) {
		throw new TypeError(`Blueprint has excess data entries`);
	}
	if (prefix !== PREFIX) {
		throw new TypeError(`Blueprint has bad prefix, expected ${PREFIX}`);
	}
	if (version !== VERSION) {
		throw new TypeError(`Blueprint has bad version, expected ${VERSION}`);
	}
	const parsed = JSON.parse(
		new TextDecoder().decode(await gunzip(Buffer.from(content, "base64"))),
	) as unknown;
	if (!validate(parsed)) {
		throw new TypeError(`Blueprint has bad content`);
	}
	return parsed;
}
