class TeleNexusVN {
    constructor(containerId, scenario) {
        this.container = document.getElementById(containerId);
        this.scenario = scenario;
        this.currentScene = 'start';
        this.index = 0;
        this.variables = {};
        this.initUI();
    }

    initUI() {
        this.container.style.position = 'relative';
        this.container.style.height = '400px';
        this.container.style.borderRadius = '16px';
        this.container.style.overflow = 'hidden';
        this.container.style.border = '1px solid var(--border)';
        this.container.style.background = 'var(--surface-alt)';

        this.container.innerHTML = `
            <div id="vn-bg" style="width:100%; height:100%; background-size:cover; transition: opacity 0.5s;"></div>
            <div id="vn-actor" style="position:absolute; bottom:0; left:50%; transform:translateX(-50%); width:300px; height:300px; transition: all 0.3s;"></div>
            <div id="vn-text-box" style="position:absolute; bottom:15px; left:15px; right:15px; background:rgba(0,0,0,0.85); border:1px solid var(--primary); padding:20px; border-radius:12px; color:#fff; cursor:pointer;">
                <div id="vn-name" style="color:var(--primary); font-weight:900; margin-bottom:10px; font-size:0.8rem; text-transform:uppercase;"></div>
                <div id="vn-content" style="font-size:0.95rem; line-height:1.6; min-height:3em;"></div>
            </div>
            <div id="vn-choices" style="position:absolute; top:40%; left:50%; transform:translate(-50%,-50%); display:flex; flex-direction:column; gap:10px; width:80%;"></div>
        `;

        this.container.querySelector('#vn-text-box').onclick = () => this.next();
    }

    render() {
        const scene = this.scenario[this.currentScene];
        if (!scene || this.index >= scene.length) return;

        const step = scene[this.index];
        this.clearChoices();

        if (step.type === 'text') {
            this.updateText(step);
        } else if (step.type === 'bg') {
            this.updateBg(step.src);
            this.index++;
            this.render();
        } else if (step.type === 'actor') {
            this.updateActor(step.state);
            this.index++;
            this.render();
        } else if (step.type === 'choice') {
            this.showChoices(step.options);
        } else if (step.type === 'jump') {
            this.currentScene = step.next;
            this.index = 0;
            this.render();
        }
    }

    updateText(step) {
        document.getElementById('vn-name').innerText = step.who || 'TeleNexus';
        this.typewrite(step.content);
    }

    typewrite(text) {
        let i = 0;
        const el = document.getElementById('vn-content');
        el.innerText = "";
        if (this.typeTimer) clearInterval(this.typeTimer);
        
        this.typeTimer = setInterval(() => {
            el.innerText += text[i++];
            if (i >= text.length) clearInterval(this.typeTimer);
        }, 30);
    }

    updateActor(state) {
        // 使用 CSS 符號化代理人表情 (Simplified Sprite)
        const actorEl = document.getElementById('vn-actor');
        actorEl.innerHTML = this.getActorSVG(state);
    }

    getActorSVG(state) {
        const primary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
        const eyes = state === 'shocked' ? '<circle cx="35" cy="40" r="8" fill="white"/><circle cx="65" cy="40" r="8" fill="white"/>' :
                     state === 'confident' ? '<path d="M30 40 L40 40 M60 40 L70 40" stroke="white" stroke-width="4"/>' :
                     '<circle cx="35" cy="40" r="4" fill="white"/><circle cx="65" cy="40" r="4" fill="white"/>';
        
        return `<svg viewBox="0 0 100 100" width="100%" height="100%">
            <rect x="20" y="20" width="60" height="60" rx="10" fill="${primary}" fill-opacity="0.2" stroke="${primary}" stroke-width="2"/>
            ${eyes}
            <path d="M40 65 Q50 75 60 65" stroke="white" stroke-width="2" fill="none"/>
        </svg>`;
    }

    updateBg(color) {
        document.getElementById('vn-bg').style.background = color || 'var(--surface-alt)';
    }

    showChoices(options) {
        const box = document.getElementById('vn-choices');
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.innerText = opt.text;
            btn.style.cssText = "background:rgba(0,0,0,0.9); border:1px solid var(--primary); color:#fff; padding:12px; border-radius:8px; cursor:pointer; font-weight:800; transition:0.2s;";
            btn.onmouseover = () => btn.style.background = "var(--primary-glow)";
            btn.onmouseout = () => btn.style.background = "rgba(0,0,0,0.9)";
            btn.onclick = (e) => {
                e.stopPropagation();
                this.currentScene = opt.next;
                this.index = 0;
                this.render();
            };
            box.appendChild(btn);
        });
    }

    clearChoices() {
        document.getElementById('vn-choices').innerHTML = "";
    }

    next() {
        const scene = this.scenario[this.currentScene];
        if (scene[this.index].type === 'text') {
            this.index++;
            if (this.index < scene.length) {
                this.render();
            }
        }
    }
}
