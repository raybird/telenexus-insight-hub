/**
 * TemporalStream.js - TeleNexus 演化時光機核心引擎
 * 負責跨分站數據拉取 (Fetch) 與流式因果渲染 (Streaming Rendering)
 */

class TemporalStream {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.pillars = [
            { name: 'CRYPTO', url: 'https://raybird.github.io/crypto-market-pulse/stream.json' },
            { name: 'SOCIAL', url: 'https://raybird.github.io/social-sentiment-observatory/stream.json' },
            { name: 'PHYSICAL', url: 'https://raybird.github.io/physical-intelligence-hub/stream.json' },
            { name: 'POLICY', url: 'https://raybird.github.io/institutional-policy-hub/stream.json' },
            { name: 'TECH', url: 'https://raybird.github.io/tech-scouting-hub/stream.json' }
        ];
        this.allEvents = [];
    }

    async init() {
        console.log("Initializing TemporalStream...");
        await this.fetchAllData();
        this.renderTimeline();
        this.renderPillarDetails();
    }

    async fetchAllData() {
        const fetchPromises = this.pillars.map(async (pillar) => {
            try {
                const response = await fetch(pillar.url, { cache: "no-store" });
                const data = await response.json();
                
                // 儲存每個支柱的最新快照供 Details 使用
                this[pillar.name.toLowerCase() + 'Latest'] = data.history[0];

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

    renderPillarDetails() {
        const detailContainer = document.getElementById('pillar-dynamic-details');
        if (!detailContainer) return;

        detailContainer.innerHTML = '';

        const pillarInfo = [
            { id: 'crypto', icon: '₿', title: 'Crypto Market Pulse', color: 'var(--primary)' },
            { id: 'physical', icon: '🌍', title: 'Physical Intelligence', color: '#ff453a' },
            { id: 'policy', icon: '🏛️', title: 'Institutional & Policy', color: '#a2a2a2' },
            { id: 'social', icon: '💬', title: 'Social Sentiment', color: '#ff8800' },
            { id: 'tech', icon: '🤖', title: 'Tech Scouting', color: '#00ff88' }
        ];

        pillarInfo.forEach(p => {
            const data = this[p.id + 'Latest'];
            if (!data) return;

            const panel = document.createElement('div');
            panel.className = 'panel';
            panel.style.borderLeft = `4px solid ${p.color}`;
            
            panel.innerHTML = `
                <div class="section-header" style="color: ${p.color}; border-bottom:none; margin-bottom:0.5rem;">
                    ${p.icon} ${p.title}
                    <span style="font-size:0.6rem; color:var(--text-muted); margin-left:auto;">${data.version || ''}</span>
                </div>
                <div style="font-size: 0.9rem; margin-bottom: 1rem; color: var(--text);">
                    ${data.causal_summary || data.causal_point || '待更新...'}
                </div>
                <div style="display:flex; gap:15px; flex-wrap:wrap;">
                    ${data.price ? `<span class="stream-tag">BTC: $${data.price}</span>` : ''}
                    ${data.oil_price ? `<span class="stream-tag" style="background:rgba(255,69,58,0.1); color:#ff453a;">OIL: ${data.oil_price}</span>` : ''}
                    ${data.clarity_index ? `<span class="stream-tag" style="background:rgba(162,162,162,0.1); color:#a2a2a2;">CLARITY: ${data.clarity_index}</span>` : ''}
                    ${data.bullish_consensus ? `<span class="stream-tag" style="background:rgba(255,136,0,0.1); color:#ff8800;">BULLISH: ${data.bullish_consensus}</span>` : ''}
                    ${data.top_trend ? `<span class="stream-tag" style="background:rgba(0,255,136,0.1); color:#00ff88;">TREND: ${data.top_trend}</span>` : ''}
                </div>
            `;
            detailContainer.appendChild(panel);
        });
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
                    ${event.oil_price ? `<div style="margin-top:8px; color:#ff453a">OIL: ${event.oil_price} | GOLD: ${event.gold_price}</div>` : ''}
                    ${event.clarity_index ? `<div style="margin-top:8px; color:#a2a2a2">INSTITUTIONAL CLARITY: ${event.clarity_index}</div>` : ''}
                    ${event.top_trend && event.pillar === 'TECH' ? `<div style="margin-top:8px; color:#00ff88">TREND: ${event.top_trend}</div>` : ''}
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
