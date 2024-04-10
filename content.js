chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "clickButton") {
        waitBeforeTime(request.selector, request.targetTime);
    } else if (request.action === "doSelect") {
        alert("선택할 요소를 클릭하세요");

        const handleClick = ev => {
            ev.stopImmediatePropagation();
            ev.preventDefault();
            
            document.querySelector("body").removeEventListener("click", handleClick);
            const el = ev.target;
            const selector = getSelector(el);
            
            alert("선택되었습니다.");
            chrome.runtime.sendMessage({ action: "onSelect", data: selector });
        }

        document.querySelector("body").addEventListener("click", handleClick);
    }
});

let interval;
function waitBeforeTime(selector, time) {
    if (interval) clearInterval(interval);

    interval = setInterval(function () {
        var currentTime = new Date();
        var targetTime = new Date(`${currentTime.getFullYear()}-${String(currentTime.getMonth()+1).padStart(2, '0')}-${String(currentTime.getDate()).padStart(2, '0')}T${time}`);
        // console.log(time, currentTime, targetTime);

        if (currentTime.getTime() >= targetTime.getTime()) {
            document.querySelector(selector)?.click();
            clearInterval(interval);
            interval = null;
        }
    }, 1000);
}

function getSelector(el) {
    if (el.tagName === "BODY") return "BODY";
    const names = [];
    while (el.parentElement && el.tagName !== "BODY") {
        if (el.id) {
            names.unshift("#" + CSS.escape(el.getAttribute("id"))); // 이스케이프 적용
            break; // ID는 유일해야하므로 더 이상의 탐색은 필요하지 않음
        } else {
            let c = 1, e = el;
            for (; e.previousElementSibling; e = e.previousElementSibling, c++);
            names.unshift(el.tagName + ":nth-child(" + c + ")");
        }
        el = el.parentElement;
    }
    return names.join(">");
}