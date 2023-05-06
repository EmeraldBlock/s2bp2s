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

Note: the ts-node ESM loader
is currently [broken](https://github.com/TypeStrong/ts-node/issues/1997) on Node.js v20.

* Install [Node.js](https://nodejs.org/).
* Install dependencies.
* Generate sprites by executing `npx ts-node generate.ts`.

### CLI

* Run by executing `npx ts-node cli.ts`.
  * Paste in your blueprint string when prompted.
  * Piping works as well.
* Your image will be found at `out/image.png`.

### Discord bot

* `cd` into `services/bot/`.
* In `config/`, make a `secrets.ts` following `secrets.template.ts`.
* Deploy slash commands by executing `npx ts-node deploy-commands.ts`.
* Run by executing `npx ts-node index.ts`.

### Web

* Run by executing `cd services/web` and `npm start`.
* Visit [http://localhost:9374](http://localhost:9374) in your browser.
* Paste in your blueprint string in the text input.
* Your image will appear on the screen.
* Download your image by pressing the download button in the top-left of the image.
