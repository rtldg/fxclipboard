// SPDX-License-Identifier: WTFPL

// Shared by background.js and content.js.

// Links copied from x.com come with tracking params: ?s=20&t=<token>, and since late 2026 also
// a=<token>. t is also the timestamp from "Copy video link at current time", so a numeric t stays.
let removeTwitterTracking = (text) => {
	return text.replaceAll(/(https?:\/\/(?:[\w-]+\.)*(?:x|twitter)\.com(?:\/[^\s?#]*)?)\?([^\s#]*)/gi, (url, base, query) => {
		const kept = query.split("&").filter((pair) => {
			const [name, value = ""] = pair.split("=");
			if (name == "t") {
				return /^\d+$/.test(value);
			}
			return !["s", "a", "ref_src", "ref_url"].includes(name);
		});
		return kept.length ? `${base}?${kept.join("&")}` : base;
	});
};

let rewriteText = (text, settings) => {
	let newtext = removeTwitterTracking(text);
	for (const replacement of settings.plain) {
		newtext = newtext.replaceAll(replacement[0], replacement[1]);
	}
	for (const replacement of settings.regex) {
		// replaceAll() throws on a regex without the g flag
		const flags = replacement[2].includes("g") ? replacement[2] : replacement[2] + "g";
		newtext = newtext.replaceAll(new RegExp(replacement[0], flags), replacement[1]);
	}
	return newtext;
};
