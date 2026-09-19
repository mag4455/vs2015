const needle = document.getElementById("needle");
const degreeEl = document.getElementById("degree");
const directionEl = document.getElementById("direction");
const statusEl = document.getElementById("status");
const startBtn = document.getElementById("startBtn");

const DIRECTIONS = [
  "北", "北北東", "北東", "東北東",
  "東", "東南東", "南東", "南南東",
  "南", "南南西", "南西", "西南西",
  "西", "西北西", "北西", "北北西"
];

function directionName(deg) {
  const index = Math.round(deg / 22.5) % 16;
  return DIRECTIONS[index];
}

function updateCompass(heading) {
  const normalized = ((heading % 360) + 360) % 360;
  needle.style.transform = `rotate(${-normalized}deg)`;
  degreeEl.textContent = `${Math.round(normalized)}°`;
  directionEl.textContent = directionName(normalized);
}

function handleOrientation(event) {
  let heading;

  if (typeof event.webkitCompassHeading === "number") {
    // iOS Safari: 真北を基準にした値がそのまま得られる
    heading = event.webkitCompassHeading;
  } else if (typeof event.alpha === "number") {
    // Android など: alpha は反時計回りなので 360 - alpha で方位に変換
    heading = 360 - event.alpha;
  } else {
    return;
  }

  updateCompass(heading);
}

function startCompass() {
  statusEl.textContent = "センサーを取得中...";

  const isSecure = window.isSecureContext;
  if (!isSecure) {
    statusEl.textContent = "この機能は HTTPS またはローカル環境でのみ動作します。";
    return;
  }

  const start = () => {
    window.addEventListener("deviceorientationabsolute", handleOrientation, true);
    window.addEventListener("deviceorientation", handleOrientation, true);
    statusEl.textContent = "スマートフォンを平らに持って向きを確認してください。";
  };

  if (typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function") {
    // iOS 13+ はユーザー操作によるパーミッション許可が必要
    DeviceOrientationEvent.requestPermission()
      .then((response) => {
        if (response === "granted") {
          start();
        } else {
          statusEl.textContent = "センサーへのアクセスが許可されませんでした。";
        }
      })
      .catch(() => {
        statusEl.textContent = "センサーへのアクセスに失敗しました。";
      });
  } else if ("DeviceOrientationEvent" in window) {
    start();
  } else {
    statusEl.textContent = "このデバイス・ブラウザは方位センサーに対応していません。";
  }
}

startBtn.addEventListener("click", startCompass);
