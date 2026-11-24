if (typeof tailwind !== 'undefined') {
    tailwind.config = {
        theme: {
            extend: {
                colors: {
                    accent: '#a100ff',
                    darkBg: '#0b0f19',
                },
                fontFamily: {
                    serif: ['"Noto Serif JP"', 'serif'],
                    sans: ['Inter', 'sans-serif'],
                }
            }
        }
    };
}

async function loadSections() {
    const containers = document.querySelectorAll('[data-section]');

    for (const container of containers) {
        const url = container.getAttribute('data-section');
        if (!url) continue;

        try {
            const response = await fetch(url, { cache: 'no-store' });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status} for ${url}`);
            }
            container.innerHTML = await response.text();
        } catch (error) {
            console.error('セクション読み込みエラー:', error);
            container.innerHTML = `
                <div class="py-12 px-6 text-center text-sm text-gray-400 border-b border-gray-800">
                    セクション（${url}）の読み込みに失敗しました。ローカル環境の場合はHTTPサーバー経由で開いてください。
                </div>
            `;
        }
    }

    if (window.location.hash) {
        const target = document.querySelector(window.location.hash);
        if (target) {
            target.scrollIntoView();
        }
    }
}

document.addEventListener('DOMContentLoaded', loadSections);
