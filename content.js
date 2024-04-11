chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "clickButton") {
        waitBeforeTime(request.selector, request.targetTime, request.timeSource);
    } else if (request.action === "doSelect") {
        alert("선택할 요소를 클릭하세요");

        // 요소에 마우스 오버 이벤트 리스너 추가
        document.body.addEventListener('mouseover', handleMouseOverEvent);

        // 요소에서 마우스가 벗어날 때 하이라이트 제거
        document.body.addEventListener('mouseout', handleMouseOutEvent);

        // 요소를 클릭할 때 하이라이트 제거
        document.body.addEventListener('click', handleClickEvent, { capture: true });

        // 우클릭 이벤트 발생 시 하이라이트 제거
        document.body.addEventListener('contextmenu', handleContextMenuEvent, { capture: true });
    }
});

const intervalMap = {};
async function waitBeforeTime(selector, time, timeSource) {
    const key = selector + time;
    if (intervalMap[key]) clearInterval(intervalMap[key]);
    let targetTime, timeDiff = 0;
    const currentTime = new Date();

    if (timeSource === "local") {
        targetTime = new Date(`${currentTime.getFullYear()}-${String(currentTime.getMonth() + 1).padStart(2, '0')}-${String(currentTime.getDate()).padStart(2, '0')}T${time}`);
        timeDiff = 0;
    } else if (timeSource === "server") {
        const res = await fetch("/").catch(() => {
            const map = new Map();
            map.set("Date", new Date());
            return { headers: map };
        });
        const dateHeader = res.headers.get("Date");
        if (!dateHeader) alert("서버에서 시간을 가져올 수 없어 로컬 컴퓨터 시간으로 계산됩니다.");
        const serverTime = dateHeader ? new Date(dateHeader) : new Date();
        targetTime = new Date(`${serverTime.getFullYear()}-${String(serverTime.getMonth() + 1).padStart(2, '0')}-${String(serverTime.getDate()).padStart(2, '0')}T${time}`);
        timeDiff = serverTime.getTime() - currentTime.getTime();
    } else if (timeSource === "external") {
        const json = await fetch("https://worldtimeapi.org/api/ip")
            .then(res => res.json())
            .catch(() => { datetime: new Date().getTime() });
        const serverTime = new Date(json.datetime);
        targetTime = new Date(`${serverTime.getFullYear()}-${String(serverTime.getMonth() + 1).padStart(2, '0')}-${String(serverTime.getDate()).padStart(2, '0')}T${time}`);
        timeDiff = serverTime.getTime() - currentTime.getTime();
    }

    console.log(timeSource, targetTime, timeDiff);

    const interval = setInterval(function () {
        if (checkTimeOver(targetTime, timeDiff)) {
            document.querySelector(selector)?.click();
            clearInterval(interval);
            delete intervalMap[key];
        }
    }, 1000);
    intervalMap[key] = interval;
}

function checkTimeOver(targetTime, timeDiff) {
    const currentTime = new Date(new Date().getTime() + timeDiff);
    return currentTime.getTime() >= targetTime.getTime();
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

const highlightStyle = `
    position: absolute;
    pointer-events: none;
    background-color: rgba(255, 255, 0, 0.3);
    border: 2px solid rgba(255, 255, 0, 0.5);
    z-index: 999999;
`;

// 요소 강조를 위한 공통 함수
function highlightElement(target) {
    const rect = target.getBoundingClientRect();
    const highlight = document.createElement('div');
    highlight.style.cssText = `
        ${highlightStyle}
        top: ${rect.top + window.scrollY}px;
        left: ${rect.left + window.scrollX}px;
        width: ${rect.width}px;
        height: ${rect.height}px;
    `;
    document.body.appendChild(highlight);
    target.__highlight__ = highlight;
}

const handleMouseOverEvent = event => {
    highlightElement(event.target);
}

const handleMouseOutEvent = event => {
    removeHighlight(event.target);
}

const removeEventListeners = () => {
    document.body.removeEventListener('contextmenu', handleContextMenuEvent, { capture: true });
    document.body.removeEventListener('click', handleClickEvent, { capture: true });
    document.body.removeEventListener('mouseover', handleMouseOverEvent);
    document.body.removeEventListener('mouseout', handleMouseOutEvent);
}

const handleClickEvent = event => {
    clearSelectEvent(event);

    const selector = getSelector(event.target);
    chrome.runtime.sendMessage({ action: "onSelect", data: selector });

    alert("선택되었습니다.");
}

const handleContextMenuEvent = event => {
    clearSelectEvent(event);
}

function clearSelectEvent(event) {
    event.stopImmediatePropagation();
    event.preventDefault();
    removeEventListeners();
    removeHighlight(event.target);
}

// 요소 강조를 제거하는 공통 함수
function removeHighlight(target) {
    if (target !== document.body && target.__highlight__) {
        target.__highlight__.parentNode.removeChild(target.__highlight__);
        delete target.__highlight__;
    }
}
