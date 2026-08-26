# FORM LAB · 粵語動作姿勢指南

靜態 PWA 網站，收納 36 張粵語完整步驟卡，並標示建議重量、預計分鐘、進階對應。

## 語言

- **預設：繁體中文粵語（yue）**
- 简体中文
- English

介面／動作名稱／說明會跟語言切換；步驟卡圖片維持粵語。

## PWA

支援加入主畫面（manifest + service worker）。本機需用 `http://localhost` 開啟。

## 本機開啟

```bash
cd ~/Projects/01-Active/cantonese-form-lab
python3 -m http.server 5173
```

打開：http://localhost:5173

## 結構

- `index.html` / `styles.css` / `app.js` — UI
- `i18n.js` — 介面字串
- `data.js` — 多語動作資料
- `manifest.webmanifest` / `sw.js` — PWA
- `public/cards/` — 步驟卡圖片
