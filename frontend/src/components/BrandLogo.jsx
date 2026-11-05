export default function BrandLogo({ size = 48 }) {
  return (
    <div className="brand-mark" style={{ width:size, height:size }} aria-label="Predictra logo">
      <svg viewBox="0 0 100 100" width="100%" height="100%" fill="none" role="img">
        <defs>
          <linearGradient id="orbitPurple" x1="12" y1="12" x2="88" y2="88">
            <stop stopColor="#d46bff"/><stop offset="1" stopColor="#7447ff"/>
          </linearGradient>
          <linearGradient id="coreCyan" x1="35" y1="35" x2="65" y2="65">
            <stop stopColor="#57fff0"/><stop offset="1" stopColor="#00a9d2"/>
          </linearGradient>
          <filter id="logoGlow"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <path d="M22 72 A36 36 0 1 1 77 28" stroke="url(#orbitPurple)" strokeWidth="5" strokeLinecap="round" filter="url(#logoGlow)"/>
        <path d="M15 69 C29 91 61 72 80 43 C92 24 81 15 66 19" stroke="url(#orbitPurple)" strokeWidth="5" strokeLinecap="round" filter="url(#logoGlow)"/>
        <path d="M28 30 A29 29 0 0 0 27 68" stroke="#b36aff" strokeWidth="2" strokeLinecap="round" opacity=".8"/>
        <circle cx="50" cy="59" r="9" fill="url(#coreCyan)" filter="url(#logoGlow)"/>
        <path d="M50 8 L53 21 L66 24 L53 27 L50 40 L47 27 L34 24 L47 21Z" fill="#c36aff" filter="url(#logoGlow)"/>
      </svg>
    </div>
  )
}
