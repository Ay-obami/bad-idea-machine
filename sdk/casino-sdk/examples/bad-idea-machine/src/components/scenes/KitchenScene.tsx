export function KitchenScene() {
  return (
    <div className="environment-scene environment-scene--kitchen" data-environment="kitchen" aria-hidden="true">
      <svg className="environment-art" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="kitchen-wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4b4035" />
            <stop offset="1" stopColor="#24231f" />
          </linearGradient>
          <linearGradient id="kitchen-counter" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#c6b395" />
            <stop offset="1" stopColor="#746a59" />
          </linearGradient>
        </defs>
        <rect width="1000" height="600" fill="url(#kitchen-wall)" />
        <g className="kitchen-tiles">
          {Array.from({ length: 13 }, (_, x) => Array.from({ length: 6 }, (_, y) => (
            <rect key={`${x}-${y}`} x={x * 78} y={82 + y * 54} width="76" height="52" rx="2" />
          )))}
        </g>
        <rect x="0" y="438" width="1000" height="162" className="kitchen-floor" />
        <path d="M0 490h1000M0 545h1000M110 438v162M270 438v162M450 438v162M650 438v162M840 438v162" className="room-floor-lines" />

        <g className="kitchen-upper-cabinets">
          <rect x="35" y="55" width="190" height="125" rx="7" />
          <rect x="242" y="55" width="190" height="125" rx="7" />
          <rect x="449" y="55" width="190" height="125" rx="7" />
          <path d="M130 55v125M337 55v125M544 55v125" className="room-detail-line" />
          <circle cx="120" cy="120" r="5" /><circle cx="140" cy="120" r="5" />
          <circle cx="327" cy="120" r="5" /><circle cx="347" cy="120" r="5" />
          <circle cx="534" cy="120" r="5" /><circle cx="554" cy="120" r="5" />
        </g>

        <g className="kitchen-fridge">
          <rect x="835" y="108" width="130" height="330" rx="10" />
          <path d="M835 250h130" className="room-detail-line" />
          <rect x="850" y="152" width="8" height="55" rx="4" className="room-metal" />
          <rect x="850" y="284" width="8" height="75" rx="4" className="room-metal" />
          <rect x="882" y="180" width="55" height="35" rx="3" className="kitchen-warning-note" />
        </g>

        <g className="kitchen-counter-bank">
          <rect x="18" y="330" width="800" height="115" rx="5" fill="url(#kitchen-counter)" />
          <rect x="22" y="442" width="792" height="18" rx="3" className="room-dark" />
          <rect x="35" y="365" width="116" height="78" rx="4" className="kitchen-cabinet-base" />
          <rect x="160" y="365" width="116" height="78" rx="4" className="kitchen-cabinet-base" />
          <rect x="285" y="365" width="116" height="78" rx="4" className="kitchen-cabinet-base" />
          <rect x="410" y="365" width="116" height="78" rx="4" className="kitchen-cabinet-base" />
          <rect x="535" y="365" width="116" height="78" rx="4" className="kitchen-cabinet-base" />
          <rect x="660" y="365" width="138" height="78" rx="4" className="kitchen-cabinet-base" />
        </g>

        <g className="kitchen-stove">
          <rect x="402" y="316" width="175" height="130" rx="6" />
          <rect x="416" y="333" width="147" height="18" rx="5" className="room-dark" />
          <circle cx="445" cy="342" r="8" /><circle cx="490" cy="342" r="8" /><circle cx="535" cy="342" r="8" />
          <rect x="424" y="367" width="132" height="65" rx="5" className="kitchen-oven-window" />
        </g>

        <g className="kitchen-sink">
          <path d="M635 337h155v54H635z" className="kitchen-sink-basin" />
          <path d="M705 336v-34c0-21 47-22 47 0v15" className="room-metal-line" />
          <path d="M752 317h-18" className="room-metal-line" />
        </g>

        <g className="kitchen-microwave">
          <rect x="650" y="205" width="150" height="90" rx="8" />
          <rect x="664" y="219" width="95" height="58" rx="5" className="room-dark" />
          <circle cx="781" cy="235" r="6" className="room-red" />
          <circle cx="781" cy="255" r="6" className="room-metal" />
        </g>

        <g className="kitchen-hanging-rack">
          <path d="M90 225h310" className="room-metal-line" />
          <path d="M145 225v46M205 225v62M270 225v50M335 225v65" className="room-metal-line" />
          <circle cx="145" cy="284" r="17" className="hanging-pan" />
          <ellipse cx="205" cy="300" rx="24" ry="12" className="hanging-pan" />
          <path d="M270 275l15 30M335 290l18 18" className="room-metal-line" />
        </g>

        <g className="kitchen-warning-hardware">
          <rect x="22" y="18" width="210" height="28" rx="4" className="warning-plate" />
          <path d="M42 20v24M62 20v24M82 20v24M102 20v24M122 20v24M142 20v24M162 20v24M182 20v24M202 20v24" className="warning-stripe" />
          <circle cx="780" cy="70" r="18" className="room-red" />
          <circle cx="780" cy="70" r="7" className="warning-glow" />
          <path d="M780 88v34" className="room-metal-line" />
        </g>

        <g className="kitchen-pipes">
          <path d="M0 205h70v65h65M965 70h-75v80h-42" className="room-pipe" />
          <circle cx="70" cy="205" r="9" className="room-metal" />
          <circle cx="890" cy="70" r="9" className="room-metal" />
        </g>
      </svg>
    </div>
  );
}
