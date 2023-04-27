# s2bp2s

_**s**hapez **2** **b**lue**p**rint **to** **s**chematic_
is a tool to draw a shapez 2 blueprint
as an easy-to-read 2d image.

### Warning

Currently very WIP.
**There are no safety checks.**
Many buildings are missing,
so they will appear as plain boxes!

## Usage

* Install [Node.js](https://nodejs.org/).
* Install dependencies.

### CLI

* Generate sprites by executing `npx ts-node generate.ts`.
* Run by executing `npx ts-node cli.ts`.
  * Paste in your blueprint string when prompted.
  * Piping works as well.
* Your image will be found at `out/image.png`.

### Discord bot

* `cd` into `services/bot/`.
* In `config/`, make a `secrets.ts` following `secrets.template.ts`.
* Deploy slash commands by executing `npx ts-node deploy-commands.ts`.
* Run by executing `npx ts-node index.ts`.
