import Phaser from 'phaser';

//Enemy,js
export default class Enemy extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, texture, speed, health, scaleX, scaleY) {
    super(scene, x, y, texture); // Используйте Sprite в качестве базового класса
    scene.add.existing(this); // Добавление этого объекта в сцену
    scene.physics.world.enable(this); // Включение физики для этого объекта
    this.setScale(scaleX, scaleY);
    this.speed = speed; // Скорость врага
    this.health = health; // Здоровье врага
  }

  moveToPlayer(delta, player) {
    let angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
    this.x += (Math.cos(angle) * this.speed * delta) / 1000;
    this.y += (Math.sin(angle) * this.speed * delta) / 1000;
  }

  takeDamage() {
    this.health--;
    if (this.health <= 0) {
      this.destroy(); // Уничтожение объекта врага
    }
  }
}
