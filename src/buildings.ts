import metadata from "./data/metadata.json" assert { type: "json" };

import { Rotation, Vector, rot } from "./vector.ts";

type Position = { x: number, y: number, z: number };
type Arrow = { pos: Position, dir: Rotation };
type Bounds = { offset: Position, dims: Position, acceptors: Arrow[], ejectors: Arrow[] };

export const placeholder: Bounds = {
    offset: { x: 0, y: 0, z: 0 },
    dims: { x: 1, y: 1, z: 1 },
    acceptors: [],
    ejectors: [],
};

function fromEntries<const T extends readonly (readonly [string, unknown])[]>(entries: T) {
    return Object.fromEntries(entries) as { [k in T[number] as k[0]]: k[1] };
}

function entries<const T extends Record<string, unknown>>(obj: T) {
    return Object.entries(obj) as { [k in keyof T]: [k, T[k]] }[keyof T][];
}

function mapValues<const K extends string, T, U>(obj: Record<K, T>, fn: (v: T, k: K) => U) {
    return fromEntries(entries(obj).map(([k, v]) => [k, fn(v, k)]));
}

function ivToBounds(iv: InternalVariant): Bounds {
    const coords = fromEntries((["x", "y", "z"] as const).map(k => [k, iv.Tiles.map(tile => tile[k])]));
    const min = mapValues(coords, v => Math.min(...v));
    const max = mapValues(coords, v => Math.max(...v));
    return {
        offset: min,
        dims: mapValues(max, (v, k) => v+1 - min[k]),
        acceptors: iv.BeltInputs.map(input => {
            const { x: tx, y: ty, z: tz } = input.Position_L;
            const { x, y } = new Vector(tx, ty)
                .add(new Vector(1/2, 1/2))
                .add(new Vector(1/2, 0).rotate(input.Direction_L))
                .sub(new Vector(min.x, min.y));
            const z = tz - min.z;
            return ({ pos: { x, y, z }, dir: rot(input.Direction_L+2) });
        }),
        ejectors: iv.BeltOutputs.map(input => {
            const { x: tx, y: ty, z: tz } = input.Position_L;
            const { x, y } = new Vector(tx, ty)
                .add(new Vector(1/2, 1/2))
                .add(new Vector(1/2, 0).rotate(input.Direction_L))
                .sub(new Vector(min.x, min.y));
            const z = tz - min.z;
            return ({ pos: { x, y, z }, dir: input.Direction_L as Rotation });
        }),
    };
}

type Variant = typeof metadata extends Array<{ Variants: Array<infer T> }> ? T : never;
type InternalVariant = Variant extends { InternalVariants: Array<infer T> } ? T : never;
/** @todo pipe connections */
export const buildings = new Map(
    metadata
        .flatMap<Variant>(building => building.Variants)
        .flatMap<InternalVariant>(variant => variant.InternalVariants)
        .map(internalVariant => [internalVariant.Id.replace("InternalVariant", ""), ivToBounds(internalVariant)]),
);
