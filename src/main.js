import Phaser from 'phaser';

import Menu from './Menu';
import Game from './Game';

const config = {
  type: Phaser.AUTO,
  parent: 'app',
  width: 1024,
  height: 768,
  physics: {
    default: 'arcade',
    arcade: {
      debug:true
    },
  },
  scene: [Menu,Game],
};

export default new Phaser.Game(config);
