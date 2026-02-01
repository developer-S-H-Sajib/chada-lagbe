
export enum GameState {
  START = 'START',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER',
  PAYMENT = 'PAYMENT',
  RECEIPT = 'RECEIPT'
}

export interface PlayerData {
  name: string;
  photoUrl: string | null;
  score: number;
  chandaAmount?: number;
}
