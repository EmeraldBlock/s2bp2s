import * as path from "path";
import { Image, createCanvas, loadImage } from "canvas";
import { Blueprint } from "./blueprint.ts";
import { Rotation, Vector } from "./vector.ts";
import { buildings, placeholder } from "./buildings.ts";
import { CACHE_DIR, IMAGE_SIZE, LAYERS } from "./config.ts";

const TILE_SIZE = 64;
const SKEW = 1;
const SCALE = 3;

const images: Map<string, Image[]> = new Map();
const missingImages: string[] = [];

let inited = false;
export async function init() {
    for (const name in buildings) {
        try {
            images.set(name, await Promise.all(new Array(LAYERS).fill(undefined).map((_, i) => loadImage(path.join(CACHE_DIR, `${name}-${i}.png`)))));
        } catch {
            missingImages.push(name);
        }
    }
    if (missingImages.length > 0) {
        console.error(`Missing images for ${missingImages.join(", ")}`);
    }
    inited = true;
}

const ORIGINS = [
    new Vector(0, 0),
    new Vector(1, 0),
    new Vector(1, 1),
    new Vector(0, 1),
];

type Step = {
    // source
    t: string,
    sx: number,
    sy: number,
    sz: number,
    // for bridging
    sw: number,
    sh: number,
    // destination
    x: number,
    y: number,
    r: Rotation,
};

type Schematic = {
    min: Vector,
    max: Vector,
    layers: [Step[], Step[], Step[]],
    connectors: [Vector[], Vector[]],
};

type Req = Map<number, Map<number, Rotation>>;

function sketch(blueprint: Blueprint) {
    const entrys = blueprint.BP.Entries;
    const data: Schematic = {
        min: new Vector(Infinity, Infinity),
        max: new Vector(-Infinity, -Infinity),
        layers: [[], [], []],
        connectors: [[], []],
    };
    const reqs: [Req, Req, Req] = [new Map(), new Map(), new Map()];
    const missingBuildings: Set<string> = new Set();
    for (const entry of entrys) {
        const name = entry.T.replace("InternalVariant", "");
        const bounds = buildings[name] ?? placeholder;
        if (bounds === placeholder) {
            missingBuildings.add(name);
        }

        const r = entry.R;
        const pos = new Vector(entry.X, entry.Y);
        const corners = [0, bounds.dims.x].flatMap(x => (x === 0 ? [0, bounds.dims.y] : [bounds.dims.y, 0]).map(y =>
            new Vector(bounds.offset.x+x, bounds.offset.y+y)
        )).map(v => v.rotate(r).add(ORIGINS[r]).add(pos));

        data.min = data.min.min(corners[r]);
        data.max = data.max.max(corners[(2+r)%4]);

        for (const { pos, dir } of bounds.acceptors.concat(bounds.ejectors)) {
            const v = new Vector(pos.x, pos.y).rotate(r).add(corners[0]);
            const { x, y } = v;
            const pr = (r+dir)%4 as Rotation;
            const l = entry.L+bounds.offset.z+pos.z;
            const req = reqs[l];
            if (!req.has(x)) {
                req.set(x, new Map());
            }
            const reqx = req.get(x)!;
            if (!reqx.has(y)) {
                reqx.set(y, pr);
                continue;
            }
            if (reqx.get(y) !== pr) {
                reqx.delete(y);
                continue;
            }
            const w = v.sub(new Vector(0, 1/2).rotate(pr)).sub(ORIGINS[pr]).scale(SCALE).add(ORIGINS[pr]);
            w.x += SCALE-1 - SKEW*l;
            w.y += SCALE-1 - SKEW*l;
            for (let dx = -SCALE+1; dx < 0; ++dx) {
                const { x, y } = new Vector(dx, 0).rotate(pr).add(w);
                data.layers[l].push({
                    t: "BeltDefaultForward",
                    sx: 0,
                    sy: 0,
                    sz: 0,
                    sw: 1,
                    sh: 1,
                    x,
                    y,
                    r: pr,
                })
            }
        }

        for (let sx = 0; sx < bounds.dims.x; ++sx) {
            for (let sy = 0; sy < bounds.dims.y; ++sy) {
                let { x, y } = new Vector(sx, sy).rotate(r).add(corners[0]).sub(ORIGINS[r]).scale(SCALE).add(ORIGINS[r]);
                const l = entry.L+bounds.offset.z;
                x += SCALE-1 - SKEW*l;
                y += SCALE-1 - SKEW*l;
                for (let sz = 0; sz < bounds.dims.z; ++sz) {
                    if (sz !== 0) {
                        data.connectors[l+sz-1].push(new Vector(x, y).sub(ORIGINS[r]));
                    }
                    for (let dx = sx == 0 ? 0 : -SCALE+1; dx <= 0; ++dx) {
                        for (let dy = sy == 0 ? 0 : -SCALE+1; dy <= 0; ++dy) {
                            const { x: bx, y: by } = new Vector(dx, dy).rotate(r);
                            data.layers[l+sz].push({
                                t: name,
                                sx: dx == 0 ? sx : sx-1/4,
                                sy: dy == 0 ? sy : sy-1/4,
                                sz,
                                sw: dx == 0 ? 1 : 1/2,
                                sh: dy == 0 ? 1 : 1/2,
                                x: x+bx,
                                y: y+by,
                                r,
                            });
                        }
                    }
                    x -= SKEW;
                    y -= SKEW;
                }
            }
        }
    }
    if (missingBuildings.size > 0) {
        console.error(`Unknown buildings ${[...missingBuildings].join(", ")}`);
    }
    return data;
}

export async function render(blueprint: Blueprint) {
    const data = sketch(blueprint);

    if (!inited) {
        await init();
    }

    const canvas = createCanvas((data.max.x-data.min.x) * TILE_SIZE * SCALE, (data.max.y-data.min.y) * TILE_SIZE * SCALE);
    const context = canvas.getContext("2d");

    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.scale(TILE_SIZE, TILE_SIZE);
    context.translate(-data.min.x * SCALE, -data.min.y * SCALE);

    for (let l = 0; l < LAYERS; ++l) {
        if (l !== 0) {
            for (const connector of data.connectors[l-1]) {
                context.lineWidth = 0.05;
                context.lineCap = "round";
                for (const x of [1/4, 3/4]) {
                    for (const y of [1/4, 3/4]) {
                        context.beginPath();
                        context.moveTo(connector.x+x, connector.y+y);
                        context.lineTo(connector.x+x+1, connector.y+y+1);
                        context.stroke();
                    }
                }
                context.lineCap = "butt";
            }
        }
        for (const step of data.layers[l]) {
            const name = step.t;
            const bounds = buildings[name] ?? placeholder;

            context.save();
            context.translate(step.x, step.y);
            context.rotate(step.r * Math.PI / 2);

            if (!images.has(name)) {
                const { x, y } = bounds.dims;
                context.fillStyle = ["#808080", "#c0c0c0", "#e0e0e0"][l];
                context.fillRect(0, 0, 1, 1);
                if (bounds === placeholder) {
                    context.fillStyle = "#ff8080";
                    context.beginPath();
                    context.moveTo(0, 0);
                    context.lineTo(1/2, 0);
                    context.lineTo(0, 1/2);
                    context.closePath();
                    context.fill();
                }
                if (step.sx === x-1 && step.sy === y-1) {
                    context.lineWidth = 2/TILE_SIZE;
                    context.strokeRect(-(x-1)*SCALE, -(y-1)*SCALE, (x-1)*SCALE+1, (y-1)*SCALE+1);
                }
                context.font = `0.25px monospace`;
                context.fillStyle = "black";
                context.fillText(name.replaceAll(/[a-z]/g, ""), 1/16, 1-1/16);
            } else {
                context.drawImage(
                    images.get(name)![l-step.sz],
                    step.sx * IMAGE_SIZE, (step.sz * bounds.dims.y + step.sy) * IMAGE_SIZE,
                    IMAGE_SIZE * step.sw, IMAGE_SIZE * step.sh,
                    0, 0,
                    1, 1,
                );
            }
            context.restore();
        }
    }

    return canvas.toBuffer();
}
