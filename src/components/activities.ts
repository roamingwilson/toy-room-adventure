import type { GameId } from '../state/store';
import type { ItemId } from '../content/vocab';

/** The 10 stops on the home map, in class order (about 90 minutes). */
export const ACTIVITIES: { id: GameId; name: string; minutes: number; icon: ItemId | 'teddy-mascot' | 'monster' | 'escape'; color: string }[] = [
  { id: 'parade', name: 'Toy Parade', minutes: 8, icon: 'ball', color: '#FF595E' },
  { id: 'mystery', name: 'Mystery Gift Box', minutes: 10, icon: 'toybox', color: '#FF924C' },
  { id: 'freeze', name: 'Shape Freeze Dance', minutes: 8, icon: 'triangle', color: '#FFCA3A' },
  { id: 'monster', name: 'Hungry Shape Monster', minutes: 12, icon: 'monster', color: '#8E5CF7' },
  { id: 'where', name: "Where's Teddy?", minutes: 12, icon: 'bed', color: '#1982C4' },
  { id: 'copy', name: 'Copy Teddy', minutes: 8, icon: 'teddy-mascot', color: '#2EC4B6' },
  { id: 'count', name: 'Block Tower Count', minutes: 10, icon: 'blocks', color: '#8AC926' },
  { id: 'yesno', name: "Yes I Do! No I Don't!", minutes: 8, icon: 'heart', color: '#FF5DA2' },
  { id: 'escape', name: 'Run, Teddy, Run!', minutes: 8, icon: 'escape', color: '#3FA34D' },
  { id: 'kites', name: 'Kite Goodbye', minutes: 6, icon: 'kite', color: '#6EC6FF' },
];
