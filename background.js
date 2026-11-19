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
		const newtext = rewriteText(clipText, SETTINGS);
		if (newtext != clipText) {
			navigator.clipboard.writeText(newtext).then(() => {}, () => {},);
		}
	}, (error) => {
		// WebKit (Orion) never lets a background page read the clipboard, so stop asking three
		// times a second. content.js handles what it can there.
		if (error.name == "NotAllowedError") {
			clearInterval(MYINTERVAL);
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

// storage.onChanged is the portable one. the per-area storage.sync.onChanged is a newer
// addition that isn't supported everywhere, and when it doesn't fire nothing below ever
// runs - which is how the timer could end up never starting at all.
browser.storage.onChanged.addListener((changes) => {
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
		// without this the timer only ever started from the listener above
		restartInterval();
	}
});
