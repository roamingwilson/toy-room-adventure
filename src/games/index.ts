import type { GameId } from '../state/store';
import { ToyParade } from './ToyParade';
import { MysteryBox } from './MysteryBox';
import { FreezeDance } from './FreezeDance';
import { HungryMonster } from './HungryMonster';
import { WheresTeddy } from './WheresTeddy';
import { CopyTeddy } from './CopyTeddy';
import { BlockTower } from './BlockTower';
import { YesNo } from './YesNo';
import { TeddyEscape } from './TeddyEscape';
import { KiteFinale } from './KiteFinale';

export interface GameProps {
  /** Mark the activity complete and show the "Great job!" screen. */
  onFinish: () => void;
}

export const GAMES: Record<GameId, (p: GameProps) => JSX.Element> = {
  parade: ToyParade,
  mystery: MysteryBox,
  freeze: FreezeDance,
  monster: HungryMonster,
  where: WheresTeddy,
  copy: CopyTeddy,
  count: BlockTower,
  yesno: YesNo,
  escape: TeddyEscape,
  kites: KiteFinale,
};
