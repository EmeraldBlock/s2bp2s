# s2bp2s

_**s**hapez **2** **b**lue**p**rint **to** **s**chematic_
is a tool to draw a shapez 2 blueprint
as an easy-to-read 2d image.

## Warning

Currently very WIP.
Many buildings are missing,
so they will appear as plain boxes!

## Usage

* Install [Deno](https://deno.com/runtime).
* Generate sprites by executing `deno run --allow-read --allow-write generate.ts`.
* Paste your shapez 2 blueprint string into a text file.
* Run by executing `cat <FILE> | deno run --allow-read --allow-write main.ts`.
* Your image will be found at `out/image.png`.
