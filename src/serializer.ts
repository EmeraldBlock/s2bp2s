import { decode } from "std/encoding/base64.ts";
import { gunzip } from "x/compress@v0.4.5/gzip/mod.ts";
import { validate } from "./blueprint.ts";

const VERSION = "1";

const PREFIX = "SHAPEZ2";
const DIVIDER = "-";
const SUFFIX = "$";

export function deserialize(serialized: string) {
    if (!serialized.endsWith(SUFFIX)) {
        throw new TypeError(`Blueprint has bad suffix, expected ${SUFFIX}`);
    }
    const [prefix, version, content, ...rest] = serialized.slice(0, -SUFFIX.length).split(DIVIDER);
    if (content === undefined) {
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
    const parsed = JSON.parse(new TextDecoder().decode(gunzip(decode(content))));
    if (!validate(parsed)) {
        throw new TypeError(`Blueprint has bad content`);
    }
    return parsed;
}
