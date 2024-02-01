import Phaser from 'phaser';
import Player from './components/Player';
import Enemy from './components/Enemy';
import StraightShooter from './components/Weapon/StraightShooter';

//Game.js
export default class Game extends Phaser.Scene {
  constructor() {
    super('game');
    // Инициализация свойств класса
    this.player; // Объект игрока
    this.weapon; // Оружие игрока
    this.enemies = []; // Массив для хранения врагов
    this.collisionsCount = 0; // Счетчик столкновений с врагами
    this.timeProjectile; // Таймер для стрельбы
    this.timeSpawnEnemy; // Таймер для создания врагов
  }

  preload() {
    // Здесь можно загрузить ресурсы, если они нужны
    this.load.image('player', 'sprites/ship.png');
    this.load.image('enemy', 'sprites/asteroid.png');
    this.load.image('projectile', 'sprites/fireball.png');
    this.load.image('star', 'images/star.png');
    this.load.spritesheet('enemy_explosion', 'sprites/enemy_explosion.png', {
      frameWidth: 100,
      frameHeight: 100,
    });
    this.load.spritesheet('player_explosion', 'sprites/player_explosion.png', {
      frameWidth: 100,
      frameHeight: 100,
    });
  }

  create() {
    // Создание анимации взрыва врага
    this.anims.create({
      key: 'enemy_explosion', // Уникальный ключ для анимации
      frames: this.anims.generateFrameNumbers('enemy_explosion', {
        start: 0,
        end: 70,
      }), // Пример: если у вас 6 кадров в спрайт-листе
      frameRate: 120, // Скорость анимации
      repeat: 0, // Анимация не повторяется
    });
    // Создание анимации взрыва игрока
    this.anims.create({
      key: 'player_explosion', // Уникальный ключ для анимации
      frames: this.anims.generateFrameNumbers('player_explosion', {
        start: 0,
        end: 63,
      }), // Пример: если у вас 6 кадров в спрайт-листе
      frameRate: 90, // Скорость анимации
      repeat: 0, // Анимация не повторяется
    });
    // создаем ишрока на сцене
    const initialPlayer = this.physics.add
      .image(400, 300, 'player')
      .setScale(0.5, 0.5)
      .setCollideWorldBounds(false);
    // Создание и настройка оружия игрока
    this.weapon = new StraightShooter(this, 600);
    // параметры игрока
    const data = { speed: 200, health: 3 };
    // Создание и настройка игрока
    this.player = new Player(this, initialPlayer, data);
    // добавляем игроку оружие
    this.player.addWeapon(this.weapon);

    // Создаем клавиши управления
    this.cursors = this.input.keyboard.createCursorKeys();
    //таймер создания врагов в разных местах экрана
    this.timeSpawnEnemy = this.time.addEvent({
      delay: Phaser.Math.Between(1000, 2000),
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true,
    });

    this.getCoordText();
    // Создание таймера для автоматической стрельбы снарядами
    this.timeProjectile = this.time.addEvent({
      delay: 1000, // Задержка в миллисекундах (1000 мс = 1 секунда) между созданиями снарядов
      callback: () => {
        // Цикл по всем оружиям у игрока
        this.player.weapons.forEach((weapon) => {
          // Выстрел оружием, создание снаряда и сохранение его в переменную 'project'
          const project = weapon.fire(
            this.player.player,
            'projectile',
            this.player
          );

          // Цикл по всем врагам на сцене
          this.enemies.forEach((enemy) => {
            // Добавление обработчика столкновений между снарядом и врагом
            // При столкновении будет вызываться метод projectileEnemyCollision
            this.physics.add.overlap(
              project,
              enemy,
              this.projectileEnemyCollision,
              null,
              this
            );
          });
        });
      },
      loop: true, // Указание на то, что таймер должен выполняться повторно (зациклен)
    });

    // Создание эмиттера частиц
    this.starfieldEmitter = this.add
      .particles(1, 1, 'star', {
        x: { min: 0, max: this.cameras.main.width },
        y: { min: 0, max: this.cameras.main.height },
        lifespan: 100,
        speedX: -1000, // Начальная скорость частиц
        scale: { start: 0.03, end: 0 },
        quantity: 2,
        blendMode: 'ADD',
      })
      .setDepth(-1);

    this.cameras.main.startFollow(this.player.player);
  }

  projectileEnemyCollision(projectile, enemy) {
    projectile.destroy();
    enemy.takeDamage(); // Вызов метода takeDamage объекта Enemy

    // Создание анимации взрыва на месте врага
    const explosion = this.add.sprite(enemy.x, enemy.y, 'enemy_explosion');
    explosion.play('enemy_explosion');

    // Удаление спрайта взрыва после завершения анимации
    explosion.on('animationcomplete', () => {
      explosion.destroy();
    });
  }
  // Обновление логики игры в каждом кадре
  // Управление движением игрока, обновление врагов и оружия
  // Удаление неактивных снарядов и врагов, обновление системы частиц
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

    // Обновление положения эмиттера частиц, чтобы он следовал за камерой
    this.starfieldEmitter.setPosition(
      this.cameras.main.scrollX,
      this.cameras.main.scrollY
    );
  }

  // Функция для создания врагов в случайных местах сцены
  spawnEnemy() {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;

    // Генерируем случайные координаты X и Y
    let x, y;
    const side = Phaser.Math.Between(0, 3);

    if (side === 0) {
      // Точка респауна с верхней стороны камеры
      x = Phaser.Math.Between(
        this.cameras.main.scrollX,
        this.cameras.main.scrollX + screenWidth
      );
      y = this.cameras.main.scrollY - 20;
    } else if (side === 1) {
      // Точка респауна с нижней стороны камеры
      x = Phaser.Math.Between(
        this.cameras.main.scrollX,
        this.cameras.main.scrollX + screenWidth
      );
      y = this.cameras.main.scrollY + screenHeight + 20;
    } else if (side === 2) {
      // Точка респауна с правой стороны камеры
      x = this.cameras.main.scrollX + screenWidth + 20;
      y = Phaser.Math.Between(
        this.cameras.main.scrollY,
        this.cameras.main.scrollY + screenHeight
      );
    } else {
      // Точка респауна с левой стороны камеры
      x = this.cameras.main.scrollX - 20;
      y = Phaser.Math.Between(
        this.cameras.main.scrollY,
        this.cameras.main.scrollY + screenHeight
      );
    }

    // Создаем врага с заданными параметрами
    let enemy = new Enemy(
      this,
      x,
      y,
      'enemy', // Текстура
      Phaser.Math.Between(100, 150), // Скорость
      1, // Здоровье
      0.3,
      0.3
    );

    // Обработка столкновений, если необходимо
    this.physics.add.overlap(
      this.player.player,
      enemy,
      this.collisionAsteroid,
      null,
      this
    );

    // Добавляем врага в массив врагов
    this.enemies.push(enemy);
  }

  // Функция для отображения координат курсора на экране
  getCoordText() {
    const coordText = this.add.text(10, 10, `x:0, y:0`).setScrollFactor(0);
    this.input.on('pointermove', function (pointer) {
      coordText.setText(`x:${this.cameras.main.x}, y:${this.cameras.main.y}`);
    });
  }

  // Функция обработки столкновения игрока с астероидом
  // Уничтожение врага и увеличение счетчика столкновений
  // Проверка на количество столкновений для окончания игры
  collisionAsteroid(player, enemy) {
    enemy.destroy();
    // Создание анимации взрыва на месте врага
    const explosion = this.add.sprite(enemy.x, enemy.y, 'enemy_explosion');
    explosion.play('enemy_explosion');

    // Удаление спрайта взрыва после завершения анимации
    explosion.on('animationcomplete', () => {
      explosion.destroy();
    });
    player.setTint(0xff0000);
    setTimeout(() => player.clearTint(), 100);
    this.collisionsCount++;

    if (this.collisionsCount >= 3) {
      // Создание анимации взрыва на месте врага
      const explosion = this.add
        .sprite(player.x, player.y, 'player_explosion')
        .setScale(3, 3);
      explosion.play('player_explosion');

      // Удаление спрайта взрыва после завершения анимации
      explosion.on('animationcomplete', () => {
        explosion.destroy();
      });
      // Показать диалоговое окно проигрыша
      this.showGameOverDialog();
    }
  }

  // Функция для отображения диалогового окна конца игры
  // Остановка игры и возвращение в главное меню
  showGameOverDialog() {
    // Создаем и отображаем диалоговое окно
    const dialog = this.add
      .text(300, 400, 'Вы проиграли! Нажмите OK для возврата в главное меню', {
        fontSize: '16px',
        color: '#fff',
      })
      .setScrollFactor(0);
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
