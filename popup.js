document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("startTimer").addEventListener("click", function () {
        if (!confirm("확인을 누르면 타이머가 시작됩니다.")) return;
        
        var targetTime = document.getElementById("targetTime").value;
        var selector = document.getElementById("selector").value; // 사용자가 입력한 셀렉터 가져오기

        localStorage.setItem("targetTime", targetTime);

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs.length === 0) {
                console.log("No active tab");
                return;
            }
            chrome.tabs.sendMessage(tabs[0].id, { action: "clickButton", selector, targetTime });
        });
    });

    var targetTime = localStorage.getItem("targetTime");
    if (targetTime) {
        document.getElementById("targetTime").value = targetTime;
    }

    chrome.runtime.sendMessage({ action: "getSelector" }, response => {
        console.log(response);
        if (response?.data) {
            document.getElementById("selector").value = response.data;
        }
    });

    document.getElementById("selectElement").addEventListener("click", function () {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            chrome.tabs.sendMessage(tab.id, { action: 'doSelect' });
        });
    });
});
