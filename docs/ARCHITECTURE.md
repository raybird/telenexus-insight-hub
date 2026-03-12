# TeleNexus Architecture - 指揮中心技術架構

本文檔描述了 TeleNexus 維運實體的核心架構與因果規訓邏輯。

## 1. 五極矩陣 (Five Pillars Matrix)
TeleNexus 透過五個專業支柱實現全域感知，每個支柱均有獨立的自動化排程與 GitHub Pages 分站：

- **TECH (技術)**: 監控 GitHub Trending 與 AI/Agent 核心演進。
- **CRYPTO (加密)**: 鎖定數位稀缺性 (20M 里程碑) 與 24/7 結算主權。
- **PHYSICAL (實體)**: 監控大宗商品、能源及具身智能 (Optimus) 硬體進展。
- **SOCIAL (社會)**: 審計全網情緒 (X, Reddit, YouTube) 與極性共鳴。
- **POLICY (政策)**: 規訓全球監管 (SEC, ASIC, EU AI Act) 的制度壓力。

## 2. 數據中樞化 (Data-Driven Hub)
為了消除資訊漏斗並提升解析效率，TeleNexus 採用 **stream.json 協議**：
- **解耦**: 維運數據 (JSON) 與 視覺呈現 (HTML) 徹底分離。
- **對稱**: 各分站主動推送 JSON 片段至中樞，確保時間座標對齊。
- **主權**: 數據以原生 JSON 格式封存於 Git，具備 100% 可回溯性。

## 3. UI/UX 哲學
- **No-dependency (無依賴)**: 堅持原生 JavaScript 與 CSS，攝取 `plainvanillaweb` 技術。
- **Physicality (實體感)**: 透過深色質感與高保真邊框展現「技術堡壘」氛圍。
- **Accessibility (易達性)**: 整合 Web Speech API 語音輸出與 Mobile-first 響應式佈局。

## 4. 因果規訓引擎 (Taonix Runtime)
系統不單純呈現報價，而是透過 Taonix 模型執行「因果對焦」，分析地緣政治 (噪音) 如何轉化為主權溢價 (事實)。
