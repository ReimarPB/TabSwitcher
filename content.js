// Add HTML
const input = document.createElement("input");
input.type = "text";
input.placeholder = "Search tabs...";
input.id = "tabswitcher-input";

const itemContainer = document.createElement("div");
itemContainer.id = "tabswitcher-items";

const info = document.createElement("div");
info.id = "tabswitcher-info";

const container = document.createElement("div");
container.id = "tabswitcher";

container.appendChild(input);
container.appendChild(itemContainer);
container.appendChild(info);

document.body.appendChild(container);

browser.runtime.sendMessage({ type: "init" });

let selectedIndex = 0;
let tabs = [];
let shortcut = {};
browser.runtime.onMessage.addListener(message => {
	switch (message.type) {
		case "tabs":
			tabs = message.tabs;
			updateResults();
			break;
		case "shortcut":
			shortcut = message.shortcut;
			break;
	}
});

// Create the HTML for the results
function updateResults() {
	itemContainer.innerHTML = "";
	info.innerText = "Loading..";

	const regex = new RegExp(input.value, "i");
	
	let count = 0;
	tabs.forEach(tab => {
		if (count >= 20 || !tab.title.match(regex)) return;
		count++;

		const icon = document.createElement("img");
		icon.className = "tabswitcher-icon";
		icon.src = tab.favIconUrl;
		icon.onerror = () => icon.style.visibility = "hidden";

		const highlightIndex = regex.exec(tab.title).index;

		const title1 = document.createElement("span");
		title1.innerText = tab.title.substr(0, highlightIndex);

		const highlight = document.createElement("span");
		highlight.className = "tabswitcher-highlight";
		highlight.innerText = tab.title.substr(highlightIndex, input.value.length);

		const title2 = document.createElement("span");
		title2.innerText = tab.title.substr(highlightIndex + input.value.length);

		const title = document.createElement("span");
		title.className = "tabswitcher-title";
		title.appendChild(title1);
		title.appendChild(highlight);
		title.appendChild(title2);

		const item = document.createElement("div");
		item.className = "tabswitcher-item";
		item.appendChild(icon);
		item.appendChild(title);

		itemContainer.appendChild(item);
	});

	const tabCount = tabs.filter(tab => regex.test(tab.title)).length;
	if (count == 20 && tabCount > 20) info.innerText = `+ ${tabCount - count} more tabs`;
	else if (count === 0) info.innerText = "No tabs found";
	else info.innerText = "";

	updateSelection();
}

function updateSelection() {
	[].slice.call(container.getElementsByClassName("tabswitcher-selected"))
		.forEach(item => item.classList.remove("tabswitcher-selected"));

	container.getElementsByClassName("tabswitcher-item")[selectedIndex].classList.add("tabswitcher-selected");
}

// Listen for keyboard shortcut
document.addEventListener("keydown", event => {
	if (
		event.altKey !== shortcut.alt ||
		event.ctrlKey !== shortcut.ctrl ||
		event.shiftKey !== shortcut.shift ||
		event.code !== shortcut.key
	) {
		return;
	}

	container.style.display = "block";
	selectedIndex = 0;
	input.value = "";
	input.focus();
});

input.addEventListener("keydown", event => {
	if (event.code === "Escape") {
		container.style.display = "none";
		return;
	}

	if (event.code === "ArrowDown") {
		selectedIndex = Math.min(19, tabs.length, selectedIndex + 1);
		updateSelection();
		return false;
	}

	if (event.code === "ArrowUp") {
		selectedIndex = Math.max(0, selectedIndex - 1);
		updateSelection();
		return false;
	}

	// Override sites that prevent all keystrokes
	event.stopPropagation();
	return true;
});

input.addEventListener("keyup", updateResults);

input.addEventListener("blur", event => {
	container.style.display = "none";
});
