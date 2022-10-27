class PeakRecognizer {
  constructor(height, distance, sampleTime) {
    this.height = height;
    this.distance = distance;
    this.sampleTime = sampleTime;

    this.lastPointFromPreviousBatch = null;
    this.lastRecognizedTimestamp = -distance;
  }

  recognize(points) {
    if (this.lastPointFromPreviousBatch) {
      // eslint-disable-next-line no-param-reassign
      points = [this.lastPointFromPreviousBatch, ...points];
    }

    const strength = ({ x, y, z }) => Math.sqrt(x * x + y * y + z * z);
    const strengthPoints = points.map((point) => ({ strength: strength(point), timestamp: point.timestamp }));

    const punches = [];

    // eslint-disable-next-line no-plusplus
    for (let i = 1; i < strengthPoints.length - 1; i++) {
      const isPeak = strengthPoints[i].strength > strengthPoints[i - 1].strength && strengthPoints[i].strength > strengthPoints[i + 1].strength;
      const highEnough = strengthPoints[i].strength >= this.height;
      const farEnough = strengthPoints[i].timestamp - this.lastRecognizedTimestamp >= this.distance;

      console.log(strengthPoints[i], ` ${isPeak} ${highEnough} ${farEnough}`);

      if (isPeak && highEnough && farEnough) {
        this.lastRecognizedTimestamp = strengthPoints[i].timestamp;
        strengthPoints[i].timestamp /= 1000;
        punches.push(strengthPoints[i]);

        console.log(`Recognized: ${this.lastRecognizedTimestamp / this.sampleTime}`);
      }
    }

    this.lastPointFromPreviousBatch = points[points.length - 1];
    return punches;
  }
}

export default PeakRecognizer;
