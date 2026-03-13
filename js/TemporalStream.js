/**
 * TemporalStream.js - TeleNexus 演化時光機核心引擎
 * 負責跨分站數據拉取 (Fetch) 與流式因果渲染 (Streaming Rendering)
 */

class TemporalStream {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.pillars = [
            { name: 'CRYPTO', url: 'https://raybird.github.io/crypto-market-pulse/stream.json' },
            { name: 'SOCIAL', url: 'https://raybird.github.io/social-sentiment-observatory/stream.json' }
            // 待補齊 PHYSICAL, POLICY, TECH 的 stream.json
        ];
        this.allEvents = [];
    }

    async init() {
        console.log("Initializing TemporalStream...");
        await this.fetchAllData();
        this.renderTimeline();
    }

    async fetchAllData() {
        const fetchPromises = this.pillars.map(async (pillar) => {
            try {
                const response = await fetch(pillar.url, { cache: "no-store" });
                const data = await response.json();
                return data.history.map(event => ({
                    ...event,
                    pillar: pillar.name,
                    // 統一時間戳格式供排序
                    isoTime: new Date(event.timestamp).getTime()
                }));
            } catch (err) {
                console.error(`Failed to fetch stream for ${pillar.name}:`, err);
                return [];
            }
        });

        const results = await Promise.all(fetchPromises);
        this.allEvents = results.flat().sort((a, b) => b.isoTime - a.isoTime);
    }

    renderTimeline() {
        if (!this.container) return;
        
        // 清空現有靜態內容（保留樣式結構）
        this.container.innerHTML = '';

        this.allEvents.forEach(event => {
            const item = document.createElement('div');
            item.className = 'timeline-item';
            
            // 格式化顯示時間
            const date = new Date(event.timestamp);
            const timeStr = date.toLocaleString('zh-TW', { 
                month: '2-digit', day: '2-digit', 
                hour: '2-digit', minute: '2-digit', hour12: false 
            });

            const content = `
                <div class="timeline-time">${timeStr} <span class="stream-tag" style="margin-left:10px">${event.pillar}</span></div>
                <div class="timeline-body">
                    <strong>${event.version || '維運紀錄'}</strong><br>
                    ${event.causal_summary || event.causal_point || '數據更新'}
                    ${event.price ? `<div style="margin-top:8px; font-family:'JetBrains Mono'; color:var(--primary)">VALUE: $${event.price} (${event.change})</div>` : ''}
                    ${event.bullish_consensus ? `<div style="margin-top:8px; color:var(--secondary)">CONSENSUS: ${event.bullish_consensus}</div>` : ''}
                </div>
            `;
            item.innerHTML = content;
            this.container.appendChild(item);
        });

        console.log(`Rendered ${this.allEvents.length} events to Timeline.`);
    }
}

// 導出或掛載到 window
window.TemporalStream = TemporalStream;
