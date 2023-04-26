import { useEffect, useState } from "react";

function App() {
	const [inputString, setInputString] = useState("");
	//const [imageBuffer, setImageBuffer] = useState<ArrayBuffer>();
	const [image, setImage] = useState("");

	async function renderImage() {}

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
