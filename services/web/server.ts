import bodyParser from "body-parser";
import { deserialize } from "../../src/serializer.ts";
import express from "express";
import { render } from "../../src/renderer.ts";

const app = express();
const port = 9374;

app.use(bodyParser.text());

app.use(express.static("dist"));

app.post("/render", async (req, res) => {
	try {
		const blueprint = await deserialize(req.body);
		res.send(await render(blueprint));
	} catch (err) {
		res.sendStatus(400);
	}
});

app.listen(port, () => {
	console.log(`s2bp2s-web listening on ${port}`);
});
