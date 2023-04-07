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
	
	for (let i = 0; i < 20 && i < tabs.length; i++) {
		const tab = tabs[i];

		const icon = document.createElement("img");
		icon.className = "tabswitcher-icon";
		icon.src = tab.favIconUrl;
		icon.onerror = () => icon.style.visibility = "hidden";

		const highlightIndex = tab.title.indexOf(input.value);

		const title1 = document.createElement("span");
		title1.className = "tabswitcher-title";
		title1.innerText = tab.title.substr(0, highlightIndex);

		const highlight = document.createElement("span");
		highlight.className = "tabswitcher-highlight";
		highlight.innerText = tab.title.substr(highlightIndex, input.value.length);

		const title2 = document.createElement("span");
		title2.className = "tabswitcher-title";
		title2.innerText = tab.title.substr(highlightIndex + input.value.length);

		const item = document.createElement("div");
		item.className = "tabswitcher-item";
		item.appendChild(icon);
		item.appendChild(title1);
		item.appendChild(highlight);
		item.appendChild(title2);

		itemContainer.appendChild(item);
	}

	if (tabs.length > 20) info.innerText = `+ ${tabs.length - 20} more tabs`;
	else info.innerText = "";
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
	input.value = "";
	input.focus();
});

input.addEventListener("keydown", event => {
	if (event.code === "Escape") {
		container.style.display = "none";
		return;
	}

	// Override sites that prevent all keystrokes
	event.stopPropagation();
	return true;
});

input.addEventListener("blur", event => {
	container.style.display = "none";
});
