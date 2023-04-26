import { useEffect, useState } from "react";

function App() {
	const [inputString, setInputString] = useState("");
	const [image, setImage] = useState("");

	async function renderImage() {
		if (inputString == "") return;
		const imageBuffer = await fetch("http://localhost:9374/render", {
			method: "POST",
			body: inputString,
		}).then((data) => data.arrayBuffer());

		const url = window.URL.createObjectURL(new Blob([imageBuffer], { type: "image/png" }));
		setImage(url);
	}

	useEffect(() => {
		renderImage();
	}, [inputString]);

	return (
		<div>
			<input
				type="text"
				value={inputString}
				onChange={(event) => setInputString(event.target.value)}
				className="bg-zinc-100 border border-zinc-200 shadow-inner rounded"
			/>
			<input type="submit" value="Render" />
			<img src={image} alt="" />
		</div>
	);
}

export default App;
