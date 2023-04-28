import { Rotation, Vector } from "./vector.ts";

type Position = { x: number, y: number, z: number };
type Arrow = { pos: Position, dir: Rotation };
type Bounds = { offset: Position, dims: Position, acceptors: Arrow[], ejectors: Arrow[] };

const origin = { x: 0, y: 0, z: 0 };

const unitCache: Map<string, Bounds> = new Map();
function unitMaker(ac: Rotation[] = [0], ej: Rotation[] = [0]): Bounds {
    const hash = `[${ac}],[${ej}]`;
    if (!unitCache.has(hash)) {
        unitCache.set(hash, {
            offset: origin,
            dims: { x: 1, y: 1, z: 1 },
            acceptors: ac.map(r => {
                const { x, y } = new Vector(-1/2, 0).rotate(r).add(new Vector(1/2, 1/2));
                return {
                    pos: { x, y, z: 0 },
                    dir: r,
                };
            }),
            ejectors: ej.map(r => {
                const { x, y } = new Vector(1/2, 0).rotate(r).add(new Vector(1/2, 1/2));
                return {
                    pos: { x, y, z: 0 },
                    dir: r,
                };
            }),
        });
    }
    return unitCache.get(hash)!;
}

function liftMaker(up: boolean, r: Rotation): Bounds {
    const { x, y } = new Vector(1/2, 0).rotate(r).add(new Vector(1/2, 1/2));
    return {
        offset: { x: 0, y: 0, z: up ? 0 : -1 },
        dims: { x: 1, y: 1, z: 2 },
        acceptors: [{
            pos: { x: 0, y: 1/2, z: up ? 0 : 1 },
            dir: 0,
        }],
        ejectors: [{
            pos: { x, y, z: up ? 1 : 0 },
            dir: r,
        }],
    };
}

export const placeholder: Bounds = unitMaker([], []);

/** @todo pipe connections */
export const buildings: Record<string, Bounds> = {
    // Transport
    BeltDefaultForward: unitMaker(),
    BeltDefaultRight: unitMaker([0], [1]),
    BeltDefaultLeft: unitMaker([0], [3]),

    Splitter1To2L: unitMaker([0], [0, 3]),
    Splitter1To2R: unitMaker([0], [0, 1]),
    SplitterTShape: unitMaker([0], [1, 3]),

    Merger2To1L: unitMaker([0, 1], [0]),
    Merger2To1R: unitMaker([0, 3], [0]),
    MergerTShape: unitMaker([1, 3], [0]),
    Merger3To1: unitMaker([0, 1, 3], [0]),

    Lift1UpForward: liftMaker(true, 0),
    Lift1UpRight: liftMaker(true, 1),
    Lift1UpBackward: liftMaker(true, 2),
    Lift1UpLeft: liftMaker(true, 3),

    Lift1DownForward: liftMaker(false, 0),
    Lift1DownRight: liftMaker(false, 1),
    Lift1DownBackward: liftMaker(false, 2),
    Lift1DownLeft: liftMaker(false, 3),

    BeltPortSender: unitMaker([0], []),
    BeltPortReceiver: unitMaker([], [0]),

    // Shape processing
    StorageDefault: {
        offset: origin,
        dims: { x: 2, y: 1, z: 2 },
        acceptors: [
            {
                pos: { x: 0, y: 1/2, z: 0 },
                dir: 0,
            }
        ],
        ejectors: [
            {
                pos: { x: 2, y: 1/2, z: 0 },
                dir: 0,
            }
        ],
    },

    TrashDefault: unitMaker([0, 1, 2, 3], []),

    ExtractorDefault: unitMaker([], [0]),

    CutterDefault: {
        offset: { x: 0, y: -1, z: 0 },
        dims: { x: 1, y: 2, z: 1 },
        acceptors: [{
            pos: { x: 0, y: 1+1/2, z: 0 },
            dir: 0,
        }],
        ejectors: [
            {
                pos: { x: 1, y: 1/2, z: 0 },
                dir: 0,
            },
            {
                pos: { x: 1, y: 1+1/2, z: 0 },
                dir: 0,
            },
        ],
    },
    CutterHalf: unitMaker(),

    RotatorOneQuad: unitMaker(),
    RotatorOneQuadCCW: unitMaker(),
    RotatorHalf: unitMaker(),

    PainterDefault: {
        offset: { x: 0, y: -1, z: 0 },
        dims: { x: 1, y: 2, z: 1 },
        acceptors: [{
            pos: { x: 0, y: 1/2, z: 0 },
            dir: 0,
        }],
        ejectors: [{
            pos: { x: 1, y: 1/2, z: 0 },
            dir: 0,
        }],
    },

    StackerDefault: {
        offset: origin,
        dims: { x: 1, y: 1, z: 2 },
        acceptors: [
            {
                pos: { x: 0, y: 1/2, z: 0 },
                dir: 0,
            },
            {
                pos: { x: 0, y: 1/2, z: 1 },
                dir: 0,
            },
        ],
        ejectors: [{
            pos: { x: 1, y: 1/2, z: 0 },
            dir: 0,
        }],
    },

    BarrelProducerDefault: unitMaker(),

    PinPusherDefault: unitMaker(),

    CrystalGeneratorDefault: unitMaker(),

    // Colors & Fluids

    // Wires
    BeltReaderDefault: unitMaker(),

    // Decorations
    LabelDefault: {
        offset: { x: -2, y: 0, z: 0 },
        dims: { x: 5, y: 1, z: 1 },
        acceptors: [],
        ejectors: [],
    },

    // Debug
    SandboxItemProducerDefault: unitMaker([], [0]),
    SandboxFluidProducerDefault: unitMaker([], []),
};
