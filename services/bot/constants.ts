import * as path from "path";
import * as url from "url";

// project layout
export const ROOT_DIR = path.dirname(url.fileURLToPath(import.meta.url));
export const COMMANDS_DIR = path.join(ROOT_DIR, "./commands/");
export const LISTENERS_DIR = path.join(ROOT_DIR, "./listeners/");
