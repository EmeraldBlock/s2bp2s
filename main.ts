import * as path from "https://deno.land/std@0.184.0/path/mod.ts";
import * as fs from "https://deno.land/std@0.129.0/fs/mod.ts";
import { TextLineStream } from "https://deno.land/std@0.184.0/streams/mod.ts";
import { render } from "./src/renderer.ts";
import { deserialize } from "./src/serializer.ts";
import { OUT_DIR } from "./src/config.ts";

await fs.ensureDir(OUT_DIR);

/** @todo TextDecoderStream seems to cause it to wait for an extra line of interactive input? */
const stream = Deno.stdin.readable.pipeThrough(new TextDecoderStream()).pipeThrough(new TextLineStream());
for await (const line of stream) {
    await Deno.writeFile(path.join(OUT_DIR, "./image.png"), render(deserialize(line.trim())));
    break;
}
