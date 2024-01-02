
let myinterval = setInterval(() => {
	navigator.clipboard.readText().then((clipText) => {
		let newtext = clipText.replace("//twitter.com/", "//fxtwitter.com/").replace("//x.com/", "//fxtwitter.com/");
		if (newtext != clipText) {
			navigator.clipboard.writeText(newtext).then(() => {}, () => {},);
		}
	});
}, 333);
