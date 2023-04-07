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
				.query({ currentWindow: true, hidden: false })
				.then(tabs => {
					browser.tabs.sendMessage(sender.tab.id, {
						type: "tabs",
						tabs,
					});
				});

			break;
		case "switch-tab":
			browser.tabs.update(
				parseInt(message.tab),
				{ active: true }
			);		
			break;
	}
});

browser.tabs.onUpdated.addListener(() => {
	browser.tabs
		.query({ currentWindow: true, hidden: false })
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
});

