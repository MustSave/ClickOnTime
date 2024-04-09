document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("startTimer").addEventListener("click", function () {
        var targetTime = document.getElementById("targetTime").value;
        var selector = document.getElementById("selector").value; // 사용자가 입력한 셀렉터 가져오기

        // 백그라운드 스크립트로 메시지를 보내어 타이머를 시작하도록 합니다.
        chrome.runtime.sendMessage({ action: "startTimer", targetTime: targetTime, selector: selector });
    });
});
