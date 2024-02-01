import Phaser from 'phaser';

// StraightShooter.js
export default class StraightShooter extends Phaser.GameObjects.GameObject {
  constructor(scene, speed) {
    super(scene, 'StraightShooter');
    this.speed = speed;
    this.projectiles = [];
  }

  fire(player, projectileSprite,pl) {
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
      velocity.x = this.speed * pl.directionX;
      velocity.y = this.speed * pl.directionY;
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
  
      // Получаем границы камеры
      const camera = this.scene.cameras.main;
      const cameraView = camera.worldView; // worldView возвращает прямоугольник, представляющий видимую область камеры
  
      // Проверяем, находится ли снаряд за пределами видимой области камеры
      if (
        projectile.x < cameraView.x ||
        projectile.x > cameraView.x + cameraView.width ||
        projectile.y < cameraView.y ||
        projectile.y > cameraView.y + cameraView.height
      ) {
        projectile.destroy(); // Уничтожаем снаряд
        this.projectiles.splice(index, 1); // Удаляем снаряд из массива
      }
    });
  }
}
