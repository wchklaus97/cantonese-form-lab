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

**檔案上限：每個 `.js` / `.css` 約 600 行以內**（見 `design.md`）。

- `index.html` — 頁面骨架
- `js/main.js` — 入口（ES modules）
- `js/` — UI 邏輯（locale、library、modal、bindings…）
- `css/` — 樣式分檔（tokens、layout、library、modal、agent）
- `data/` — 課表與動作資料（按肌群分檔）
- `i18n.js` — 介面字串
- `agent.js` — Form Agent sprite 引擎
- `manifest.webmanifest` / `sw.js` — PWA
- `public/cards/` — 步驟卡圖片（`thumbs/` 為列表縮圖）
