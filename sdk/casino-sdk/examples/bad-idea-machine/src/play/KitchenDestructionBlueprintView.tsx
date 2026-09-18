import { useMemo, useState } from 'react';

import type { OutcomeTier } from '../lib/badIdea';
import {
  KITCHEN_DESTRUCTION_BLUEPRINT,
  kitchenDamageCount,
  validateKitchenDestructionBlueprint,
  type KitchenVariant,
} from '../scene/kitchen-destruction-blueprint';
import { KITCHEN_NATIVE_MASTER } from '../scene/kitchen-native-proof';
import '../styles/kitchen-destruction-blueprint.css';

const tiers = [0, 1, 2, 3, 4] as const satisfies readonly OutcomeTier[];

function tierLabel(tier: OutcomeTier) {
  switch (tier) {
    case 0: return '0 · catastrophic loss';
    case 1: return '1 · localized';
    case 2: return '2 · moderate';
    case 3: return '3 · severe';
    case 4: return '4 · absurd';
  }
}

export function KitchenDestructionBlueprintView() {
  const [tier, setTier] = useState<OutcomeTier>(2);
  const [variantId, setVariantId] = useState<KitchenVariant['id']>('cabinet-pan');

  const variant = KITCHEN_DESTRUCTION_BLUEPRINT.variants.find(item => item.id === variantId)
    ?? KITCHEN_DESTRUCTION_BLUEPRINT.variants[0];
  const composition = KITCHEN_DESTRUCTION_BLUEPRINT.tiers[tier];
  const errors = useMemo(() => validateKitchenDestructionBlueprint(), []);

  return (
    <main className="kitchen-blueprint">
      <header className="kitchen-blueprint__header">
        <div>
          <small>FULL KITCHEN DESTRUCTION BLUEPRINT</small>
          <h1>One Room · Layered Architecture · Five Persistent End States</h1>
          <p>
            This is the asset-production contract. No new motion is allowed until the intact layered reconstruction
            and all five static aftermath compositions can be rendered from these same zones and props.
          </p>
        </div>
        <div className="kitchen-blueprint__status">
          <strong>{errors.length === 0 ? 'BLUEPRINT VALID' : `${errors.length} BLUEPRINT ERRORS`}</strong>
          <span>{KITCHEN_DESTRUCTION_BLUEPRINT.zones.filter(zone => zone.kind === 'destructible').length} destructible zones</span>
          <span>{KITCHEN_DESTRUCTION_BLUEPRINT.props.length} supported props</span>
          <span>{KITCHEN_DESTRUCTION_BLUEPRINT.variants.length} causal variants</span>
        </div>
      </header>

      <section className="kitchen-blueprint__toolbar" aria-label="Blueprint controls">
        <div>
          <span>Final composition</span>
          <div className="kitchen-blueprint__tier-buttons">
            {tiers.map(candidate => (
              <button
                type="button"
                key={candidate}
                className={candidate === tier ? 'is-active' : ''}
                onClick={() => setTier(candidate)}
              >
                {tierLabel(candidate)}
                <small>{kitchenDamageCount(candidate)} damaged zones</small>
              </button>
            ))}
          </div>
        </div>

        <div>
          <span>Causal variant</span>
          <div className="kitchen-blueprint__variant-buttons">
            {KITCHEN_DESTRUCTION_BLUEPRINT.variants.map(candidate => (
              <button
                type="button"
                key={candidate.id}
                className={candidate.id === variant.id ? 'is-active' : ''}
                onClick={() => setVariantId(candidate.id)}
              >
                {candidate.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="kitchen-blueprint__layout">
        <div className="kitchen-blueprint__stage-shell">
          <div className="kitchen-blueprint__stage">
            <img src={KITCHEN_NATIVE_MASTER} alt="Approved Kitchen master" draggable={false} />

            {KITCHEN_DESTRUCTION_BLUEPRINT.zones.map(zone => {
              const state = zone.kind === 'destructible'
                ? composition.zoneStates[zone.id]
                : 'permanent shell';

              return (
                <div
                  key={zone.id}
                  className={`kitchen-blueprint__zone kitchen-blueprint__zone--${zone.kind}`}
                  style={{
                    left: `${zone.bounds.x / 10}%`,
                    top: `${zone.bounds.y / 6}%`,
                    width: `${zone.bounds.width / 10}%`,
                    height: `${zone.bounds.height / 6}%`,
                  }}
                  title={zone.notes}
                >
                  <strong>{zone.label}</strong>
                  <small>{state}</small>
                </div>
              );
            })}

            {KITCHEN_DESTRUCTION_BLUEPRINT.props.map(prop => (
              <div
                key={prop.id}
                className="kitchen-blueprint__prop-anchor"
                style={{
                  left: `${prop.rest.x / 10}%`,
                  top: `${prop.rest.y / 6}%`,
                }}
              >
                <i />
                <span>{prop.label}</span>
                <small>{composition.propStates[prop.id]}</small>
              </div>
            ))}
          </div>
        </div>

        <aside className="kitchen-blueprint__panel">
          <section>
            <small>ART DIRECTION · TIER {tier}</small>
            <h2>{tierLabel(tier)}</h2>
            <p>{composition.artDirection}</p>
          </section>

          <section>
            <small>SELECTED VARIANT</small>
            <h2>{variant.label}</h2>
            <p>{variant.premise}</p>
            <ol className="kitchen-blueprint__beats">
              {variant.beats.map((beat, index) => (
                <li key={beat.id} className={index < variant.sharedUntilBeat ? 'is-shared' : 'is-terminal'}>
                  <span>{index + 1}</span>
                  <div>
                    <strong>{beat.action}</strong>
                    <small>
                      {beat.actor} → {beat.target} · contact {beat.contact.x},{beat.contact.y}
                    </small>
                    {beat.damage?.length ? (
                      <em>
                        {beat.damage.map(item => `${item.zoneId}: ${item.state}`).join(' · ')}
                      </em>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </section>

      <section className="kitchen-blueprint__matrix">
        <div className="kitchen-blueprint__matrix-heading">
          <div>
            <small>STATIC AFTERMATH CONTRACT</small>
            <h2>All five tiers must be authored before motion resumes</h2>
          </div>
          <p>
            The final renderer may combine localized state layers, occlusion masks, shadows and debris.
            It may not replace the complete room with a tier-specific full-frame image.
          </p>
        </div>

        <div className="kitchen-blueprint__matrix-table" role="table" aria-label="Kitchen destruction state matrix">
          <div className="kitchen-blueprint__matrix-row kitchen-blueprint__matrix-row--head" role="row">
            <span role="columnheader">Component</span>
            {tiers.map(item => <strong role="columnheader" key={item}>Tier {item}</strong>)}
          </div>

          {KITCHEN_DESTRUCTION_BLUEPRINT.zones
            .filter(zone => zone.kind === 'destructible')
            .map(zone => (
              <div className="kitchen-blueprint__matrix-row" role="row" key={zone.id}>
                <span role="cell">{zone.label}</span>
                {tiers.map(item => (
                  <strong role="cell" key={item}>{KITCHEN_DESTRUCTION_BLUEPRINT.tiers[item].zoneStates[zone.id]}</strong>
                ))}
              </div>
            ))}

          {KITCHEN_DESTRUCTION_BLUEPRINT.props.map(prop => (
            <div className="kitchen-blueprint__matrix-row kitchen-blueprint__matrix-row--prop" role="row" key={prop.id}>
              <span role="cell">{prop.label}</span>
              {tiers.map(item => (
                <strong role="cell" key={item}>{KITCHEN_DESTRUCTION_BLUEPRINT.tiers[item].propStates[prop.id]}</strong>
              ))}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
