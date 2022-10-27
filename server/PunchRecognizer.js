export default class PunchRecognizer {
  constructor() {

  }

  recognize(measurement) {
    const { top, bottom, timestamp } = measurement;
    const acc = {
      x: bottom.x - top.x,
      y: bottom.y - top.y,
      z: bottom.z - top.z
    };

    if(Math.random() < 0.1) {
      return {
        strength: this.strength(acc),
        timestamp
      };
    }

    return null;
  }

  strength(acc) {
    const { x, y, z } = acc;
    return Math.sqrt(x*x + y*y + z*z);
  }
}