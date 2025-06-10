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

let SETTINGS = {};
let MYINTERVAL = 0;

let rewriteClipboard = () => {
	navigator.clipboard.readText().then((clipText) => {
		let newtext = clipText;
		for (const replacement of SETTINGS.plain) {
			newtext = newtext.replace(replacement[0], replacement[1]);
		}
		for (const replacement of SETTINGS.regex) {
			newtext = newtext.replace(new RegExp(replacement[0], replacement[2]), replacement[1]);
		}
		if (newtext != clipText) {
			navigator.clipboard.writeText(newtext).then(() => {}, () => {},);
		}
	});
};

let restartInterval = () => {
	clearInterval(MYINTERVAL);
	MYINTERVAL = setInterval(rewriteClipboard, SETTINGS.interval);
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
		SETTINGS[key] = changes[key].newValue;
	}
	restartInterval();
});

browser.storage.sync.get().then((blah) => {
	if (blah.smiley == ":)") {
		SETTINGS = blah;
		restartInterval();
	} else {
		SETTINGS = structuredClone(defaultSettings);
		browser.storage.sync.set(defaultSettings);
	}
});
