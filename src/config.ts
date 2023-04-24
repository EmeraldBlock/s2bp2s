import * as path from "std/path/mod.ts";

// project layout
export const ROOT_DIR = path.join(path.dirname(path.fromFileUrl(import.meta.url)), "./../");
export const ASSETS_DIR = path.join(ROOT_DIR, "./assets/");
export const CACHE_DIR = path.join(ROOT_DIR, "./cache/");
export const OUT_DIR = path.join(ROOT_DIR, "./out/");

// sprite specifics
export const IMAGE_SUFFIX = ".png";
export const IMAGE_SIZE = 256;

// game constants
export const LAYERS = 3;
export const COLORS = [
    [0x80, 0x80, 0x80],
    [0xc0, 0xc0, 0xc0],
    [0xe0, 0xe0, 0xe0],
];
