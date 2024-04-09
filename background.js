chrome.runtime.onInstalled.addListener(function () {
    console.log("Extension installed");
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action == "startTimer") {
        const interval = setInterval(function () {
            var currentTime = new Date();
            var targetTime = new Date(currentTime.toISOString().slice(0, 10) + "T" + request.targetTime);
            console.log(targetTime);

            if (currentTime.getTime() >= targetTime.getTime()) {
                chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, { action: "clickButton", selector: request.selector });
                });
                clearInterval(interval);
            }
        }, 1000);
    }
});
