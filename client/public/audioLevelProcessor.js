class AudioLevelProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.cycle = 0;
    this.fullValue = 0;
  }
  process(inputs, outputs, parameters) {
    this.cycle++;
    const sum = inputs[0].reduce((pred, item) => {
      const fItem = parseFloat(item);
      return pred + fItem * fItem;
    }, 0.0);
    this.fullValue += Math.sqrt(sum);
    if (this.cycle === 10) {
      this.port.postMessage({
        level: this.fullValue / this.cycle,
      });
      this.cycle = 0;
      this.fullValue = 0;
    }
    return true;
  }
}

registerProcessor('audio-level-processor', AudioLevelProcessor);
