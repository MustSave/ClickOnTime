document.addEventListener("DOMContentLoaded", function () {
    // 로컬 스토리지에서 기본 값을 가져오기
    const defaultTimeSource = localStorage.getItem("timeSource");

    // 만약 기본 값이 있다면 해당 값으로 설정하기
    if (defaultTimeSource) {
        document.querySelector(`input[value="${defaultTimeSource}"]`).checked = true;
    }

    // 라디오 버튼 변경 시 이벤트 리스너 등록
    document.querySelectorAll('input[name="timeSource"]').forEach(function (radio) {
        radio.addEventListener("change", function () {
            // 변경된 값을 로컬 스토리지에 저장하기
            localStorage.setItem("timeSource", this.value);
        });
    });

    document.getElementById("startTimer").addEventListener("click", function () {
        if (!confirm("확인을 누르면 타이머가 시작됩니다.")) return;

        var targetTime = document.getElementById("targetTime").value;
        var selector = document.getElementById("selector").value; // 사용자가 입력한 셀렉터 가져오기
        var timeSource = document.querySelector('input[name="timeSource"]:checked').value;

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs.length === 0) {
                console.log("No active tab");
                return;
            }
            chrome.tabs.sendMessage(tabs[0].id, { action: "clickButton", selector, targetTime, timeSource });

            window.close();
        });
    });

    document.getElementById("targetTime").addEventListener("change", ev => {
        localStorage.setItem("targetTime", ev.target.value);
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
