import Phaser from 'phaser';

// Weapon.js
export default class Weapon extends Phaser.GameObjects.GameObject {
  constructor(scene, speed) {
    super(scene, 'Weapon');
    this.scene = scene;
    this.speed = speed;
    this.projectiles = [];
  }

  fire(player, target) {
    // Создание снаряда в позиции игрока
    //let projectile = this.scene.add.circle(player.x, player.y, 5, 0xffffff); // Радиус и цвет снаряда
    //projectile.target = target;
    //projectile.speed = this.speed;
    //this.projectiles.push(projectile);
  }

  update(delta) {
    
  }
}
