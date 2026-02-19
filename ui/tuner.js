// ARK Server Configuration AI — Tuner UI
// Iterative tuning panel for post-gameplay feedback

import { feedbackToAdjustments } from '../engine/profiler.js';
import { applyTuning } from '../engine/calculator.js';
import { validate } from '../engine/validator.js';
import { generate } from '../engine/generator.js';
import { renderOutput, renderTuningResult } from './output.js';

const FEEDBACK_OPTIONS = [
    { value: "too easy", label: "Too Easy", icon: "😴", desc: "Game feels too simple" },
    { value: "too hard", label: "Too Hard", icon: "💀", desc: "Dying too much, too frustrating" },
    { value: "bosses too fast", label: "Bosses Die Too Fast", icon: "🐉", desc: "Boss fights are trivial" },
    { value: "bosses too slow", label: "Bosses Too Tanky", icon: "🛡️", desc: "Bosses take forever to kill" },
    { value: "breeding too slow", label: "Breeding Too Slow", icon: "🥚", desc: "Babies take too long" },
    { value: "breeding too fast", label: "Breeding Too Fast", icon: "⚡", desc: "Breeding feels trivial" },
    { value: "taming too slow", label: "Taming Too Slow", icon: "🦕", desc: "Taming takes too long" },
    { value: "taming too fast", label: "Taming Too Fast", icon: "🏃", desc: "Taming feels instant" },
    { value: "not enough resources", label: "Not Enough Resources", icon: "⛏️", desc: "Always running out of materials" },
    { value: "too many resources", label: "Too Many Resources", icon: "📦", desc: "Resources feel worthless" },
    { value: "leveling too slow", label: "Leveling Too Slow", icon: "⭐", desc: "XP progression is too slow" },
    { value: "leveling too fast", label: "Leveling Too Fast", icon: "🚀", desc: "Maxed out too quickly" },
    { value: "loot too bad", label: "Loot Quality Too Low", icon: "🎁", desc: "Drops are always junk" },
    { value: "too much grind", label: "Too Much Grind", icon: "😤", desc: "Everything takes too long" },
    { value: "need more challenge", label: "Need More Challenge", icon: "⚔️", desc: "Want a harder experience" },
];

/**
 * Render the tuning panel.
 * @param {HTMLElement} container - Where to render the tuner
 * @param {Object} currentValues - Current setting values
 * @param {Object} profile - Current player profile
 * @param {HTMLElement} outputContainer - Where the output is rendered (to update it)
 * @param {Function} onValuesUpdated - Callback with new values
 */
export function renderTuner(container, currentValues, profile, outputContainer, onValuesUpdated) {
    container.innerHTML = `
    <div class="tuner-panel">
      <h3 class="tuner-title">🔧 Fine-Tune Your Server</h3>
      <p class="tuner-subtitle">After playing, select what feels off and we'll adjust up to 3 settings.</p>
      <div class="feedback-grid">
        ${FEEDBACK_OPTIONS.map(opt => `
          <button class="feedback-btn" data-value="${opt.value}" title="${opt.desc}">
            <span class="feedback-icon">${opt.icon}</span>
            <span class="feedback-label">${opt.label}</span>
            <span class="feedback-desc">${opt.desc}</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;

    container.querySelectorAll('.feedback-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const feedback = btn.getAttribute('data-value');
            applyFeedback(feedback, btn.querySelector('.feedback-label').textContent, currentValues, profile, outputContainer, onValuesUpdated, container);
        });
    });
}

function applyFeedback(feedback, feedbackLabel, currentValues, profile, outputContainer, onValuesUpdated, tunerContainer) {
    const adjustments = feedbackToAdjustments(feedback);
    if (Object.keys(adjustments).length === 0) return;

    const { newValues, changedSettings } = applyTuning(currentValues, adjustments, profile);
    const validation = validate(newValues);
    const fixed = validation.fixedValues;

    // Log validation to console
    if (validation.warnings.length > 0) {
        console.group('[ARK Config AI] Tuning Validation Warnings');
        validation.warnings.forEach(w => console.warn(w));
        console.groupEnd();
    }

    const output = generate(fixed, profile);

    // Re-render output
    renderOutput(outputContainer, output, fixed);

    // Show tuning explanation
    renderTuningResult(outputContainer, changedSettings, currentValues, fixed, feedbackLabel);

    // Notify callback
    onValuesUpdated(fixed);

    // Highlight the clicked button
    tunerContainer.querySelectorAll('.feedback-btn').forEach(b => b.classList.remove('active'));
    tunerContainer.querySelector(`[data-value="${feedback}"]`)?.classList.add('active');

    // Scroll to output
    outputContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
