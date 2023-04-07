browser.runtime.onMessage.addListener((message, sender, respond) => {
	switch (message.type) {
		case "init":
			browser.tabs.sendMessage(sender.tab.id, {
				type: "shortcut",
				shortcut: {
					ctrl: true,
					shift: true,
					alt: false,
					key: "Space",
				},
			});

			browser.tabs
				.query({ currentWindow: true })
				.then(tabs => {
					browser.tabs.sendMessage(sender.tab.id, {
						type: "tabs",
						tabs,
					});
				});

			break;
		case "switch_tab":
			
			break;
	}
});

browser.tabs.onUpdated.addListener(sendTabs);

function sendTabs() {
	browser.tabs
		.query({
			currentWindow: true,
			active: true,
		})
		.then(tabs => {

			tabs.forEach(tab => {
				browser.tabs.sendMessage(
					tab.id,
					{
						type: "tabs",
						tabs,
					},
				);
			});

		});
}
