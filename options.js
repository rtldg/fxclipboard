// SPDX-License-Identifier: WTFPL

// TODO: settings.interval must be greater than 150 and less than 5000.

let settings = {};
var DIRTY = false;
var LOADED = false;
let plaintablebody = document.querySelector("#plaintablebody");
let regextablebody = document.querySelector("#regextablebody");

window.onbeforeunload = (e) => {
	return DIRTY ? "ARE YOU SURE? YOU DIDN'T SAVE YOUR CHANGES!!!" : null;
};

document.querySelector("#save").addEventListener("click", () => {
	// save settings to storage.sync
	if (!LOADED) {
		return;
	}

	settings.plain = [];
	for (let i = 0; i < plaintablebody.children.length-1; i++) {
		const tr = plaintablebody.children[i];
		const from = tr.children[0].children[0].value;
		const to = tr.children[1].children[0].value;
		if (from != "") {
			settings.plain.push([from, to]);
		}
	}

	settings.regex = [];
	for (let i = 0; i < regextablebody.children.length-1; i++) {
		const tr = regextablebody.children[i];
		const from = tr.children[0].children[0].value;
		const to = tr.children[1].children[0].value;
		const flags = tr.children[2].children[0].value;
		if (from != "") {
			try {
				new RegExp(from);
				settings.regex.push([from, to, flags]);
			} catch(e) {
				alert(`${from} is invalid regex...`);
			}
		}
	}

	browser.storage.sync.set(settings).then(() => {});
	DIRTY = false;
});

function deleteButton(event) {
	DIRTY = true;
	event.target.parentElement.parentElement.remove();
}

function hookDeleteButtons() {
	[...document.querySelectorAll(".deleteButton")].forEach(button => {
		button.onclick = deleteButton;
	});
}

function fillHtml() {
	plaintablebody.innerHTML = "";
	regextablebody.innerHTML = "";

	console.log(settings);

	for (const replacement of settings.plain) {
		let tr = document.createElement("tr");
		tr.innerHTML = `
			<td><textarea rows="1" cols="50"></textarea></td>
			<td><textarea rows="1" cols="50"></textarea></td>
			<td><button class="deleteButton">delete</button></td>
		`;
		tr.children[0].children[0].value = replacement[0];
		tr.children[1].children[0].value = replacement[1];
		plaintablebody.insertAdjacentElement("beforeend", tr);
	}

	for (const replacement of settings.regex) {
		let tr = document.createElement("tr");
		tr.innerHTML = `
			<td><textarea rows="1" cols="50"></textarea></td>
			<td><textarea rows="1" cols="50"></textarea></td>
			<td><textarea rows="1" cols="50"></textarea></td>
			<td><button class="deleteButton">delete</button></td>
		`;
		tr.children[0].children[0].value = replacement[0];
		tr.children[1].children[0].value = replacement[1];
		tr.children[2].children[0].value = replacement[2];
		regextablebody.insertAdjacentElement("beforeend", tr);
	}

	plaintablebody.insertAdjacentHTML("beforeend", `
			<tr id="plaintableappend">
				<td><button id="plaintableappendbutton">click me to add another row</button></td>
			</tr>
	`);

	regextablebody.insertAdjacentHTML("beforeend", `
			<tr id="regextableappend">
				<td><button id="regextableappendbutton">click me to add another row</button></td>
			</tr>
	`);

	hookDeleteButtons();

	document.querySelector("#plaintableappendbutton").addEventListener("click", () => {
		document.querySelector("#plaintableappend").insertAdjacentHTML("beforebegin", `
			<tr>
				<td><textarea rows="1" cols="50"></textarea></td>
				<td><textarea rows="1" cols="50"></textarea></td>
				<td><button class="deleteButton">delete</button></td>
			</tr>
		`);
		hookDeleteButtons();
		DIRTY = true;
	});

	document.querySelector("#regextableappendbutton").addEventListener("click", () => {
		document.querySelector("#regextableappend").insertAdjacentHTML("beforebegin", `
			<tr>
				<td><textarea rows="1" cols="50"></textarea></td>
				<td><textarea rows="1" cols="50"></textarea></td>
				<td><textarea rows="1" cols="10"></textarea></td>
				<td><button class="deleteButton">delete</button></td>
			</tr>
		`);
		hookDeleteButtons();
		DIRTY = true;
	});
}

browser.storage.sync.get((obj) => {
	settings = obj;
	LOADED = true;
	fillHtml();
});
