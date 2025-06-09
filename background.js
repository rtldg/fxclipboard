// SPDX-License-Identifier: WTFPL

const defaultSettings = {
	smiley: ":)",
	interval: 333,
	plain: [
		["//twitter.com/", "//fxtwitter.com/"],
		["//x.com/", "//fxtwitter.com/"],
	],
	regex: [
		//["//(twitter).com/", "//$1.gay/", "flags here"]
	],
};

let settings = {};
let myInterval = 0;

let thingy = () => {
	navigator.clipboard.readText().then((clipText) => {
		let newtext = clipText;
		for (const replacement of settings.plain) {
			newtext = newtext.replace(replacement[0], replacement[1]);
		}
		for (const replacement of settings.regex) {
			newtext = newtext.replace(new RegExp(replacement[0], replacement[2]), replacement[1]);
		}
		if (newtext != clipText) {
			navigator.clipboard.writeText(newtext).then(() => {}, () => {},);
		}
	});
};

browser.runtime.onInstalled.addListener((details) => {
	if (details.reason == "install") {
		// give some time for our defaults to set maybe lol...
		setTimeout(function() {
			browser.runtime.openOptionsPage();
		}, 1 * 1000);
	}
});

browser.storage.sync.onChanged.addListener((changes) => {
	console.log(changes);
	for (const key of Object.keys(changes)) {
		settings[key] = changes[key].newValue;
	}

	clearInterval(myInterval);
	myInterval = setInterval(thingy, settings.interval);
});

browser.storage.sync.get().then((settings) => {
	if (settings.smiley != ":)") {
		browser.storage.sync.set(defaultSettings);
		settings = structuredClone(defaultSettings);
	}
});
