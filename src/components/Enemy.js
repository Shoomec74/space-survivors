import Phaser from 'phaser';

//Enemy,js
export default class Enemy extends Phaser.GameObjects.GameObject {
  constructor(scene, enemy, speed) {
    super(scene, 'Enemy');
    this.enemy = enemy;
    this.speed = speed;
  }

  moveToPlayer(delta, player) {
    let angle = Phaser.Math.Angle.Between(
      this.enemy.x,
      this.enemy.y,
      player.x,
      player.y
    );
    this.enemy.x += Math.cos(angle) * this.speed * delta / 1000;
    this.enemy.y += Math.sin(angle) * this.speed * delta / 1000;
  }
}
