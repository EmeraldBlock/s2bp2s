import * as path from "path";
import * as fs from "fs/promises";
import { createCanvas, loadImage } from "canvas";
import { ASSETS_DIR, CACHE_DIR, IMAGE_SUFFIX, COLORS } from "./src/config.ts";

await fs.mkdir(CACHE_DIR, { recursive: true });

for await (const dirEntry of await fs.readdir(ASSETS_DIR, { withFileTypes: true })) {
    if (!dirEntry.isFile) continue;
    const image = await loadImage(path.join(ASSETS_DIR, dirEntry.name));
    const canvas = createCanvas(image.width, image.height);
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
        await fs.writeFile(path.join(CACHE_DIR, `${dirEntry.name.slice(0, -IMAGE_SUFFIX.length)}-${layer}${IMAGE_SUFFIX}`), result.toBuffer());
    }
}
