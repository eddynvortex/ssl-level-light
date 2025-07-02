// background.js

const API_BASE = "https://ssl-checker-u0nl.onrender.com/api/sslinfo?domain=";

// 색상별 툴팁 텍스트 정의
function getTooltipTextByColor(color) {
  switch (color) {
    case "green":
      return "신뢰할 수 있는 유료 SSL 인증서 적용 사이트입니다.";
    case "yellow":
      return "무료 SSL 인증서를 적용한 사이트입니다. 주의가 필요합니다.";
    case "blue":
      return "신뢰할 수 있는 Sectigo SSL 인증서를 적용한 사이트입니다.";
    case "gray":
    default:
      return "SSL 인증서가 없거나 인식이 불가능한 사이트입니다.";
  }
}

// 아이콘 및 툴팁 업데이트 함수
async function updateIcon(tabId, url) {
  if (!url || !url.startsWith("http")) return;
  const hostname = new URL(url).hostname;
  console.log("[SSL Level Light] fetching for", hostname);

  try {
    const res = await fetch(API_BASE + hostname);
    const { color } = await res.json();  // 서버가 내려주는 color 필드 사용
    console.log("[SSL Level Light] setting icon:", color);
    chrome.action.setIcon({ tabId, path: `icons/${color}.png` });
    chrome.action.setTitle({ tabId, title: getTooltipTextByColor(color) }); // 툴팁 설정
  } catch (e) {
    console.error("[SSL Level Light] API error:", e);
    chrome.action.setIcon({ tabId, path: "icons/gray.png" });
    chrome.action.setTitle({ tabId, title: getTooltipTextByColor("gray") }); // 기본 회색 툴팁
  }
}

// 페이지 로드 완료 시
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    updateIcon(tabId, tab.url);
  }
});

// 탭 전환 시
chrome.tabs.onActivated.addListener(activeInfo => {
  chrome.tabs.get(activeInfo.tabId, tab => {
    updateIcon(activeInfo.tabId, tab.url);
  });
});

// 설치 직후 및 브라우저 시작 직후
chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (tabs[0]) updateIcon(tabs[0].id, tabs[0].url);
  });
});
chrome.runtime.onStartup.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (tabs[0]) updateIcon(tabs[0].id, tabs[0].url);
  });
});
