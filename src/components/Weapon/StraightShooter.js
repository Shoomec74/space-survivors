import Phaser from 'phaser';

// StraightShooter.js
export default class StraightShooter extends Phaser.GameObjects.GameObject {
  constructor(scene, speed) {
    super(scene, 'StraightShooter');
    this.speed = speed;
    this.projectiles = [];
  }

  fire(player, projectileSprite) {
    let projectile = this.scene.physics.add.image(
      player.x,
      player.y,
      projectileSprite
    ).setScale(0.1, 0.1);
    let velocity = new Phaser.Math.Vector2(
      player.body.velocity.x,
      player.body.velocity.y
    );

    projectile.postFX.addBloom(0xffffff, 1, 1, 3, 1.2); // Эффект bloom

    if (velocity.length() === 0) {
      // Если игрок стоит на месте, стреляем в каком-то стандартном направлении, например, вверх
      velocity.y = -this.speed;
    } else {
      // Нормализация вектора скорости и умножение на скорость снаряда
      velocity.normalize().scale(this.speed);
    }

    // Сохраняем скорость в данных снаряда
    projectile.setData('velocity', velocity);
    this.projectiles.push(projectile);
    return projectile;
  }

  update(delta) {
    this.projectiles.forEach((projectile, index) => {
      let velocity = projectile.getData('velocity');
      if (!velocity) return;
      projectile.x += (velocity.x * delta) / 1000;
      projectile.y += (velocity.y * delta) / 1000;

      // Проверка на выход снаряда за пределы экрана
      if (
        projectile.x < 0 ||
        projectile.x > this.scene.sys.game.config.width ||
        projectile.y < 0 ||
        projectile.y > this.scene.sys.game.config.height
      ) {
        projectile.destroy(); // Уничтожаем снаряд
        this.projectiles.splice(index, 1); // Удаляем снаряд из массива
      }
    });
  }
}
