/**
 * Teddy — the class mascot (an original teddy bear character).
 * Moods are pure CSS animations defined in index.css.
 */
export type TeddyMood =
  | 'idle' | 'wave' | 'laugh' | 'dance' | 'happy' | 'shake' | 'sneeze'
  | 'surprised' | 'cover' | 'point' | 'yuck' | 'think' | 'sleep' | 'sad';

const FUR = '#B5733A';
const LIGHT = '#EBC08F';
const DARK = '#4A2C17';

export function Teddy({ mood = 'idle', className = '', style, onClick }: { mood?: TeddyMood; className?: string; style?: React.CSSProperties; onClick?: () => void }) {
  const closedEyes = mood === 'laugh' || mood === 'happy' || mood === 'sneeze' || mood === 'yuck' || mood === 'sleep';
  const bigEyes = mood === 'surprised';
  const openMouth = mood === 'laugh' || mood === 'surprised' || mood === 'dance' || mood === 'sneeze';
  return (
    <svg viewBox="0 0 200 240" className={`teddy teddy-${mood} ${className}`} style={style} onClick={onClick} overflow="visible" aria-hidden>
      <g className="t-all">
        <ellipse cx={100} cy={236} rx={62} ry={6} fill="rgba(0,0,0,.12)" className="t-shadow" />
        <g className="t-jump">
          {/* legs */}
          <g className="t-leg-l">
            <ellipse cx={72} cy={214} rx={24} ry={19} fill={FUR} />
            <ellipse cx={72} cy={216} rx={12} ry={10} fill={LIGHT} />
          </g>
          <g className="t-leg-r">
            <ellipse cx={128} cy={214} rx={24} ry={19} fill={FUR} />
            <ellipse cx={128} cy={216} rx={12} ry={10} fill={LIGHT} />
          </g>
          {/* body */}
          <g className="t-body">
            <ellipse cx={100} cy={168} rx={52} ry={52} fill={FUR} />
            <ellipse cx={100} cy={176} rx={32} ry={32} fill={LIGHT} />
            {/* arms */}
            <g className="t-arm-l">
              <ellipse cx={52} cy={156} rx={15} ry={30} fill={FUR} transform="rotate(22 52 156)" />
              <circle cx={44} cy={178} r={9} fill={LIGHT} />
            </g>
            <g className="t-arm-r">
              <ellipse cx={148} cy={156} rx={15} ry={30} fill={FUR} transform="rotate(-22 148 156)" />
              <circle cx={156} cy={178} r={9} fill={LIGHT} />
            </g>
            {/* bow tie */}
            <path d="M100 124 L80 112 V136 Z M100 124 L120 112 V136 Z" fill="#E63946" />
            <circle cx={100} cy={124} r={6} fill="#B71C2C" />
          </g>
          {/* head */}
          <g className="t-head">
            <circle cx={54} cy={36} r={22} fill={FUR} />
            <circle cx={146} cy={36} r={22} fill={FUR} />
            <circle cx={54} cy={36} r={11} fill={LIGHT} />
            <circle cx={146} cy={36} r={11} fill={LIGHT} />
            <circle cx={100} cy={74} r={56} fill={FUR} />
            <circle cx={68} cy={94} r={9} fill="#FF8FA3" opacity={0.6} />
            <circle cx={132} cy={94} r={9} fill="#FF8FA3" opacity={0.6} />
            <ellipse cx={100} cy={96} rx={27} ry={21} fill={LIGHT} />
            <ellipse cx={100} cy={86} rx={10} ry={7.5} fill={DARK} />
            <ellipse cx={97} cy={84} rx={3} ry={2} fill="#fff" opacity={0.6} />
            {/* eyes */}
            <g className="t-eyes">
              {closedEyes ? (
                <g stroke={DARK} strokeWidth={5} fill="none" strokeLinecap="round">
                  <path d="M70 68 Q78 60 86 68" />
                  <path d="M114 68 Q122 60 130 68" />
                </g>
              ) : (
                <g>
                  <circle cx={78} cy={66} r={bigEyes ? 11 : 8} fill={DARK} />
                  <circle cx={122} cy={66} r={bigEyes ? 11 : 8} fill={DARK} />
                  <circle cx={81} cy={63} r={3} fill="#fff" />
                  <circle cx={125} cy={63} r={3} fill="#fff" />
                </g>
              )}
            </g>
            {/* mouth */}
            {mood === 'sad' ? (
              <g>
                {/* worried brows, frown and a tear */}
                <path d="M64 52 Q74 50 88 42 M136 52 Q126 50 112 42" stroke={DARK} strokeWidth={4} fill="none" strokeLinecap="round" />
                <path d="M88 110 Q100 99 112 110" stroke={DARK} strokeWidth={4} fill="none" strokeLinecap="round" />
                <path className="m-tear" d="M74 78 C69 88 68 93 74 96 C80 93 79 88 74 78 Z" fill="#6EC6FF" />
              </g>
            ) : mood === 'yuck' ? (
              <g>
                <path d="M88 102 Q100 96 112 102" stroke={DARK} strokeWidth={4} fill="none" strokeLinecap="round" />
                <path d="M96 102 Q100 116 106 102" fill="#FF6B81" />
              </g>
            ) : openMouth ? (
              <path d={mood === 'surprised' ? 'M93 104 a7 8 0 1 0 14 0 a7 8 0 1 0 -14 0' : 'M86 100 Q100 100 114 100 Q112 118 100 118 Q88 118 86 100 Z'} fill="#8B1E2D" />
            ) : mood === 'think' || mood === 'shake' ? (
              <path d="M90 104 Q100 100 110 104" stroke={DARK} strokeWidth={4} fill="none" strokeLinecap="round" />
            ) : (
              <path d="M88 100 Q100 112 112 100" stroke={DARK} strokeWidth={4} fill="none" strokeLinecap="round" />
            )}
            {mood === 'sleep' && (
              <text x={150} y={20} fontSize={30} fontWeight={900} fill="#7E8CE0" className="zzz">z</text>
            )}
          </g>
        </g>
      </g>
    </svg>
  );
}
