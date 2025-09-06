import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
import { Game as MainGame } from './scenes/Game';
import { MainMenu } from './scenes/MainMenu';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';
import { GAME_DIMENSIONS } from './GameConfig';

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
export

  const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: GAME_DIMENSIONS.width,
    height: GAME_DIMENSIONS.height,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scene: [
      Boot,
      Preloader,
      MainMenu,
      MainGame,
      GameOver
    ],
    scale: {
      mode: Phaser.Scale.NONE,
      autoCenter: Phaser.Scale.NO_CENTER
    }
  };

const StartGame = (parent: string) => {
  const game = new Game({ ...config, parent });
  game.scale.resize(window.innerWidth, window.innerHeight);
  window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
  });

  return game;

}

export default StartGame;
