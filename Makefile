all: chrome mozilla
clean:
	rm aleksi-plugin-chrome.zip aleksi-plugin-mozilla.zip
chrome:
	cp plugin/manifest-chrome.json plugin/manifest.json
	zip -r aleksi-plugin-chrome.zip plugin
mozilla:
	cp plugin/manifest-mozilla.json plugin/manifest.json
	zip -r aleksi-plugin-mozilla.zip plugin
