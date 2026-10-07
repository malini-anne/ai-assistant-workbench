/**
 * SettingsPanel — model name + temperature + system prompt.
 *
 * None of these call a real model. They still matter in a portfolio UI:
 * interviewers expect settings affordances on AI products, and temperature
 * here slightly changes stream jitter so the control is "alive".
 */

import type { AssistantSettings } from '../lib/types';

interface Props {
  settings: AssistantSettings;
  onChange: (next: AssistantSettings) => void;
  disabled?: boolean;
}

const MODELS = ['mock-gpt-demo', 'mock-claude-demo', 'mock-local-llama'];

export function SettingsPanel({ settings, onChange, disabled }: Props) {
  return (
    <section className="panel settings" aria-label="Settings">
      <header className="panel-header">
        <h2>Settings</h2>
        <p className="muted">Display-only model controls (no paid API)</p>
      </header>

      <label className="field">
        <span>Model</span>
        <select
          value={settings.modelName}
          disabled={disabled}
          onChange={(e) => onChange({ ...settings, modelName: e.target.value })}
        >
          {MODELS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>
          Temperature <em>{settings.temperature.toFixed(1)}</em>
        </span>
        <input
          type="range"
          min={0}
          max={1.5}
          step={0.1}
          disabled={disabled}
          value={settings.temperature}
          onChange={(e) =>
            onChange({ ...settings, temperature: Number(e.target.value) })
          }
        />
      </label>

      <label className="field">
        <span>System prompt</span>
        <textarea
          rows={5}
          disabled={disabled}
          value={settings.systemPrompt}
          onChange={(e) => onChange({ ...settings, systemPrompt: e.target.value })}
        />
      </label>
    </section>
  );
}
