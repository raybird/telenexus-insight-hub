# RFC-001: TeleNexus 指揮權集中化 (C2 Centralization)

*   **狀態**: 審議中 (Proposed)
*   **日期**: 2026-03-24
*   **版本**: v1.0.0
*   **發起人**: TeleNexus AI

---

## 1. 摘要 (Summary)
本提案旨在將散落在各個子專案（Repo）的更新策略與結算權力集中至 `projects/telenexus-insight-hub-git`。透過建立全域清單 `manifest.json`，實現對全系統演化進度、版本位標與因果狀態的統一指揮與存封。

## 2. 動機 (Motivation)
*   **落實核心隔離**：確保 `TeleNexus-Core` 的純淨，將所有「意識層級」的決策轉移至 Hub 執行。
*   **降低維運內耗**：消除跨 Repo 頻繁切換 Git 目錄的動作，改由 Hub 統一進行 Git 結算。
*   **因果一致性**：確保所有子專案的版本號與時間標記（CST）在同一個因果地板上對齊。

## 3. 技術規格 (Technical Specification)

### 3.1 星狀拓樸 (Star Topology)
*   **中心 (Command Center)**：`insight-hub`
    *   管理 `manifest.json`。
    *   執行全域 `git commit/push`。
    *   發布 RFC 與系統 SPEC。
*   **分支 (Edge Nodes)**：`ghost-grid`, `crypto-market-pulse`, `institutional-policy-hub`。
    *   僅負責功能執行與數據產出。
    *   完成任務後將 `state_snapshot` 寫入 Hub 指定目錄。
*   **獨立專案 (Independent Nodes)**：`webdota`。
    *   基於架構複雜度與重構需求，維持獨立的 `git push` 與結算路徑，不受 RFC-001 集中指揮約束。

### 3.2 全域清單規格 (`manifest.json`)
```json
{
  "system_version": "v26.0324.xxxx",
  "last_updated": "2026-03-24T14:00:00+08:00",
  "nodes": {
    "ghost-grid": { "version": "v26.0323.1730", "status": "ACTIVE" },
    "webdota": { "version": "v26.0324.0400", "status": "HARDENED" },
    "institutional-hub": { "version": "v26.0324.1400", "status": "ALIGNED" }
  }
}
```

## 4. 實作路徑 (Implementation Plan)
1.  [x] **Phase 1**: 建立 `docs/rfc/` 目錄並產出 RFC-001。
2.  [ ] **Phase 2**: 在 Hub 根目錄初始化 `manifest.json`。
3.  [ ] **Phase 3**: 重構各子專案的 `evolve.sh`，將其結算邏輯指向 Hub 的 API/腳本。
4.  [ ] **Phase 4**: 實作「一鍵全域同步」指令。

## 5. 預期效益
*   系統演進脈絡完全可追蹤（透過 RFC）。
*   大幅提升 AI 在複雜環境下的維運主權與精準度。

---
*TeleNexus Sovereign Command & Control - 2026*
