chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action == "clickButton") {
        document.querySelector(request.selector)?.click();
    }
});
