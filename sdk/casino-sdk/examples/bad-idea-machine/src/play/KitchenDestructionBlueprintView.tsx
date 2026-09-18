import { useState, type CSSProperties } from 'react';

import type { OutcomeTier } from '../lib/badIdea';
import {
  KITCHEN_DESTRUCTION_BLUEPRINT,
  kitchenDamageCount,
  validateKitchenDestructionBlueprint,
  type KitchenDestructibleZoneId,
  type KitchenVariant,
} from '../scene/kitchen-destruction-blueprint';
import { KITCHEN_NATIVE_MASTER } from '../scene/kitchen-native-proof';

const tiers = [0, 1, 2, 3, 4] as const satisfies readonly OutcomeTier[];

const page: CSSProperties = {
  minHeight: '100vh',
  padding: 18,
  background: '#071014',
  color: '#eef1ed',
  fontFamily: 'Rubik, sans-serif',
};

const button: CSSProperties = {
  border: '1px solid #496069',
  background: '#102026',
  color: '#eef1ed',
  padding: '8px 10px',
  cursor: 'pointer',
};

export function KitchenDestructionBlueprintView() {
  const [tier, setTier] = useState<OutcomeTier>(2);
  const [variantId, setVariantId] = useState<KitchenVariant['id']>('cabinet-pan');
  const composition = KITCHEN_DESTRUCTION_BLUEPRINT.tiers[tier];
  const variant = KITCHEN_DESTRUCTION_BLUEPRINT.variants.find(item => item.id === variantId)
    ?? KITCHEN_DESTRUCTION_BLUEPRINT.variants[0];
  const errors = validateKitchenDestructionBlueprint();

  return (
    <main style={page}>
      <div style={{ maxWidth: 1380, margin: '0 auto' }}>
        <small style={{ color: '#f5ca55', letterSpacing: '.12em' }}>FULL KITCHEN DESTRUCTION BLUEPRINT</small>
        <h1 style={{ margin: '7px 0 4px' }}>One room · five persistent end states</h1>
        <p style={{ color: '#aeb9ba', maxWidth: 880, lineHeight: 1.45 }}>
          Asset-production map only. Motion remains blocked until the layered intact reconstruction and all five static
          aftermath compositions can be produced from these same zones and props.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '14px 0 8px' }}>
          {tiers.map(candidate => (
            <button
              key={candidate}
              type="button"
              style={{
                ...button,
                borderColor: candidate === tier ? '#f5ca55' : '#496069',
                color: candidate === tier ? '#f5ca55' : '#eef1ed',
              }}
              onClick={() => setTier(candidate)}
            >
              Tier {candidate} · {kitchenDamageCount(candidate)} zones
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {KITCHEN_DESTRUCTION_BLUEPRINT.variants.map(candidate => (
            <button
              key={candidate.id}
              type="button"
              style={{
                ...button,
                borderColor: candidate.id === variant.id ? '#78d59c' : '#496069',
                color: candidate.id === variant.id ? '#78d59c' : '#eef1ed',
              }}
              onClick={() => setVariantId(candidate.id)}
            >
              {candidate.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 360px)', gap: 14 }}>
          <div style={{ position: 'relative', aspectRatio: '5 / 3', overflow: 'hidden', border: '1px solid #3a5057' }}>
            <img
              src={KITCHEN_NATIVE_MASTER}
              alt="Approved Kitchen master with destruction zones"
              draggable={false}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            />

            {KITCHEN_DESTRUCTION_BLUEPRINT.zones.map(zone => {
              const state = zone.kind === 'destructible'
                ? composition.zoneStates[zone.id as KitchenDestructibleZoneId]
                : 'permanent';

              return (
                <div
                  key={zone.id}
                  title={`${zone.label}: ${state}`}
                  style={{
                    position: 'absolute',
                    left: `${zone.bounds.x / 10}%`,
                    top: `${zone.bounds.y / 6}%`,
                    width: `${zone.bounds.width / 10}%`,
                    height: `${zone.bounds.height / 6}%`,
                    border: `1px solid ${zone.kind === 'destructible' ? '#f5ca55' : '#75c6de'}`,
                    background: zone.kind === 'destructible' ? 'rgba(245,202,85,.07)' : 'rgba(117,198,222,.05)',
                    boxSizing: 'border-box',
                    pointerEvents: 'none',
                  }}
                >
                  <span style={{ background: 'rgba(5,10,12,.78)', padding: '2px 4px', fontSize: 9 }}>
                    {zone.label} · {state}
                  </span>
                </div>
              );
            })}

            {KITCHEN_DESTRUCTION_BLUEPRINT.props.map(prop => (
              <div
                key={prop.id}
                title={`${prop.label}: ${composition.propStates[prop.id]}`}
                style={{
                  position: 'absolute',
                  left: `${prop.rest.x / 10}%`,
                  top: `${prop.rest.y / 6}%`,
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  background: '#f27767',
                  boxShadow: '0 0 0 2px rgba(0,0,0,.7)',
                  transform: 'translate(-50%,-50%)',
                }}
              />
            ))}
          </div>

          <aside style={{ border: '1px solid #33484f', background: '#0b171b', padding: 12 }}>
            <strong style={{ color: errors.length ? '#f27767' : '#78d59c' }}>
              {errors.length ? `${errors.length} blueprint errors` : 'Blueprint valid'}
            </strong>
            <h2 style={{ marginBottom: 5 }}>Tier {tier}</h2>
            <p style={{ color: '#adb8b9', lineHeight: 1.4 }}>{composition.artDirection}</p>
            <h2 style={{ marginBottom: 5 }}>{variant.label}</h2>
            <p style={{ color: '#adb8b9', lineHeight: 1.4 }}>{variant.premise}</p>
            <ol style={{ paddingLeft: 22 }}>
              {variant.beats.map((beat, index) => (
                <li key={beat.id} style={{ marginBottom: 7, color: index < variant.sharedUntilBeat ? '#dce3e1' : '#f5ca55' }}>
                  <strong>{beat.action}</strong>
                  <small style={{ display: 'block', color: '#8f9c9e' }}>
                    {beat.actor} → {beat.target} @ {beat.contact.x},{beat.contact.y}
                  </small>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </div>
    </main>
  );
}
