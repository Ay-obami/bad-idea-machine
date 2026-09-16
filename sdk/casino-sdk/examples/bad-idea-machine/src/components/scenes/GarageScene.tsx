export function GarageScene() {
  return (
    <div className="environment-scene environment-scene--garage" data-environment="garage" aria-hidden="true">
      <svg className="environment-art" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="garage-wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#31383a" />
            <stop offset="1" stopColor="#161a1c" />
          </linearGradient>
          <linearGradient id="garage-floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2d3132" />
            <stop offset="1" stopColor="#141617" />
          </linearGradient>
        </defs>
        <rect width="1000" height="600" fill="url(#garage-wall)" />
        <rect x="0" y="420" width="1000" height="180" fill="url(#garage-floor)" />
        <path d="M0 475h1000M0 535h1000M130 420v180M330 420v180M560 420v180M790 420v180" className="room-floor-lines garage-floor-lines" />

        <g className="garage-door">
          <rect x="735" y="42" width="235" height="376" rx="5" />
          <path d="M735 110h235M735 178h235M735 246h235M735 314h235M735 382h235" className="room-detail-line" />
          <path d="M760 52v355M945 52v355" className="room-detail-line" />
        </g>

        <g className="garage-pegboard">
          <rect x="40" y="70" width="395" height="210" rx="5" />
          {Array.from({ length: 10 }, (_, x) => Array.from({ length: 5 }, (_, y) => (
            <circle key={`${x}-${y}`} cx={62 + x * 37} cy={92 + y * 37} r="2.5" />
          )))}
          <path d="M105 112v70M92 128h26M175 103l20 50M250 108v56M230 130h40M335 110l-15 52 34 0z" className="garage-tool-silhouette" />
        </g>

        <g className="garage-workbench">
          <rect x="30" y="320" width="560" height="34" rx="4" className="garage-bench-top" />
          <rect x="55" y="354" width="28" height="126" className="garage-bench-leg" />
          <rect x="535" y="354" width="28" height="126" className="garage-bench-leg" />
          <rect x="115" y="370" width="370" height="82" rx="4" className="garage-bench-cabinet" />
          <path d="M300 370v82" className="room-detail-line" />
          <rect x="450" y="292" width="78" height="26" rx="3" className="garage-vice" />
          <path d="M475 278v40M505 278v40" className="room-metal-line" />
        </g>

        <g className="garage-shelves-static">
          <path d="M620 70h18v310h-18M702 70h18v310h-18M610 135h120M610 215h120M610 295h120M610 375h120" className="garage-shelf-frame" />
          <rect x="642" y="92" width="52" height="36" className="garage-crate-static" />
          <rect x="648" y="166" width="64" height="41" className="garage-crate-static" />
          <circle cx="665" cy="255" r="31" className="garage-tire-static" />
          <rect x="646" y="315" width="52" height="45" className="garage-can-static" />
        </g>

        <g className="garage-metal-cabinet">
          <rect x="835" y="108" width="112" height="275" rx="6" />
          <path d="M835 246h112" className="room-detail-line" />
          <path d="M848 132h86M848 151h86M848 270h86M848 289h86" className="garage-vent-line" />
          <circle cx="925" cy="206" r="5" className="room-metal" />
          <circle cx="925" cy="335" r="5" className="room-metal" />
        </g>

        <g className="garage-cables">
          <path d="M90 35c80 22 110 0 185 25s118 8 170 38M465 35c55 42 100 20 154 53" className="garage-cable" />
          <path d="M194 55v40M545 59v72" className="garage-cable-drop" />
          <circle cx="194" cy="99" r="7" className="room-red" />
          <rect x="530" y="130" width="31" height="22" rx="3" className="room-dark" />
        </g>

        <g className="garage-floor-markings">
          <path d="M610 462h155M640 495h180M600 528h175" className="garage-caution-line" />
          <path d="M640 450l35 80M700 450l35 80M760 450l35 80" className="garage-caution-line" />
          <ellipse cx="265" cy="520" rx="95" ry="28" className="garage-oil-stain" />
        </g>

        <g className="garage-warning-hardware">
          <rect x="22" y="18" width="225" height="28" rx="4" className="warning-plate" />
          <path d="M42 20v24M62 20v24M82 20v24M102 20v24M122 20v24M142 20v24M162 20v24M182 20v24M202 20v24M222 20v24" className="warning-stripe" />
          <circle cx="575" cy="65" r="18" className="room-red" />
          <circle cx="575" cy="65" r="7" className="warning-glow" />
          <path d="M575 83v35" className="room-metal-line" />
        </g>

        <g className="garage-compressor">
          <ellipse cx="898" cy="470" rx="63" ry="45" className="garage-compressor-tank" />
          <rect x="862" y="426" width="72" height="24" rx="4" className="room-dark" />
          <circle cx="875" cy="484" r="10" className="room-metal" />
          <circle cx="925" cy="484" r="10" className="room-metal" />
          <path d="M930 432c18-32 25-55 7-79" className="garage-hose" />
        </g>
      </svg>
    </div>
  );
}
