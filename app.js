// ARK Server Configuration AI — Main Orchestrator
// State machine: WELCOME → MODE_SELECT → QUESTIONNAIRE → PROCESSING → OUTPUT → TUNING

import { buildProfile, buildDeepProfile } from './engine/profiler.js';
import { classify, classifyDeep } from './engine/classifier.js';
import { calculate, calculateFromDeepConfig } from './engine/calculator.js';
import { validate } from './engine/validator.js';
import { generate } from './engine/generator.js';
import { Questionnaire, MODE_B_CATEGORIES } from './ui/questionnaire.js';
import { renderOutput } from './ui/output.js';
import { renderTuner } from './ui/tuner.js';
import { PRESETS } from './db/presets.js';

// ─── STATE ────────────────────────────────────────────────────────────────────

let state = {
  screen: 'WELCOME',
  mode: null,           // 'A' or 'B'
  questionnaire: null,
  profile: null,
  weights: null,
  values: null,
  output: null,
};

// ─── DOM REFS ─────────────────────────────────────────────────────────────────

const app = document.getElementById('app');

// ─── RENDER ROUTER ────────────────────────────────────────────────────────────

function render() {
  switch (state.screen) {
    case 'WELCOME': renderWelcome(); break;
    case 'MODE_SELECT': renderModeSelect(); break;
    case 'QUESTIONNAIRE': renderQuestionnaire(); break;
    case 'PROCESSING': renderProcessing(); break;
    case 'OUTPUT': renderOutputScreen(); break;
  }
}

// ─── SCREENS ──────────────────────────────────────────────────────────────────

function renderWelcome() {
  app.innerHTML = `
    <div class="screen welcome-screen">
      <div class="welcome-bg-glow"></div>
      <div class="welcome-content">
        <div class="logo-area">
          <div class="logo-icon">🦖</div>
          <h1 class="logo-title">ARK Config AI</h1>
          <p class="logo-subtitle">Intelligent Server Configuration Engine</p>
        </div>
        <div class="welcome-features">
          <div class="feature-card">
            <span class="feature-icon">🎯</span>
            <span class="feature-text">Generates valid <code>Game.ini</code> &amp; <code>GameUserSettings.ini</code></span>
          </div>
          <div class="feature-card">
            <span class="feature-icon">🧠</span>
            <span class="feature-text">Adapts to your playstyle &amp; experience</span>
          </div>
          <div class="feature-card">
            <span class="feature-icon">🔧</span>
            <span class="feature-text">Iterative tuning after gameplay feedback</span>
          </div>
          <div class="feature-card">
            <span class="feature-icon">✅</span>
            <span class="feature-text">Only documented ARK settings — no invented keys</span>
          </div>
        </div>
        <button class="btn btn-primary btn-large" id="start-btn">
          <span>Configure My Server</span>
          <span class="btn-arrow">→</span>
        </button>
        <p class="welcome-note">Supports ARK: Survival Evolved &amp; ARK: Survival Ascended</p>
      </div>
    </div>
  `;
  document.getElementById('start-btn').addEventListener('click', () => {
    state.screen = 'MODE_SELECT';
    render();
  });
}

function renderModeSelect() {
  app.innerHTML = `
    <div class="screen mode-select-screen">
      <div class="screen-header">
        <button class="back-btn" id="back-btn">← Back</button>
        <h2 class="screen-title">Choose Configuration Mode</h2>
      </div>

      <div class="preset-quick-section">
        <div class="preset-quick-label">⚡ Quick Start — No Q&A needed</div>
        <div class="preset-quick-cards">
          <div class="preset-quick-card" id="preset-pve-beginner-card">
            <div class="preset-quick-badge">🌿 PvE Beginner + Instant Breeding</div>
            <ul class="preset-quick-tags">
              <li>🌾 2x Farming</li>
              <li>🦖 10x Taming</li>
              <li>🥚 Instant Breeding</li>
              <li>💪 0.5 Wild Dino Difficulty</li>
            </ul>
            <p class="preset-quick-desc">Perfekt für Einsteiger — einfache Zähmung, schnelles Breeding, entspanntes Farmen. Max. Level 150.</p>
            <button class="btn btn-preset" id="preset-pve-beginner-btn">Apply Now →</button>
          </div>
          <div class="preset-quick-card" id="preset-pve-standard-card">
            <div class="preset-quick-badge">⚔️ PvE Standard + Instant Breeding</div>
            <ul class="preset-quick-tags">
              <li>🌾 2x Farming</li>
              <li>🦖 10x Taming</li>
              <li>🥚 Instant Breeding</li>
              <li>🐉 Vanilla Wild Dinos</li>
            </ul>
            <p class="preset-quick-desc">Für erfahrenere Spieler — echte Herausforderung beim Zähmen und Kämpfen, schnelles Breeding. Max. Level 150.</p>
            <button class="btn btn-preset" id="preset-pve-standard-btn">Apply Now →</button>
          </div>
          <div class="preset-quick-card" id="preset-pve-standard-qb-card">
            <div class="preset-quick-badge">🦖 PvE Standard + Quick Breeding</div>
            <ul class="preset-quick-tags">
              <li>🌾 2x Farming</li>
              <li>🦖 10x Taming</li>
              <li>⏱️ ~38 min Ei / ~2h26m Auswachsen</li>
              <li>🐉 Vanilla Wild Dinos</li>
            </ul>
            <p class="preset-quick-desc">Wie PvE Standard, aber realistisches Breeding. 1 Imprint bei ~80 min = 100%. Giga-optimiert.</p>
            <button class="btn btn-preset" id="preset-pve-standard-qb-btn">Apply Now →</button>
          </div>
        </div>
      </div>

      <div class="mode-divider"><span>or configure manually</span></div>

      <div class="mode-cards mode-cards-single">
        <div class="mode-card mode-card-deep" id="mode-b-card">
          <div class="mode-badge mode-badge-deep">🔬 Deep</div>
          <div class="mode-icon">⚙️</div>
          <h3 class="mode-title">Deep Configuration</h3>
          <p class="mode-desc">Configure each category individually for full control over your server.</p>
          <ul class="mode-features">
            <li>✓ Category-by-category tuning</li>
            <li>✓ Slider controls</li>
            <li>✓ For experienced admins</li>
          </ul>
          <button class="btn btn-primary" id="mode-b-btn">Start Deep Config</button>
        </div>
      </div>
    </div>
  `;
  document.getElementById('back-btn').addEventListener('click', () => { state.screen = 'WELCOME'; render(); });
  document.getElementById('mode-b-btn').addEventListener('click', () => startQuestionnaire('B'));
  document.getElementById('preset-pve-beginner-btn').addEventListener('click', () => applyPresetDirect('pve_beginner'));
  document.getElementById('preset-pve-standard-btn').addEventListener('click', () => applyPresetDirect('pve_standard'));
  document.getElementById('preset-pve-standard-qb-btn').addEventListener('click', () => applyPresetDirect('pve_standard_qb'));
}

function startQuestionnaire(mode) {
  state.mode = mode;
  state.directPreset = null; // clear any direct preset
  state.questionnaire = new Questionnaire(mode, onQuestionnaireComplete);
  state.screen = 'QUESTIONNAIRE';
  render();
}

function applyPresetDirect(presetKey) {
  const preset = PRESETS[presetKey];
  if (!preset) { console.error('Unknown preset:', presetKey); return; }

  state.directPreset = presetKey;
  state.mode = 'PRESET';
  state.screen = 'PROCESSING';
  render();
}

function renderQuestionnaire() {
  const q = state.questionnaire;
  const question = q.currentQuestion;
  const { current, total } = q.progress;
  const progressPct = Math.round((current / total) * 100);

  app.innerHTML = `
    <div class="screen questionnaire-screen">
      <div class="q-header">
        <button class="back-btn" id="q-back-btn">← Back</button>
        <div class="progress-bar-wrap">
          <div class="progress-bar" style="width: ${progressPct}%"></div>
        </div>
        <span class="progress-label">${current} / ${total}</span>
      </div>

      ${question.categoryLabel ? `<div class="category-label">${question.categoryIcon || ''} ${question.categoryLabel}</div>` : ''}

      <div class="question-card" id="question-card">
        <div class="question-icon">${question.icon || '❓'}</div>
        <h2 class="question-text">${question.text}</h2>
        ${question.hint ? `<p class="question-hint">${question.hint}</p>` : ''}
        <div class="answer-area" id="answer-area">
          ${renderAnswerInput(question, q.answers[question.id])}
        </div>
      </div>

      <div class="q-footer">
        <button class="btn btn-primary" id="q-next-btn" ${!q.canProceed() ? 'disabled' : ''}>
          ${q.isLast ? 'Generate Config ⚙️' : 'Next →'}
        </button>
      </div>
    </div>
  `;

  // Back button
  document.getElementById('q-back-btn').addEventListener('click', () => {
    if (q.currentIndex === 0) { state.screen = 'MODE_SELECT'; render(); }
    else { q.prev(); render(); }
  });

  // Next button
  document.getElementById('q-next-btn').addEventListener('click', () => {
    if (q.canProceed()) q.next();
    if (state.screen === 'QUESTIONNAIRE') render();
  });

  // Answer input handlers
  attachAnswerHandlers(question, q);
}

function renderAnswerInput(question, currentValue) {
  if (question.type === 'choice') {
    return `<div class="choice-grid">
      ${question.options.map(opt => `
        <button class="choice-btn ${currentValue === opt.value ? 'selected' : ''}" data-value='${JSON.stringify(opt.value)}'>
          <span class="choice-label">${opt.label}</span>
          ${opt.desc ? `<span class="choice-desc">${opt.desc}</span>` : ''}
        </button>
      `).join('')}
    </div>`;
  }

  if (question.type === 'multiselect') {
    const selected = Array.isArray(currentValue) ? currentValue : [];
    return `<div class="multiselect-grid">
      ${question.options.map(opt => `
        <button class="multiselect-btn ${selected.includes(opt.value) ? 'selected' : ''}" data-value="${opt.value}">
          ${opt.label}
        </button>
      `).join('')}
    </div>`;
  }

  if (question.type === 'slider') {
    const val = currentValue ?? question.default;
    const hasLabels = question.labels && Object.keys(question.labels).length > 0;
    const getLabel = (v) => {
      if (!hasLabels) return `${v}x`;
      // Find closest label key
      const keys = Object.keys(question.labels).map(Number).sort((a, b) => a - b);
      let closest = keys[0];
      for (const k of keys) { if (k <= v) closest = k; }
      return question.labels[closest];
    };
    const displayText = hasLabels ? `<span class="slider-label-text">${getLabel(val)}</span><span class="slider-label-num">${val}</span>` : `${val}x`;
    const ticksHtml = hasLabels
      ? `<div class="slider-ticks">${Object.entries(question.labels).map(([k, l]) =>
        `<span class="slider-tick" style="left:${((k - question.min) / (question.max - question.min) * 100).toFixed(1)}%">${l}</span>`
      ).join('')}</div>`
      : `<div class="slider-labels"><span>${question.min}x</span><span>${question.maxLabel ?? (question.max + 'x')}</span></div>`;
    const sliderVal = Math.min(Math.max(val, question.min), question.max);
    const numInputHtml = question.numberInput
      ? `<input type="number" class="slider-number-input" id="q-slider-input" value="${val}" step="${question.step}" min="${question.min}">`
      : '';
    return `<div class="slider-wrap">
      <div class="slider-value-display" id="slider-display">${displayText}</div>
      <div class="slider-row">
        <input type="range" class="slider" id="q-slider"
          min="${question.min}" max="${question.max}" step="${question.step}" value="${sliderVal}">
        ${numInputHtml}
      </div>
      ${ticksHtml}
    </div>`;
  }

  return '';
}

function attachAnswerHandlers(question, q) {
  const nextBtn = document.getElementById('q-next-btn');

  if (question.type === 'choice') {
    document.querySelectorAll('.choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const raw = btn.getAttribute('data-value');
        const val = JSON.parse(raw);
        q.answer(val);
        document.querySelectorAll('.choice-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        nextBtn.disabled = false;
        // Auto-advance after short delay
        setTimeout(() => { if (q.canProceed()) { q.next(); if (state.screen === 'QUESTIONNAIRE') render(); } }, 300);
      });
    });
  }

  if (question.type === 'multiselect') {
    document.querySelectorAll('.multiselect-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.getAttribute('data-value');
        let current = Array.isArray(q.answers[question.id]) ? [...q.answers[question.id]] : [];
        if (current.includes(val)) {
          current = current.filter(v => v !== val);
          btn.classList.remove('selected');
        } else {
          current.push(val);
          btn.classList.add('selected');
        }
        q.answer(current);
        nextBtn.disabled = false;
      });
    });
  }

  if (question.type === 'slider') {
    const slider = document.getElementById('q-slider');
    const display = document.getElementById('slider-display');
    const numInput = document.getElementById('q-slider-input');
    const hasLabels = question.labels && Object.keys(question.labels).length > 0;
    const getLabel = (v) => {
      if (!hasLabels) return null;
      const keys = Object.keys(question.labels).map(Number).sort((a, b) => a - b);
      let closest = keys[0];
      for (const k of keys) { if (k <= v) closest = k; }
      return question.labels[closest];
    };
    const updateDisplay = (val) => {
      const label = getLabel(val);
      display.innerHTML = label
        ? `<span class="slider-label-text">${label}</span><span class="slider-label-num">${val}</span>`
        : `${val}x`;
    };
    if (slider) {
      slider.addEventListener('input', () => {
        const val = parseFloat(slider.value);
        updateDisplay(val);
        if (numInput) numInput.value = val;
        q.answer(val);
        nextBtn.disabled = false;
      });
      if (numInput) {
        numInput.addEventListener('input', () => {
          const val = parseFloat(numInput.value);
          if (isNaN(val)) return;
          updateDisplay(val);
          // Move slider to clamped position; store actual typed value as answer
          slider.value = Math.min(Math.max(val, question.min), question.max);
          q.answer(val);
          nextBtn.disabled = false;
        });
      }
      // Set initial answer
      if (q.answers[question.id] === undefined) {
        q.answer(parseFloat(slider.value));
      }
      nextBtn.disabled = false;
    }
  }
}

function renderProcessing() {
  app.innerHTML = `
    <div class="screen processing-screen">
      <div class="processing-content">
        <div class="processing-spinner"></div>
        <h2 class="processing-title">Generating Your Config</h2>
        <div class="processing-steps" id="processing-steps">
          <div class="proc-step active">🧠 Analyzing player profile...</div>
          <div class="proc-step">⚖️ Classifying gameplay goals...</div>
          <div class="proc-step">🔢 Calculating parameters...</div>
          <div class="proc-step">✅ Validating settings...</div>
          <div class="proc-step">📄 Generating INI files...</div>
        </div>
      </div>
    </div>
  `;

  // Animate steps then process
  const steps = document.querySelectorAll('.proc-step');
  let i = 0;
  const interval = setInterval(() => {
    if (i > 0) steps[i - 1].classList.remove('active');
    if (i < steps.length) {
      steps[i].classList.add('active');
      i++;
    } else {
      clearInterval(interval);
      setTimeout(processConfig, 300);
    }
  }, 400);
}

function processConfig() {
  try {
    let profile, weights, rawValues;

    if (state.mode === 'PRESET') {
      // Direct preset — no Q&A, use preset values straight from PRESETS
      const preset = PRESETS[state.directPreset];
      profile = buildProfile({ experience: 'beginner', mode: 'pve', weeklyHours: 10, groupSize: 1 });
      profile.preset = state.directPreset;
      weights = classify(profile);
      rawValues = { ...preset }; // use preset values directly as raw values
    } else {
      // Mode B: build deep profile and calculate directly from answers
      const answers = state.questionnaire.answers;
      profile = buildDeepProfile({
        experience: answers.experience || 'intermediate',
        mode: answers.mode || 'pve',
        weeklyHours: answers.weeklyHours || 10,
        groupSize: answers.groupSize || 1,
        adjustments: {},
      });
      // Pass all answers as deepConfig so calculateFromDeepConfig can use them
      profile.deepConfig = answers;
      weights = classifyDeep({ taming: 1.0, breeding: 1.0, harvesting: 1.0, xp: 1.0, loot: 1.0, difficulty: 1.0, qol: 1.0, pvp: 1.0, building: 1.0 });
      rawValues = calculateFromDeepConfig(profile);
    }

    // Validate
    const validation = validate(rawValues);
    if (validation.warnings.length > 0) {
      console.group('[ARK Config AI] Validation Warnings');
      validation.warnings.forEach(w => console.warn(w));
      console.groupEnd();
    }
    if (validation.errors.length > 0) {
      console.group('[ARK Config AI] Validation Errors (auto-fixed)');
      validation.errors.forEach(e => console.error(e));
      console.groupEnd();
    }

    // Generate output
    const output = generate(validation.fixedValues, profile);

    state.profile = profile;
    state.weights = weights;
    state.values = validation.fixedValues;
    state.output = output;
    state.screen = 'OUTPUT';
    render();
  } catch (err) {
    console.error('[ARK Config AI] Processing error:', err);
    app.innerHTML = `<div class="screen error-screen"><h2>⚠️ Error</h2><p>${err.message}</p><button class="btn btn-primary" onclick="location.reload()">Start Over</button></div>`;
  }
}

function renderOutputScreen() {
  app.innerHTML = `
    <div class="screen output-screen">
      <div class="output-screen-header">
        <button class="back-btn" id="out-back-btn">← Reconfigure</button>
        <h2 class="screen-title">Your Server Configuration</h2>
        <button class="btn btn-outline btn-sm" id="restart-btn">🔄 Start Over</button>
      </div>

      <div class="output-layout">
        <div class="output-main" id="output-main"></div>
        <div class="output-sidebar">
          <div id="tuner-container"></div>
        </div>
      </div>
    </div>
  `;

  const outputMain = document.getElementById('output-main');
  const tunerContainer = document.getElementById('tuner-container');

  // Render output
  renderOutput(outputMain, state.output, state.values);

  // Render tuner
  renderTuner(tunerContainer, state.values, state.profile, outputMain, (newValues) => {
    state.values = newValues;
  });

  document.getElementById('out-back-btn').addEventListener('click', () => {
    if (state.mode === 'PRESET') {
      // Direct preset — go back to mode select
      state.screen = 'MODE_SELECT';
    } else {
      state.screen = 'QUESTIONNAIRE';
      state.questionnaire.currentIndex = 0;
    }
    render();
  });
  document.getElementById('restart-btn').addEventListener('click', () => {
    state = { screen: 'WELCOME', mode: null, questionnaire: null, profile: null, weights: null, values: null, output: null };
    render();
  });
}

function onQuestionnaireComplete(answers) {
  state.screen = 'PROCESSING';
  render();
}

// ─── INIT ─────────────────────────────────────────────────────────────────────

render();
