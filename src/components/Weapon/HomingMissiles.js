import Weapon from './Weapon';

// HomingMissiles.js
export default class HomingMissiles extends Weapon {
  constructor(scene, speed) {
    super(scene, speed);
  }

  fire() {
    super.fire();
    // Логика самонаводящихся ракет
  }
}
