import type { ReactNode } from 'react';

type Props = { kind: string };

function Svg({ children, viewBox = '0 0 120 120' }: { children: ReactNode; viewBox?: string }) {
  return (
    <svg className="actor-art" viewBox={viewBox} aria-hidden="true">
      <defs>
        <linearGradient id="actorMetalGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f0f2ed" />
          <stop offset=".18" stopColor="#9ea6a1" />
          <stop offset=".48" stopColor="#d9ddd8" />
          <stop offset=".72" stopColor="#666d69" />
          <stop offset="1" stopColor="#bcc2bd" />
        </linearGradient>
        <linearGradient id="actorDarkMetalGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7c8480" />
          <stop offset=".35" stopColor="#343a37" />
          <stop offset=".72" stopColor="#171b19" />
          <stop offset="1" stopColor="#59605c" />
        </linearGradient>
        <linearGradient id="actorRedGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff7055" />
          <stop offset=".28" stopColor="#d9412f" />
          <stop offset=".72" stopColor="#7d1711" />
          <stop offset="1" stopColor="#bd2b20" />
        </linearGradient>
        <linearGradient id="actorWoodGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c58a52" />
          <stop offset=".5" stopColor="#8f5731" />
          <stop offset="1" stopColor="#4d2c19" />
        </linearGradient>
        <radialGradient id="actorTireGrad" cx="36%" cy="27%" r="76%">
          <stop offset="0" stopColor="#4c514e" />
          <stop offset=".42" stopColor="#202422" />
          <stop offset="1" stopColor="#070908" />
        </radialGradient>
        <linearGradient id="actorYellowGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffd64f" />
          <stop offset=".48" stopColor="#dba72b" />
          <stop offset="1" stopColor="#735212" />
        </linearGradient>
        <filter id="actorObjectShadow" x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000" floodOpacity=".55" />
          <feDropShadow dx="-1" dy="-1" stdDeviation="1.4" floodColor="#fff3d4" floodOpacity=".18" />
        </filter>
      </defs>
      <g filter="url(#actorObjectShadow)">{children}</g>
    </svg>
  );
}

export function ActorArtwork({ kind }: Props) {
  switch (kind) {
    case 'toaster':
      return <Svg><rect x="18" y="42" width="84" height="52" rx="10" className="actor-metal"/><rect x="28" y="35" width="64" height="12" rx="6" className="actor-dark"/><path d="M35 37h50" className="actor-line"/><circle cx="88" cy="65" r="6" className="actor-red"/><path d="M28 94v10M92 94v10" className="actor-stroke"/></Svg>;
    case 'toast':
      return <Svg><path d="M32 32c0-13 12-22 28-22s28 9 28 22v8c10 4 16 13 16 24v38H16V64c0-11 6-20 16-24z" className="actor-toast"/><path d="M30 78c18 9 42 9 60 0" className="actor-toast-crust"/></Svg>;
    case 'cat':
      return <Svg><path d="M30 38 18 18l28 12h28l28-12-12 22c10 8 16 22 14 38-2 19-18 32-43 32S20 96 19 78c-1-17 4-31 11-40Z" className="actor-cat"/><circle cx="47" cy="60" r="4" className="actor-eye"/><circle cx="73" cy="60" r="4" className="actor-eye"/><path d="m58 69 4 0M60 70c-6 8-11 7-15 5M60 70c6 8 11 7 15 5M22 68H4M98 68h18" className="actor-stroke"/></Svg>;
    case 'pan':
      return <Svg><ellipse cx="50" cy="66" rx="36" ry="27" className="actor-dark-metal"/><ellipse cx="50" cy="60" rx="27" ry="18" className="actor-metal"/><path d="m78 48 34-28 8 10-34 34" className="actor-dark-metal actor-stroke-wide"/></Svg>;
    case 'kettle':
      return <Svg><path d="M32 48c0-17 11-27 28-27s28 10 28 27v49H32z" className="actor-metal"/><path d="M44 22c1-14 31-14 32 0M86 46l25-10-18 27M29 55C4 51 6 86 29 85" className="actor-stroke-wide"/><circle cx="60" cy="58" r="5" className="actor-red"/></Svg>;
    case 'cabinet-door':
      return <Svg><rect x="18" y="18" width="84" height="84" rx="5" className="actor-wood"/><rect x="28" y="28" width="64" height="64" rx="3" className="actor-wood-panel"/><circle cx="86" cy="60" r="5" className="actor-metal"/></Svg>;
    case 'plates':
      return <Svg><ellipse cx="60" cy="82" rx="45" ry="10" className="actor-ceramic"/><ellipse cx="60" cy="69" rx="40" ry="9" className="actor-ceramic"/><ellipse cx="60" cy="56" rx="35" ry="8" className="actor-ceramic"/><path d="M30 56c9 8 51 8 60 0" className="actor-line"/></Svg>;
    case 'fan':
      return <Svg><circle cx="60" cy="52" r="45" className="actor-cage"/><circle cx="60" cy="52" r="9" className="actor-metal"/><path d="M60 50C29 6 18 39 51 51M61 54c27 46 45 15 11 2M58 53c-54 1-36 32-3 11" className="actor-blade"/><path d="M60 97v16M37 114h46" className="actor-stroke-wide"/></Svg>;
    case 'ball':
      return <Svg><circle cx="60" cy="60" r="46" className="actor-ball"/><circle cx="47" cy="43" r="6" className="actor-hole"/><circle cx="64" cy="38" r="6" className="actor-hole"/><circle cx="75" cy="52" r="6" className="actor-hole"/></Svg>;
    case 'rocket':
      return <Svg><path d="M60 5c22 20 28 44 25 72L60 98 35 77C32 49 38 25 60 5Z" className="actor-rocket"/><circle cx="60" cy="48" r="11" className="actor-window"/><path d="m35 67-18 18 20 2M85 67l18 18-20 2" className="actor-red actor-stroke-wide"/><path d="m48 94 12 23 12-23" className="actor-flame"/></Svg>;
    case 'safe':
      return <Svg><rect x="12" y="18" width="96" height="88" rx="8" className="actor-safe"/><rect x="23" y="29" width="74" height="66" rx="5" className="actor-safe-door"/><circle cx="60" cy="61" r="18" className="actor-metal"/><path d="M60 44v34M43 61h34M48 49l24 24M72 49 48 73" className="actor-stroke"/><circle cx="88" cy="83" r="5" className="actor-red"/></Svg>;
    case 'core':
      return <Svg><circle cx="60" cy="60" r="49" className="actor-core-shell"/><circle cx="60" cy="60" r="31" className="actor-core-ring"/><circle cx="60" cy="60" r="15" className="actor-core"/><path d="M60 2v17M60 101v17M2 60h17M101 60h17M19 19l12 12M89 89l12 12M101 19 89 31M31 89 19 101" className="actor-stroke-wide"/></Svg>;
    case 'hammer':
      return <Svg><path d="M23 21h61l14 18-13 17H54V43H23z" className="actor-dark-metal"/><path d="M58 52 78 109H60L43 55" className="actor-wood"/></Svg>;
    case 'wrench':
      return <Svg><path d="M84 9c-12 1-22 9-26 20l12 12-13 13-12-12C34 46 26 56 25 68c-1 8 1 15 5 21l-17 17 11 11 17-17c7 4 14 6 22 5 12-1 22-9 26-20L76 72l13-13 13 13c11-5 18-15 19-27 1-8-1-15-5-21L93 47 78 32l23-23c-5-1-11-1-17 0Z" className="actor-metal" transform="scale(.82) translate(12 8)"/></Svg>;
    case 'drill':
      return <Svg><path d="M14 28h66l18 14v28H60v17H39V68H14z" className="actor-drill"/><path d="M98 49h17v12H98M47 69v39H28V83" className="actor-dark-metal actor-stroke-wide"/><circle cx="75" cy="49" r="7" className="actor-red"/></Svg>;
    case 'saw':
      return <Svg><circle cx="67" cy="65" r="38" className="actor-saw-blade"/><path d="M67 18v10M67 102v10M20 65h10M104 65h10M34 32l8 8M93 91l8 8M100 31l-8 9M41 92l-8 9" className="actor-stroke"/><path d="M14 31h58l9 18H34v20H14z" className="actor-saw-body"/></Svg>;
    case 'chain':
      return <Svg><g className="actor-chain">{[18,38,58,78,98].map((y, i)=><ellipse key={y} cx="60" cy={y} rx="17" ry="10" transform={`rotate(${i%2?90:0} 60 ${y})`} />)}</g></Svg>;
    case 'tire':
      return <Svg><circle cx="60" cy="60" r="50" className="actor-tire"/><circle cx="60" cy="60" r="26" className="actor-tire-hole"/><path d="M27 27 42 42M78 78l15 15M93 27 78 42M42 78 27 93" className="actor-tire-tread"/></Svg>;
    case 'tank':
      return <Svg><rect x="32" y="23" width="56" height="88" rx="26" className="actor-tank"/><rect x="45" y="9" width="30" height="18" rx="4" className="actor-dark-metal"/><path d="M75 16h24M93 10v15" className="actor-stroke-wide"/><path d="M45 67h30" className="actor-warning"/></Svg>;
    case 'toolbox':
      return <Svg><path d="M15 42h90v61H15z" className="actor-toolbox"/><path d="M38 42V26h44v16M15 59h90" className="actor-stroke-wide"/><rect x="54" y="54" width="12" height="12" rx="2" className="actor-metal"/></Svg>;
    case 'shelf':
      return <Svg><path d="M18 16h8v92h-8M94 16h8v92h-8M20 34h80M20 67h80M20 100h80" className="actor-stroke-wide"/><rect x="29" y="20" width="25" height="13" className="actor-crate"/><rect x="62" y="46" width="29" height="20" className="actor-crate"/><circle cx="45" cy="84" r="15" className="actor-tire"/></Svg>;
    default:
      return <Svg><circle cx="60" cy="60" r="38" className="actor-metal"/><path d="M38 60h44M60 38v44" className="actor-stroke-wide"/></Svg>;
  }
}
