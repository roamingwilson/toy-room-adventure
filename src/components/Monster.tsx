/** The Hungry Shape Monster — an original fluffy, friendly monster (viewBox 0 0 300 300). */
export type MonsterMood = 'idle' | 'open' | 'chomp' | 'no' | 'happy' | 'burp' | 'sad' | 'sneaky';

export function MonsterArt({ mood = 'idle' }: { mood?: MonsterMood }) {
  const body = '#8E5CF7';
  const belly = '#C3A6FF';
  const happyEyes = mood === 'happy' || mood === 'burp';
  const bumps = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    return <circle key={i} cx={150 + 112 * Math.cos(a)} cy={160 + 108 * Math.sin(a)} r={22} fill={body} />;
  });
  return (
    <g className={`monster monster-${mood}`}>
      <ellipse cx={150} cy={292} rx={110} ry={9} fill="rgba(0,0,0,.12)" />
      <g className="m-bounce">
        {/* feet */}
        <ellipse cx={105} cy={272} rx={34} ry={20} fill="#6C3FD8" />
        <ellipse cx={195} cy={272} rx={34} ry={20} fill="#6C3FD8" />
        {/* horns */}
        <path d="M92 70 Q70 20 96 10 Q96 44 118 62 Z" fill="#FFCA3A" />
        <path d="M208 70 Q230 20 204 10 Q204 44 182 62 Z" fill="#FFCA3A" />
        {/* fluffy body */}
        {bumps}
        <ellipse cx={150} cy={160} rx={115} ry={110} fill={body} />
        <ellipse cx={150} cy={200} rx={70} ry={58} fill={belly} />
        {/* arms */}
        <g className="m-arm-l">
          <ellipse cx={36} cy={190} rx={22} ry={36} fill={body} transform="rotate(30 36 190)" />
        </g>
        <g className="m-arm-r">
          <ellipse cx={264} cy={190} rx={22} ry={36} fill={body} transform="rotate(-30 264 190)" />
        </g>
        {/* eyes */}
        <g className="m-eyes">
          {mood === 'sneaky' ? (
            <g>
              {/* narrowed, scheming eyes + V-shaped brows */}
              <ellipse cx={114} cy={108} rx={25} ry={17} fill="#fff" />
              <ellipse cx={186} cy={108} rx={25} ry={17} fill="#fff" />
              <circle cx={124} cy={110} r={10} fill="#2B2D42" className="m-scheme" />
              <circle cx={196} cy={110} r={10} fill="#2B2D42" className="m-scheme" />
              <path d="M86 98 H142 V88 H86 Z M158 98 H214 V88 H158 Z" fill={body} />
              <path d="M84 80 L138 98 M216 80 L162 98" stroke="#4B2A9E" strokeWidth={9} strokeLinecap="round" />
            </g>
          ) : mood === 'sad' ? (
            <g>
              <circle cx={114} cy={106} r={24} fill="#fff" />
              <circle cx={186} cy={106} r={24} fill="#fff" />
              <circle cx={112} cy={116} r={11} fill="#2B2D42" />
              <circle cx={188} cy={116} r={11} fill="#2B2D42" />
              {/* droopy eyelids + sad brows */}
              <path d="M88 104 Q114 76 140 104 Z" fill={body} />
              <path d="M160 104 Q186 76 212 104 Z" fill={body} />
              <path d="M90 90 Q112 84 132 70 M210 90 Q188 84 168 70" fill="none" stroke="#4B2A9E" strokeWidth={7} strokeLinecap="round" />
              <path className="m-tear" d="M100 134 C94 146 92 152 100 156 C108 152 106 146 100 134 Z" fill="#6EC6FF" />
            </g>
          ) : happyEyes ? (
            <g stroke="#2B2D42" strokeWidth={7} fill="none" strokeLinecap="round">
              <path d="M96 104 Q114 88 132 104" />
              <path d="M168 104 Q186 88 204 104" />
            </g>
          ) : (
            <g>
              <circle cx={114} cy={102} r={26} fill="#fff" />
              <circle cx={186} cy={102} r={26} fill="#fff" />
              <circle cx={mood === 'no' ? 108 : 118} cy={108} r={13} fill="#2B2D42" className="m-pupil" />
              <circle cx={mood === 'no' ? 180 : 190} cy={108} r={13} fill="#2B2D42" className="m-pupil" />
              <circle cx={122} cy={102} r={4} fill="#fff" />
              <circle cx={194} cy={102} r={4} fill="#fff" />
            </g>
          )}
        </g>
        <circle cx={84} cy={150} r={14} fill="#FF8FB1" opacity={0.6} />
        <circle cx={216} cy={150} r={14} fill="#FF8FB1" opacity={0.6} />
        {/* mouth */}
        <g className="m-mouth">
          {mood === 'open' || mood === 'chomp' ? (
            <g className={mood === 'chomp' ? 'm-chomp' : 'm-open'}>
              <ellipse cx={150} cy={178} rx={58} ry={44} fill="#3A0B3F" />
              <ellipse cx={150} cy={204} rx={34} ry={16} fill="#FF6B81" />
              <path d="M104 152 l10 16 l10 -16 Z M176 152 l10 16 l10 -16 Z" fill="#fff" />
            </g>
          ) : mood === 'sneaky' ? (
            <g>
              {/* sly, lopsided grin */}
              <path d="M96 160 Q150 228 210 152 Q156 192 96 160 Z" fill="#3A0B3F" />
              <path d="M112 168 l7 12 l7 -11 Z M176 172 l7 11 l7 -13 Z" fill="#fff" />
            </g>
          ) : mood === 'sad' ? (
            <path d="M116 196 Q150 166 184 196" stroke="#2B2D42" strokeWidth={8} fill="none" strokeLinecap="round" />
          ) : mood === 'no' ? (
            <path d="M118 182 Q150 168 182 182" stroke="#2B2D42" strokeWidth={8} fill="none" strokeLinecap="round" />
          ) : mood === 'burp' ? (
            <ellipse cx={150} cy={178} rx={22} ry={18} fill="#3A0B3F" />
          ) : (
            <g>
              <path d="M108 166 Q150 214 192 166 Z" fill="#3A0B3F" />
              <path d="M120 167 l8 12 l8 -12 Z M164 167 l8 12 l8 -12 Z" fill="#fff" />
            </g>
          )}
        </g>
      </g>
    </g>
  );
}

export function Monster({ mood = 'idle', className = '', style }: { mood?: MonsterMood; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 300 300" className={className} style={style} overflow="visible" aria-hidden>
      <MonsterArt mood={mood} />
    </svg>
  );
}
