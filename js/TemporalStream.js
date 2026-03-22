/**
 * TemporalStream.js - TeleNexus 演化時光機核心引擎
 * 負責跨分站數據拉取 (Fetch) 與流式因果渲染 (Streaming Rendering)
 * v26.0322.0145: 修復 PHYSICAL 串流 undefined 崩潰問題，增加結構自適應邏輯。
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
        this.activeFilter = 'ALL';
    }

    async init() {
        console.log("Initializing TemporalStream...");
        await this.fetchAllData();
        this.renderFilterUI();
        this.renderTimeline();
        this.renderPillarDetails();
    }

    async fetchAllData() {
        const fetchPromises = this.pillars.map(async (pillar) => {
            try {
                const response = await fetch(pillar.url, { cache: "no-store" });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();
                
                // 結構自適應：支援 history 數組 或 單一物件結構
                const events = data.history ? data.history : [data];
                
                // 儲存最新快照
                this[pillar.name.toLowerCase() + 'Latest'] = events[0];

                return events.filter(e => e && e.timestamp).map(event => ({
                    ...event,
                    pillar: pillar.name,
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

    renderFilterUI() {
        const filterContainerId = 'timeline-filter-container';
        let filterContainer = document.getElementById(filterContainerId);
        
        if (!filterContainer) {
            filterContainer = document.createElement('div');
            filterContainer.id = filterContainerId;
            filterContainer.style.cssText = 'display:flex; gap:10px; margin-bottom:2rem; flex-wrap:wrap;';
            this.container.parentNode.insertBefore(filterContainer, this.container);
        }

        const options = ['ALL', ...this.pillars.map(p => p.name)];
        filterContainer.innerHTML = options.map(opt => `
            <button class="font-btn ${this.activeFilter === opt ? 'active' : ''}" 
                    onclick="window.temporalStreamInstance.setFilter('${opt}')"
                    style="padding: 4px 12px; font-size: 0.65rem;">
                ${opt}
            </button>
        `).join('');
    }

    setFilter(filter) {
        this.activeFilter = filter;
        this.renderFilterUI();
        this.renderTimeline();
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
            const panelId = `panel-voice-${p.id}`;
            panel.className = 'panel';
            panel.style.borderLeft = `4px solid ${p.color}`;
            
            // 相容性映射：支援舊版 caussal_summary 與新版 summary/stats
            const summaryText = data.summary || data.causal_summary || data.causal_point || '數據更新中...';
            const btcPrice = data.stats?.btc_price || data.price;
            const oilPrice = data.quotes?.oil || data.oil_price;

            panel.innerHTML = `
                <div class="section-header" style="color: ${p.color}; border-bottom:none; margin-bottom:0.5rem;">
                    ${p.icon} ${p.title}
                    <button class="voice-btn" style="margin-left:15px;" onclick="window.toggleSpeech('${panelId}', this)">🔊</button>
                    <span style="font-size:0.6rem; color:var(--text-muted); margin-left:auto;">${data.version || ''}</span>
                </div>
                <div id="${panelId}" style="font-size: 0.9rem; margin-bottom: 1rem; color: var(--text);">
                    ${summaryText}
                </div>
                <div style="display:flex; gap:15px; flex-wrap:wrap;">
                    ${btcPrice ? `<span class="stream-tag">BTC: $${btcPrice.toLocaleString()}</span>` : ''}
                    ${oilPrice ? `<span class="stream-tag" style="background:rgba(255,69,58,0.1); color:#ff453a;">OIL: $${oilPrice}</span>` : ''}
                    ${data.consensus || data.bullish_consensus ? `<span class="stream-tag" style="background:rgba(255,136,0,0.1); color:#ff8800;">BULLISH: ${data.consensus || data.bullish_consensus}</span>` : ''}
                </div>
            `;
            detailContainer.appendChild(panel);
        });
    }

    renderTimeline() {
        if (!this.container) return;
        this.container.innerHTML = '';

        const filteredEvents = this.activeFilter === 'ALL' 
            ? this.allEvents 
            : this.allEvents.filter(e => e.pillar === this.activeFilter);

        filteredEvents.forEach(event => {
            const item = document.createElement('div');
            item.className = 'timeline-item';
            
            const date = new Date(event.timestamp);
            const timeStr = isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString('zh-TW', { 
                month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false 
            });

            // 相容性內容映射
            const displaySummary = event.summary || event.causal_summary || event.causal_point || '數據結算完成';
            const btcPrice = event.stats?.btc_price || event.price;
            const oilPrice = event.quotes?.oil || event.oil_price;

            const content = `
                <div class="timeline-time">${timeStr} <span class="stream-tag" style="margin-left:10px">${event.pillar}</span></div>
                <div class="timeline-body">
                    <strong>${event.version || '維運紀錄'}</strong><br>
                    ${displaySummary}
                    ${btcPrice ? `<div style="margin-top:8px; font-family:'JetBrains Mono'; color:var(--primary)">VALUE: $${btcPrice.toLocaleString()}</div>` : ''}
                    ${oilPrice ? `<div style="margin-top:8px; color:#ff453a">OIL: $${oilPrice}</div>` : ''}
                </div>
            `;
            item.innerHTML = content;
            this.container.appendChild(item);
        });
    }
}

window.TemporalStream = TemporalStream;
