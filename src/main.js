import Phaser from 'phaser';

import Menu from './Menu';
import Game from './Game';

const config = {
  type: Phaser.WEBGL,
  parent: 'app',
  width: 1024,
  height: 768,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  scene: [Menu, Game],
};

export default new Phaser.Game(config);
