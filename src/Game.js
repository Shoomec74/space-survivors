import Phaser from 'phaser';
import Player from './components/Player';
import Enemy from './components/Enemy';
import StraightShooter from './components/Weapon/StraightShooter';

//Game.js
export default class Game extends Phaser.Scene {
  constructor() {
    super('game');
    this.player;
    this.weapon;
    this.enemies = []; // Массив для врагов
    this.collisionsCount = 0; // Счетчик столкновений
    this.timeProjectile;
    this.timeSpawnEnemy;
  }

  preload() {
    // Здесь можно загрузить ресурсы, если они нужны
    this.load.image('player', 'sprites/ship.png');
    this.load.image('enemy', 'sprites/asteroid.png');
    this.load.image('projectile', 'sprites/shoot.png');
  }

  create() {
    const initialPlayer = this.physics.add
      .image(400, 300, 'player')
      .setScale(0.5, 0.5)
      .setCollideWorldBounds(true);

    this.weapon = new StraightShooter(this, 600);

    const data = { speed: 200 };

    this.player = new Player(this, initialPlayer, data);

    this.player.addWeapon(this.weapon);

    // Создаем клавиши управления
    this.cursors = this.input.keyboard.createCursorKeys();

    this.timeSpawnEnemy = this.time.addEvent({
      delay: Phaser.Math.Between(1000, 2000),
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true,
    });

    this.getCoordText();

    this.timeProjectile = this.time.addEvent({
      delay: 1000, // Стрелять каждую секунду
      callback: () => {
        this.player.weapons.forEach((weapon) => {
          const project = weapon.fire(this.player.player, 'projectile');
          this.enemies.forEach((enemy) => {
            this.physics.add.overlap(
              project,
              enemy.enemy,
              this.projectileEnemyCollision,
              null,
              this
            );
          });
        });
      },
      loop: true,
    });
  }

  projectileEnemyCollision(projectile, enemy) {
    projectile.destroy();
    enemy.destroy();
  }

  update(time, delta) {
    this.player.move();
    this.enemies.forEach((enemy) => {
      enemy.moveToPlayer(delta, this.player.player); // Используем объект player из класса Player
    });
    this.player.weapons.forEach((weapon) => weapon.update(delta, this.player));
    // Удаляем уничтоженные снаряды и врагов из их массивов
    this.weapon.projectiles = this.weapon.projectiles.filter(
      (projectile) => projectile.active
    );
    this.enemies = this.enemies.filter((enemy) => enemy.active);
  }

  spawnEnemy() {
    const enemySpawn = this.physics.add
      .image(
        Phaser.Math.Between(-50, +this.sys.game.config.width + 50),
        Phaser.Math.Between(-50, +this.sys.game.config.height + 50),
        'enemy'
      )
      .setScale(0.2, 0.2)
      .setCollideWorldBounds(false);

    // Создание и добавление врага в массив
    let enemy = new Enemy(this, enemySpawn, Phaser.Math.Between(100, 150));
    // Обработка столкновений
    this.physics.add.overlap(
      this.player.player,
      enemy.enemy,
      this.collisionAsteroid,
      null,
      this
    );

    this.enemies.push(enemy);
  }

  getCoordText() {
    const coordText = this.add.text(10, 10, `x:0, y:0`);
    this.input.on('pointermove', function (pointer) {
      coordText.setText(`x:${pointer.x}, y:${pointer.y}`);
    });
  }

  collisionAsteroid(player, enemy) {
    enemy.destroy();
    this.collisionsCount++;

    if (this.collisionsCount >= 3) {
      // Показать диалоговое окно проигрыша
      this.showGameOverDialog();
    }
  }

  showGameOverDialog() {
    // Создаем и отображаем диалоговое окно
    const dialog = this.add.text(
      400,
      300,
      'Вы проиграли! Нажмите OK для возврата в главное меню',
      { fontSize: '16px', color: '#fff' }
    );
    dialog.setOrigin(0.5, 0.5);

    // Обработка нажатия на диалоговое окно
    dialog.setInteractive();
    dialog.on('pointerdown', () => {
      // Вернуться в главное меню
      this.scene.start('menu'); // Замените 'MainMenuScene' на имя сцены главного меню
    });

    // Остановить игру (опционально)
    this.physics.pause();
    this.player.player.setVelocity(0, 0);
    this.player.player.disableBody(true, true);
    this.timeProjectile.destroy();
    this.timeSpawnEnemy.destroy();
    this.collisionsCount = 0;
    this.enemies.forEach((enemy) => {
      enemy.destroy();
    });
  }
}
