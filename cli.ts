import * as path from "path";
import * as fs from "fs/promises";

import minimist from "minimist";

import { render, init } from "./src/renderer.ts";
import { deserialize } from "./src/serializer.ts";
import { OUT_DIR } from "./src/config.ts";

await (async () => {
	const args = minimist<{
		help: boolean;
		i?: string;
		o?: string;
	}>(process.argv.slice(2), {
		string: ["i", "o"],
		boolean: ["help"],
	});

	if (args.help) {
		console.log(`\
Options:
    --help
        Display this help message.
    -i [<PATH>]
        Read blueprint string from specified file instead of from standard input.
    -o [<PATH>]
        Write schematic image to specified file instead of to /out/image.png.`);
		return;
	}

	await init();

	await fs.mkdir(OUT_DIR, { recursive: true });

	function textLineStream(stream: NodeJS.ReadableStream) {
		stream.setEncoding("utf-8");
		return {
			async *[Symbol.asyncIterator]() {
				let buf = "";
				for await (const chunk of stream) {
					const lines = (chunk as string).split(/\r?\n/g);
					lines[0] = buf + lines[0];
					buf = lines.pop()!;
					for (const line of lines) {
						yield line;
					}
				}
			},
		};
	}

	const content = await (async () => {
		if (args.i !== undefined) {
			return await fs.readFile(args.i, "utf-8");
		} else {
			process.stdout.write("Blueprint: ");
			for await (const line of textLineStream(process.stdin)) {
				return line;
			}
			// empty stream
			return "";
		}
	})();

	await fs.writeFile(
		args.o ?? path.join(OUT_DIR, "./image.png"),
		await render(await deserialize(content.trim())),
	);

	console.log("Done.");
})();
