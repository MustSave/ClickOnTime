chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "getSelector") {
        chrome.storage.local.get(["selector"], val => {
            sendResponse({ data: val.selector });
        });
        return true;
    } else if (request.action === "onSelect") {
        chrome.storage.local.set({ selector: request.data });
    }
});