import { useEffect, useState } from "react";

function App() {
	const [inputString, setInputString] = useState("");
	const [image, setImage] = useState("");

	async function renderImage() {
		if (inputString == "") return;

		const imageBuffer = await fetch("/render", {
			method: "POST",
			body: inputString,
		}).then((data) => data.arrayBuffer());

		const url = window.URL.createObjectURL(new Blob([imageBuffer], { type: "image/png" }));
		setImage(url);
	}

	function download() {
		const a = document.createElement("a");
		a.href = image;
		a.style.display = "none";
		a.download = "shapez2-blueprint.png";
		document.body.appendChild(a);
		a.click();
	}

	useEffect(() => {
		renderImage();
	}, [inputString]);

	return (
		<div className="flex flex-col items-center">
			<div className="mt-32">
				<input
					type="text"
					value={inputString}
					placeholder="Paste blueprint here"
					onChange={(event) => setInputString(event.target.value)}
					className="bg-zinc-100 border border-zinc-200 shadow-inner rounded px-2 py-0.5"
				/>
			</div>
			<div className="relative">
				{image != "" && (
					<button
						onClick={() => download()}
						className="absolute top-4 left-4 bg-zinc-300 opacity-80 p-1 shadow shadow-zinc-500 rounded">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							className="w-6 h-6">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
							/>
						</svg>
					</button>
				)}
				<img src={image} alt="" className="w-full max-w-4xl" />
			</div>
		</div>
	);
}

export default App;
