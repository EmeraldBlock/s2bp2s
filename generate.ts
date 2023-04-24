import * as path from "https://deno.land/std@0.184.0/path/mod.ts";
import * as fs from "https://deno.land/std@0.129.0/fs/mod.ts";
import { createCanvas, loadImage } from "https://deno.land/x/canvas@v1.4.1/mod.ts";
import { ASSETS_DIR, CACHE_DIR, IMAGE_SUFFIX, COLORS } from "./src/config.ts";

fs.ensureDir(CACHE_DIR);

for await (const dirEntry of Deno.readDir(ASSETS_DIR)) {
    if (!dirEntry.isFile) continue;
    const image = await loadImage(path.join(ASSETS_DIR, dirEntry.name));
    const canvas = createCanvas(image.width(), image.height());
    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0);

    /** @todo don't make impossible multilayer sprites */
    for (let layer = 0; layer < 3; ++layer) {
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            data.set(new Array(3).fill(undefined).map((_, channel) => data.slice(i, i+3).map((v, k) => COLORS[(k+layer)%3][channel]*v/0x100).reduce((p, c) => p+c)), i);
        }
        const result = createCanvas(canvas.width, canvas.height);
        result.getContext("2d").putImageData(imageData, 0, 0);
        await Deno.writeFile(path.join(CACHE_DIR, `${dirEntry.name.slice(0, -IMAGE_SUFFIX.length)}-${layer}${IMAGE_SUFFIX}`), result.toBuffer());
    }
}
