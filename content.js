// SPDX-License-Identifier: WTFPL

// Rewrites copies made inside web pages. This is the only way it works in Orion (macOS and iOS):
// WebKit never lets a background page read the clipboard, so background.js can't do anything
// there. Copies made by the browser itself (the address bar, "Copy Link" in a link's menu) never
// pass through a page, so Orion leaves those alone.

let SETTINGS = null;

// Cmd+C, the Copy menu item, and pages that copy with document.execCommand("copy").
let selectedText = () => {
	// the selection inside a text field isn't part of getSelection() everywhere
	const el = document.activeElement;
	if ((el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) && el.selectionStart != null) {
		return el.value.slice(el.selectionStart, el.selectionEnd);
	}
	return window.getSelection()?.toString() ?? "";
};

window.addEventListener("copy", (event) => {
	if (!SETTINGS || !event.clipboardData) {
		return;
	}
	// a page that fills the clipboard itself has already put its text in clipboardData
	const text = event.defaultPrevented ? event.clipboardData.getData("text/plain") : selectedText();
	const newtext = rewriteText(text, SETTINGS);
	if (newtext != text) {
		// plain text only, like background.js writes it, so a stale text/html copy can't win the paste
		event.clipboardData.clearData();
		event.clipboardData.setData("text/plain", newtext);
		event.preventDefault();
	}
});

// "Copy link" buttons (x.com's share menu and friends) call navigator.clipboard.writeText() from
// the page's own scripts. That fires no copy event and this content script can't see it, so this
// function gets injected into the page to wrap writeText(). The rules stay here: the wrapper asks
// for the rewritten text with a pair of events, and since dispatchEvent() is synchronous the answer
// arrives before the page's write goes through.
function hookWriteText() {
	if (!window.Clipboard) {
		return;
	}
	const writeText = Clipboard.prototype.writeText;
	Clipboard.prototype.writeText = function (...args) {
		if (args.length) {
			const onRewritten = (event) => {
				args[0] = event.detail;
			};
			document.addEventListener("fxclipboard-rewritten", onRewritten);
			document.dispatchEvent(new CustomEvent("fxclipboard-rewrite", { detail: String(args[0]) }));
			document.removeEventListener("fxclipboard-rewritten", onRewritten);
		}
		return writeText.apply(this, args);
	};
}

document.addEventListener("fxclipboard-rewrite", (event) => {
	if (!SETTINGS || typeof event.detail != "string") {
		return;
	}
	const newtext = rewriteText(event.detail, SETTINGS);
	if (newtext != event.detail) {
		document.dispatchEvent(new CustomEvent("fxclipboard-rewritten", { detail: newtext }));
	}
});

let injectHook = () => {
	const script = document.createElement("script");
	// x.com's CSP only runs inline scripts that carry the page's nonce, so borrow it
	const nonced = document.querySelector("script[nonce]");
	if (nonced) {
		script.nonce = nonced.nonce;
	}
	script.textContent = `(${hookWriteText})();`;
	(document.head || document.documentElement).append(script);
	script.remove();
};

// at document_start the page's nonced scripts aren't parsed yet
if (document.readyState == "loading") {
	document.addEventListener("DOMContentLoaded", injectHook, { once: true });
} else {
	injectHook();
}

let reload = () => {
	browser.storage.sync.get().then((stored) => {
		SETTINGS = stored;
	});
};

browser.storage.onChanged.addListener(reload);
reload();
