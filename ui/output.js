// ARK Server Configuration AI — Output UI
// Renders the generated INI config with syntax highlighting and copy buttons

import { generateTuningExplanation } from '../engine/generator.js';

/**
 * Render the full output panel into a container element.
 * @param {HTMLElement} container
 * @param {{ gameIni: string, gameUserSettingsIni: string, summary: string, impact: string[] }} output
 * @param {Object} values - Current setting values (for tuning reference)
 */
export function renderOutput(container, output, values) {
    container.innerHTML = `
    <div class="output-panel">
      <div class="output-summary">
        <div class="summary-icon">⚙️</div>
        <div class="summary-text">${escapeHtml(output.summary)}</div>
      </div>

      <div class="impact-section">
        <h3 class="section-title">🎯 Gameplay Impact</h3>
        <ul class="impact-list">
          ${output.impact.map(i => `<li>${renderMarkdown(i)}</li>`).join('')}
        </ul>
      </div>

      <div class="ini-section">
        <div class="ini-header">
          <h3 class="section-title">📄 GameUserSettings.ini</h3>
          <button class="copy-btn" data-target="gus-block" title="Copy to clipboard">
            <span class="copy-icon">📋</span> Copy
          </button>
        </div>
        <pre class="ini-block" id="gus-block">${highlightIni(output.gameUserSettingsIni)}</pre>
      </div>

      <div class="ini-section">
        <div class="ini-header">
          <h3 class="section-title">📄 Game.ini</h3>
          <button class="copy-btn" data-target="game-block" title="Copy to clipboard">
            <span class="copy-icon">📋</span> Copy
          </button>
        </div>
        <pre class="ini-block" id="game-block">${highlightIni(output.gameIni)}</pre>
      </div>
    </div>
  `;

    // Attach copy button handlers
    container.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const pre = document.getElementById(targetId);
            const text = pre.innerText;
            navigator.clipboard.writeText(text).then(() => {
                btn.innerHTML = '<span class="copy-icon">✅</span> Copied!';
                btn.classList.add('copied');
                setTimeout(() => {
                    btn.innerHTML = '<span class="copy-icon">📋</span> Copy';
                    btn.classList.remove('copied');
                }, 2000);
            }).catch(() => {
                // Fallback for non-HTTPS
                const ta = document.createElement('textarea');
                ta.value = text;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                btn.innerHTML = '<span class="copy-icon">✅</span> Copied!';
                setTimeout(() => { btn.innerHTML = '<span class="copy-icon">📋</span> Copy'; }, 2000);
            });
        });
    });
}

/**
 * Render tuning change explanation.
 * @param {HTMLElement} container
 * @param {string[]} changedIds
 * @param {Object} oldValues
 * @param {Object} newValues
 * @param {string} feedbackLabel
 */
export function renderTuningResult(container, changedIds, oldValues, newValues, feedbackLabel) {
    const explanations = generateTuningExplanation(changedIds, oldValues, newValues);

    const div = document.createElement('div');
    div.className = 'tuning-result';
    div.innerHTML = `
    <div class="tuning-header">
      <span class="tuning-icon">🔧</span>
      <span>Adjusted for: <strong>${escapeHtml(feedbackLabel)}</strong></span>
    </div>
    <div class="tuning-changes">
      ${explanations.map(e => `<div class="tuning-change">${renderMarkdown(e)}</div>`).join('')}
    </div>
    <div class="tuning-note">Config blocks above have been updated. Re-copy the INI files.</div>
  `;

    // Insert before the ini sections
    const iniSection = container.querySelector('.ini-section');
    if (iniSection) {
        container.querySelector('.output-panel').insertBefore(div, iniSection);
    } else {
        container.querySelector('.output-panel')?.appendChild(div);
    }
}

/**
 * Syntax highlight an INI block.
 */
function highlightIni(text) {
    return escapeHtml(text)
        .replace(/^(\[.+\])$/gm, '<span class="ini-section-header">$1</span>')
        .replace(/^([A-Za-z_]+)(=)/gm, '<span class="ini-key">$1</span><span class="ini-eq">$2</span>')
        .replace(/(True|False)/g, '<span class="ini-bool">$1</span>')
        .replace(/^(;.*)$/gm, '<span class="ini-comment">$1</span>');
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function renderMarkdown(str) {
    // Bold **text**
    return str.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}
