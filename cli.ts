import * as path from "path";
import * as fs from "fs/promises";
import { render } from "./src/renderer.ts";
import { deserialize } from "./src/serializer.ts";
import { OUT_DIR } from "./src/config.ts";

await fs.mkdir(OUT_DIR, { recursive: true });

function textLineStream(stream: NodeJS.ReadableStream) {
    stream.setEncoding("utf-8");
    return {
        async *[Symbol.asyncIterator]() {
            let buf = "";
            for await (const chunk of stream) {
                const lines = (chunk as string).split(/\r?\n/g);
                lines[0] = buf + lines[0];
                buf = lines.pop();
                for (const line of lines) {
                    yield line;
                }
            }
        },
    };
}

process.stdout.write("Blueprint: ");
/** @todo TextDecoderStream seems to cause it to wait for an extra line of interactive input? */
for await (const line of textLineStream(process.stdin)) {
    await fs.writeFile(path.join(OUT_DIR, "./image.png"), render(await deserialize(line.trim())));
    break;
}
