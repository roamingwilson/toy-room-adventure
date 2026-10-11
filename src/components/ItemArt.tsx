import type { ItemId, ShapeId } from '../content/vocab';
import { MonsterArt } from './Monster';

/** Original, hand-built SVG pictures for every vocabulary item (viewBox 0 0 200 200). */

export const C = {
  red: '#FF595E',
  orange: '#FF924C',
  yellow: '#FFCA3A',
  green: '#8AC926',
  teal: '#2EC4B6',
  blue: '#1982C4',
  purple: '#8E5CF7',
  pink: '#FF5DA2',
  ink: '#2B2D42',
  wood: '#B86B32',
  woodDark: '#8A4B1F',
};

export const SHAPE_COLORS: Record<ShapeId, string> = {
  circle: C.red,
  square: C.blue,
  triangle: C.green,
  heart: C.pink,
};

/** Outline paths (also used for "draw it in the air" tracing). */
export const SHAPE_PATHS: Record<ShapeId, string> = {
  circle: 'M100 28 A72 72 0 1 1 99.9 28 Z',
  square: 'M44 30 H156 Q170 30 170 44 V156 Q170 170 156 170 H44 Q30 170 30 156 V44 Q30 30 44 30 Z',
  triangle: 'M100 26 L178 164 L22 164 Z',
  heart: 'M100 172 C30 122 8 82 38 50 C62 26 94 36 100 62 C106 36 138 26 162 50 C192 82 170 122 100 172 Z',
};

function Face({ y = 100, dark = false }: { y?: number; dark?: boolean }) {
  return (
    <g>
      <circle cx={82} cy={y} r={11} fill="#fff" />
      <circle cx={118} cy={y} r={11} fill="#fff" />
      <circle cx={84} cy={y + 2} r={5.5} fill={C.ink} />
      <circle cx={120} cy={y + 2} r={5.5} fill={C.ink} />
      <circle cx={86} cy={y} r={1.8} fill="#fff" />
      <circle cx={122} cy={y} r={1.8} fill="#fff" />
      <path d={`M86 ${y + 20} Q100 ${y + 34} 114 ${y + 20}`} stroke={dark ? C.ink : '#fff'} strokeWidth={5} fill="none" strokeLinecap="round" />
    </g>
  );
}

export function ShapeArt({ id, face = true }: { id: ShapeId; face?: boolean }) {
  const fill = SHAPE_COLORS[id];
  const faceY = id === 'triangle' ? 115 : id === 'heart' ? 88 : 92;
  return (
    <g>
      <path d={SHAPE_PATHS[id]} fill={fill} stroke={fill} strokeWidth={id === 'triangle' ? 18 : 6} strokeLinejoin="round" />
      <path d={SHAPE_PATHS[id]} fill="none" stroke="rgba(255,255,255,.35)" strokeWidth={4} strokeLinejoin="round" transform="translate(100 100) scale(.86) translate(-100 -100)" />
      {face && <Face y={faceY} />}
    </g>
  );
}

function Doll() {
  return (
    <g>
      <circle cx={56} cy={64} r={20} fill={C.yellow} />
      <circle cx={144} cy={64} r={20} fill={C.yellow} />
      <circle cx={46} cy={50} r={9} fill={C.pink} />
      <circle cx={154} cy={50} r={9} fill={C.pink} />
      <path d="M78 116 L50 146" stroke="#FFD7B5" strokeWidth={13} strokeLinecap="round" />
      <path d="M122 116 L150 146" stroke="#FFD7B5" strokeWidth={13} strokeLinecap="round" />
      <rect x={82} y={168} width={13} height={22} rx={6} fill="#FFD7B5" />
      <rect x={105} y={168} width={13} height={22} rx={6} fill="#FFD7B5" />
      <ellipse cx={88} cy={192} rx={11} ry={6} fill={C.red} />
      <ellipse cx={112} cy={192} rx={11} ry={6} fill={C.red} />
      <path d="M100 98 L152 176 Q100 190 48 176 Z" fill={C.pink} stroke="#E0408A" strokeWidth={3} strokeLinejoin="round" />
      <circle cx={88} cy={150} r={5} fill="#fff" opacity={0.8} />
      <circle cx={112} cy={160} r={5} fill="#fff" opacity={0.8} />
      <circle cx={100} cy={135} r={5} fill="#fff" opacity={0.8} />
      <circle cx={100} cy={64} r={36} fill="#FFD7B5" />
      <path d="M64 62 Q66 26 100 26 Q134 26 136 62 Q120 44 100 48 Q80 44 64 62Z" fill={C.yellow} />
      <circle cx={87} cy={68} r={5} fill={C.ink} />
      <circle cx={113} cy={68} r={5} fill={C.ink} />
      <circle cx={88.5} cy={66.5} r={1.6} fill="#fff" />
      <circle cx={114.5} cy={66.5} r={1.6} fill="#fff" />
      <circle cx={78} cy={80} r={6} fill="#FF9AB8" opacity={0.75} />
      <circle cx={122} cy={80} r={6} fill="#FF9AB8" opacity={0.75} />
      <path d="M90 82 Q100 92 110 82" stroke="#C2185B" strokeWidth={3.5} fill="none" strokeLinecap="round" />
      <path d="M86 106 Q100 116 114 106" stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" />
    </g>
  );
}

function Puzzle() {
  return (
    <g strokeLinejoin="round">
      <g transform="rotate(-4 100 100)">
        <rect x={28} y={28} width={72} height={72} rx={6} fill={C.red} stroke="#fff" strokeWidth={4} />
        <rect x={100} y={28} width={72} height={72} rx={6} fill={C.yellow} stroke="#fff" strokeWidth={4} />
        <rect x={28} y={100} width={72} height={72} rx={6} fill={C.blue} stroke="#fff" strokeWidth={4} />
        <circle cx={101} cy={64} r={13} fill={C.red} />
        <circle cx={136} cy={101} r={13} fill={C.yellow} />
        <circle cx={64} cy={99} r={13} fill={C.blue} />
      </g>
      <g transform="translate(14 12) rotate(10 136 136)">
        <rect x={100} y={100} width={72} height={72} rx={6} fill={C.green} stroke="#fff" strokeWidth={4} />
        <circle cx={100} cy={136} r={13} fill={C.green} />
        <circle cx={136} cy={136} r={8} fill="#fff" opacity={0.35} />
      </g>
    </g>
  );
}

function Cube({ x, y, s, front, top, side, letter }: { x: number; y: number; s: number; front: string; top: string; side: string; letter: string }) {
  const d = s * 0.3;
  return (
    <g stroke="rgba(0,0,0,.15)" strokeWidth={2} strokeLinejoin="round">
      <polygon points={`${x},${y} ${x + d},${y - d} ${x + s + d},${y - d} ${x + s},${y}`} fill={top} />
      <polygon points={`${x + s},${y} ${x + s + d},${y - d} ${x + s + d},${y + s - d} ${x + s},${y + s}`} fill={side} />
      <rect x={x} y={y} width={s} height={s} fill={front} />
      <rect x={x + 7} y={y + 7} width={s - 14} height={s - 14} rx={6} fill="none" stroke="rgba(255,255,255,.7)" strokeWidth={3} />
      <text x={x + s / 2} y={y + s / 2 + 13} textAnchor="middle" fontSize={36} fontWeight={900} fill="#fff" stroke="none" fontFamily="Arial Rounded MT Bold, Arial, sans-serif">
        {letter}
      </text>
    </g>
  );
}

function Blocks() {
  return (
    <g>
      <Cube x={22} y={122} s={60} front={C.red} top="#FF8A8D" side="#D93A40" letter="A" />
      <Cube x={88} y={122} s={60} front={C.blue} top="#5AB0E8" side="#10639A" letter="B" />
      <Cube x={56} y={60} s={60} front={C.yellow} top="#FFE08A" side="#E0A800" letter="C" />
    </g>
  );
}

function Ball() {
  const colors = [C.red, C.yellow, C.blue, '#fff', C.green, C.orange];
  const cx = 100, cy = 104, r = 76;
  const wedges = colors.map((col, i) => {
    const a1 = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const a2 = ((i + 1) / 6) * Math.PI * 2 - Math.PI / 2;
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
    return <path key={i} d={`M${cx} ${cy} L${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2} Z`} fill={col} />;
  });
  return (
    <g>
      <ellipse cx={100} cy={188} rx={60} ry={8} fill="rgba(0,0,0,.12)" />
      {wedges}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(0,0,0,.18)" strokeWidth={4} />
      <circle cx={cx} cy={cy} r={12} fill="#fff" stroke="rgba(0,0,0,.15)" strokeWidth={3} />
      <ellipse cx={70} cy={66} rx={22} ry={12} fill="#fff" opacity={0.45} transform="rotate(-35 70 66)" />
    </g>
  );
}

function Kite({ withTail = true }: { withTail?: boolean }) {
  return (
    <g strokeLinejoin="round">
      {withTail && (
        <g>
          <path d="M100 160 Q80 175 95 185 Q110 195 70 198" stroke={C.ink} strokeWidth={3} fill="none" />
          <path d="M88 172 l-12 -8 l2 14 Z M88 172 l12 8 l-14 2 Z" fill={C.red} />
          <path d="M92 190 l-12 -6 l3 13 Z M92 190 l12 6 l-14 3 Z" fill={C.blue} />
        </g>
      )}
      <polygon points="100,14 100,74 44,74" fill={C.red} />
      <polygon points="100,14 156,74 100,74" fill={C.yellow} />
      <polygon points="100,74 156,74 100,162" fill={C.blue} />
      <polygon points="44,74 100,74 100,162" fill={C.green} />
      <polygon points="100,14 156,74 100,162 44,74" fill="none" stroke="#fff" strokeWidth={5} />
      <path d="M100 14 V162 M44 74 H156" stroke={C.woodDark} strokeWidth={4} />
    </g>
  );
}

export function TeddyBearArt() {
  const fur = '#B5733A', light = '#EBC08F', dark = '#4A2C17';
  return (
    <g>
      <ellipse cx={66} cy={176} rx={22} ry={17} fill={fur} />
      <ellipse cx={134} cy={176} rx={22} ry={17} fill={fur} />
      <ellipse cx={66} cy={178} rx={11} ry={9} fill={light} />
      <ellipse cx={134} cy={178} rx={11} ry={9} fill={light} />
      <ellipse cx={100} cy={140} rx={46} ry={44} fill={fur} />
      <ellipse cx={100} cy={146} rx={27} ry={28} fill={light} />
      <ellipse cx={54} cy={128} rx={14} ry={24} fill={fur} transform="rotate(25 54 128)" />
      <ellipse cx={146} cy={128} rx={14} ry={24} fill={fur} transform="rotate(-25 146 128)" />
      <circle cx={58} cy={30} r={18} fill={fur} />
      <circle cx={142} cy={30} r={18} fill={fur} />
      <circle cx={58} cy={30} r={9} fill={light} />
      <circle cx={142} cy={30} r={9} fill={light} />
      <circle cx={100} cy={64} r={46} fill={fur} />
      <ellipse cx={100} cy={82} rx={21} ry={16} fill={light} />
      <ellipse cx={100} cy={74} rx={8} ry={6} fill={dark} />
      <path d="M92 86 Q100 94 108 86" stroke={dark} strokeWidth={3} fill="none" strokeLinecap="round" />
      <circle cx={82} cy={58} r={6} fill={dark} />
      <circle cx={118} cy={58} r={6} fill={dark} />
      <circle cx={84} cy={56} r={2} fill="#fff" />
      <circle cx={120} cy={56} r={2} fill="#fff" />
      <path d="M100 106 L82 96 V116 Z M100 106 L118 96 V116 Z" fill="#2EC4B6" />
      <circle cx={100} cy={106} r={5} fill="#1A9E92" />
    </g>
  );
}

export function WindowArt() {
  return (
    <g>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6EC6FF" />
          <stop offset="1" stopColor="#C8ECFF" />
        </linearGradient>
      </defs>
      <rect x={24} y={24} width={152} height={152} rx={8} fill="url(#sky)" stroke="#fff" strokeWidth={12} />
      <circle cx={140} cy={62} r={16} fill={C.yellow} />
      <g fill="#fff">
        <circle cx={60} cy={130} r={12} />
        <circle cx={74} cy={124} r={15} />
        <circle cx={90} cy={130} r={11} />
      </g>
      <path d="M100 24 V176 M24 100 H176" stroke="#fff" strokeWidth={10} />
      <rect x={24} y={24} width={152} height={152} rx={8} fill="none" stroke={C.woodDark} strokeWidth={4} />
      <rect x={14} y={174} width={172} height={14} rx={6} fill={C.wood} />
    </g>
  );
}

export function LampArt({ on = true }: { on?: boolean }) {
  return (
    <g>
      {on && (
        <>
          <defs>
            <radialGradient id="lampGlow">
              <stop offset="0" stopColor="#FFF3B0" stopOpacity={0.9} />
              <stop offset="1" stopColor="#FFF3B0" stopOpacity={0} />
            </radialGradient>
          </defs>
          <circle cx={100} cy={90} r={90} fill="url(#lampGlow)" />
        </>
      )}
      <rect x={94} y={100} width={12} height={74} rx={5} fill={C.woodDark} />
      <ellipse cx={100} cy={180} rx={44} ry={12} fill={C.woodDark} />
      <path d="M100 18 L156 108 L44 108 Z" fill={C.yellow} stroke="#F0A500" strokeWidth={10} strokeLinejoin="round" />
      <path d="M70 92 H130" stroke="#fff" strokeWidth={5} opacity={0.6} strokeLinecap="round" />
      <path d="M128 108 V132" stroke={C.ink} strokeWidth={3} />
      <circle cx={128} cy={136} r={5} fill={C.red} />
    </g>
  );
}

export function DoorArt() {
  return (
    <g>
      <rect x={44} y={10} width={112} height={184} rx={8} fill={C.woodDark} />
      <rect x={52} y={16} width={96} height={178} rx={6} fill="#D9874A" />
      <rect x={64} y={30} width={72} height={60} rx={8} fill="#E9A06A" stroke="#C06D33" strokeWidth={3} />
      <rect x={64} y={104} width={72} height={74} rx={8} fill="#E9A06A" stroke="#C06D33" strokeWidth={3} />
      <circle cx={134} cy={104} r={8} fill={C.yellow} stroke="#D49B00" strokeWidth={3} />
    </g>
  );
}

export function ClockArt() {
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    const r1 = i % 3 === 0 ? 50 : 56;
    return (
      <line key={i} x1={100 + r1 * Math.sin(a)} y1={100 - r1 * Math.cos(a)} x2={100 + 62 * Math.sin(a)} y2={100 - 62 * Math.cos(a)}
        stroke={C.ink} strokeWidth={i % 3 === 0 ? 7 : 4} strokeLinecap="round" />
    );
  });
  return (
    <g>
      <circle cx={100} cy={100} r={84} fill={C.teal} />
      <circle cx={100} cy={100} r={72} fill="#fff" />
      {ticks}
      <line x1={100} y1={100} x2={100} y2={58} stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
      <line x1={100} y1={100} x2={130} y2={112} stroke={C.red} strokeWidth={7} strokeLinecap="round" />
      <circle cx={100} cy={100} r={8} fill={C.ink} />
      <circle cx={84} cy={128} r={4} fill={C.ink} />
      <circle cx={116} cy={128} r={4} fill={C.ink} />
      <path d="M92 138 Q100 144 108 138" stroke={C.ink} strokeWidth={3} fill="none" strokeLinecap="round" />
    </g>
  );
}

export function BedArt() {
  return (
    <g strokeLinejoin="round">
      <rect x={14} y={34} width={26} height={160} rx={10} fill={C.wood} />
      <rect x={168} y={78} width={22} height={116} rx={9} fill={C.wood} />
      <rect x={24} y={120} width={160} height={16} rx={4} fill={C.woodDark} />
      <rect x={30} y={98} width={150} height={26} rx={10} fill="#fff" />
      <ellipse cx={62} cy={94} rx={26} ry={14} fill="#FDF0D5" stroke="#E8D3A8" strokeWidth={3} />
      <path d="M80 92 H178 Q184 92 184 100 V134 Q184 140 178 140 H84 Q78 140 78 134 Z" fill={C.blue} />
      <g fill="#fff" opacity={0.6}>
        <circle cx={104} cy={110} r={5} />
        <circle cx={134} cy={122} r={5} />
        <circle cx={160} cy={106} r={5} />
        <circle cx={118} cy={130} r={4} />
      </g>
      <rect x={20} y={136} width={10} height={58} rx={4} fill={C.woodDark} />
      <rect x={172} y={136} width={10} height={58} rx={4} fill={C.woodDark} />
    </g>
  );
}

export function ToyBoxArt({ open = false, layer = 'all' }: { open?: boolean; layer?: 'all' | 'back' | 'front' }) {
  const back = (
    <g>
      {open ? (
        <g>
          <rect x={30} y={66} width={140} height={30} rx={6} fill="#7A3A12" />
          <rect x={24} y={8} width={152} height={30} rx={10} fill="#E0662A" transform="rotate(-8 24 38)" />
        </g>
      ) : null}
    </g>
  );
  const front = (
    <g>
      <circle cx={46} cy={184} r={9} fill={C.woodDark} />
      <circle cx={154} cy={184} r={9} fill={C.woodDark} />
      <rect x={24} y={80} width={152} height={100} rx={12} fill={C.orange} stroke="#E0662A" strokeWidth={5} />
      <path d="M24 108 H176 M24 156 H176" stroke="#FFB27A" strokeWidth={6} />
      <path d="M100 166 C70 146 64 132 74 122 C82 114 96 116 100 126 C104 116 118 114 126 122 C136 132 130 146 100 166 Z" fill={C.pink} stroke="#fff" strokeWidth={4} />
      {!open && <rect x={16} y={60} width={168} height={30} rx={10} fill="#E0662A" stroke="#C84F18" strokeWidth={4} />}
    </g>
  );
  if (layer === 'back') return back;
  if (layer === 'front') return front;
  return (
    <g>
      {back}
      {front}
    </g>
  );
}

function Sock() {
  return (
    <g>
      <path d="M78 24 H128 V112 Q128 128 140 140 L156 152 Q176 170 156 184 Q140 194 118 182 L86 160 Q74 150 76 130 Z" fill="#fff" stroke="#9E9E9E" strokeWidth={4} strokeLinejoin="round" />
      <path d="M78 46 H128 M78 64 H128" stroke={C.red} strokeWidth={8} />
      <path d="M120 176 Q140 192 160 176" stroke={C.red} strokeWidth={6} fill="none" />
      <g stroke="#7CB342" strokeWidth={6} fill="none" strokeLinecap="round" className="stink">
        <path d="M150 120 q10 -12 0 -24 q-10 -12 0 -24" />
        <path d="M172 130 q10 -12 0 -24 q-10 -12 0 -24" />
        <path d="M44 120 q10 -12 0 -24 q-10 -12 0 -24" />
      </g>
      <circle cx={92} cy={100} r={6} fill={C.ink} />
      <circle cx={114} cy={100} r={6} fill={C.ink} />
      <path d="M92 120 Q103 112 114 120" stroke={C.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
    </g>
  );
}

function Spider() {
  const legs = [-1, 1].flatMap((s) =>
    [0, 1, 2, 3].map((i) => (
      <path key={`${s}${i}`} d={`M100 110 Q${100 + s * (50 + i * 6)} ${70 + i * 18} ${100 + s * (78 + i * 4)} ${96 + i * 26}`} stroke={C.ink} strokeWidth={7} fill="none" strokeLinecap="round" />
    )),
  );
  return (
    <g>
      <line x1={100} y1={0} x2={100} y2={70} stroke="#9E9E9E" strokeWidth={3} />
      {legs}
      <ellipse cx={100} cy={118} rx={44} ry={40} fill={C.ink} />
      <circle cx={84} cy={110} r={14} fill="#fff" />
      <circle cx={116} cy={110} r={14} fill="#fff" />
      <circle cx={86} cy={113} r={7} fill={C.ink} />
      <circle cx={118} cy={113} r={7} fill={C.ink} />
      <path d="M86 136 Q100 148 114 136" stroke="#fff" strokeWidth={4} fill="none" strokeLinecap="round" />
      <circle cx={70} cy={130} r={6} fill={C.pink} opacity={0.7} />
      <circle cx={130} cy={130} r={6} fill={C.pink} opacity={0.7} />
    </g>
  );
}

function Worm() {
  return (
    <g>
      <path d="M24 110 H176 Q170 180 100 182 Q30 180 24 110 Z" fill={C.blue} />
      <ellipse cx={100} cy={110} rx={76} ry={14} fill="#0F5F92" />
      <path d="M60 112 Q70 60 96 84 Q120 108 132 70 Q140 44 156 56" stroke="#FF8FB1" strokeWidth={18} fill="none" strokeLinecap="round" />
      <circle cx={152} cy={52} r={3.5} fill={C.ink} />
      <circle cx={162} cy={58} r={3.5} fill={C.ink} />
      <path d="M52 112 Q80 86 108 112" stroke="#FF8FB1" strokeWidth={14} fill="none" strokeLinecap="round" />
      <path d="M40 150 H160" stroke="#fff" strokeWidth={5} opacity={0.4} strokeLinecap="round" />
    </g>
  );
}

const ART: Record<ItemId, () => JSX.Element> = {
  doll: Doll,
  puzzle: Puzzle,
  blocks: Blocks,
  ball: Ball,
  kite: () => <Kite />,
  teddy: TeddyBearArt,
  circle: () => <ShapeArt id="circle" />,
  square: () => <ShapeArt id="square" />,
  triangle: () => <ShapeArt id="triangle" />,
  heart: () => <ShapeArt id="heart" />,
  window: WindowArt,
  lamp: () => <LampArt />,
  door: DoorArt,
  clock: ClockArt,
  bed: BedArt,
  toybox: () => <ToyBoxArt />,
  sock: Sock,
  spider: Spider,
  worm: Worm,
  monster: () => (
    <g transform="translate(5 5) scale(.63)">
      <MonsterArt mood="idle" />
    </g>
  ),
};

export function ItemArt({ id, className, style }: { id: ItemId; className?: string; style?: React.CSSProperties }) {
  const Art = ART[id];
  return (
    <svg viewBox="0 0 200 200" className={className} style={style} aria-hidden overflow="visible">
      <Art />
    </svg>
  );
}

export { Kite };
