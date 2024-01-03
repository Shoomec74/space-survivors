import Phaser from 'phaser';

//Player.js
export default class Player extends Phaser.GameObjects.GameObject {
  constructor(scene, player, data) {
    super(scene, 'Player');
    this.player = player;
    this.x = this.player.x;
    this.y = this.player.y;
    this.speed = data.speed || 200;
    this.weapons = []; // Массив оружия
    this.level = 1; // Уровень игрока
    // Создаем клавиши управления
    this.cursors = scene.input.keyboard.createCursorKeys();
    // Инициализация и другие свойства...
    this.lastMoveDirection = new Phaser.Math.Vector2(0, -1); // Начальное направление вверх
  }

  addWeapon(weapon) {
    this.weapons.push(weapon);
  }

  levelUp() {
    this.level++;
    // Логика повышения уровня и выбора улучшений
  }

  move() {
    let velocityX = 0;
    let velocityY = 0;

    if (velocityX !== 0 || velocityY !== 0) {
      this.lastMoveDirection.set(velocityX, velocityY).normalize();
    }

    if (this.cursors.left.isDown) {
      velocityX = -300;
    } else if (this.cursors.right.isDown) {
      velocityX = 300;
    }

    if (this.cursors.up.isDown) {
      velocityY = -300;
    } else if (this.cursors.down.isDown) {
      velocityY = 300;
    }

    // Нормализация вектора скорости, если игрок движется по диагонали
    let velocity = new Phaser.Math.Vector2(velocityX, velocityY);
    if (velocity.length() > 0) {
      velocity.normalize().scale(300); // 300 - желаемая скорость
    }

    this.player.setVelocity(velocity.x, velocity.y);
  }
}
