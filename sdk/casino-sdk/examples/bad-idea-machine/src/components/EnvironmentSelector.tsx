import type { EnvironmentId } from '../scene/types';
import '../styles/environment-selector.css';

const OPTIONS: ReadonlyArray<{
  id: EnvironmentId;
  label: string;
  description: string;
}> = [
  {
    id: 'kitchen',
    label: 'KITCHEN MELTDOWN',
    description: 'appliances, grease fire, crockery and terrible food safety',
  },
  {
    id: 'garage',
    label: 'GARAGE MAYHEM',
    description: 'power tools, heavy metal, loose tires and industrial regret',
  },
];

type Props = {
  value: EnvironmentId;
  onChange: (environment: EnvironmentId) => void;
  disabled: boolean;
};

export function EnvironmentSelector({ value, onChange, disabled }: Props) {
  return (
    <fieldset className="environment-selector">
      <legend>CHAOS TYPE</legend>
      <div className="environment-selector__options">
        {OPTIONS.map(option => (
          <button
            key={option.id}
            type="button"
            className={`environment-choice environment-choice--${option.id} ${value === option.id ? 'environment-choice--selected' : ''}`}
            onClick={() => onChange(option.id)}
            disabled={disabled}
            aria-pressed={value === option.id}
            data-environment-choice={option.id}
          >
            <span className="environment-choice__icon" aria-hidden>{option.id === 'kitchen' ? '♨' : '⚙'}</span>
            <span>
              <strong>{option.label}</strong>
              <small>{option.description}</small>
            </span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
