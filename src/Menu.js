import Phaser from 'phaser';

export default class Menu extends Phaser.Scene {
  constructor() {
    super('menu');
    this.musicBG;
  }

  preload() {
    this.load.image('menu_bg', 'images/menu_bg.png');
    this.load.audio('sound_bg', 'music/Space Survivers.mp3');
  }

  create() {
    this.musicBG = this.sound.add('sound_bg', { volume: 0.05, loop: true });
    this.musicBG.play();
    this.add.image(512, 384, 'menu_bg');

    this.add.rectangle(512, 690, 150, 40, 0x0000ff);
    // Создание кликабельного текста
    let startText = this.add
      .text(512, 690, 'Начать', { fontSize: '32px' })
      .setOrigin(0.5, 0.5) // Центрирование текста
      .setInteractive() // Сделать текст интерактивным
      .setDepth(2);

    this.add.rectangle(512, 740, 150, 40, 0x0000ff);
    // Кнопка "Выйти"
    let exitText = this.add
      .text(512, 740, 'Выйти', { fontSize: '32px' })
      .setOrigin(0.5, 0.5)
      .setInteractive()
      .setDepth(2);

    // Добавление обработчика события клика
    startText.on('pointerdown', () => {
      this.musicBG.stop();
      this.scene.start('game'); // Замените 'имя_следующей_сцены' на имя вашей следующей сцены
    });

    // Обработчик нажатия на "Выйти"
    exitText.on('pointerdown', () => {
      this.musicBG.stop();
      this.game.destroy(true); // Закрыть игру
    });
  }
}
