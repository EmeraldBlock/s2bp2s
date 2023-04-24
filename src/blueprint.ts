export type Blueprint = {
    /** savegame version */
    V: number,
    /** contained blueprint */
    BP: {
        Entries: {
            X: number,
            Y: number,
            /** Layer */
            L: 0 | 1 | 2,
            /** Rotation */
            R: 0 | 1 | 2 | 3,
            /** Type */
            T: string,
            /** Config data */
            C: string,
        }[],
    },
};

/** @todo implement */
export function validate(_parsed: unknown): _parsed is Blueprint {
    return true;
}
