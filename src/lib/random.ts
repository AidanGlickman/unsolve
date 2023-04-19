// A quick and dirty pseudorandom number generator because js math.Random isn't seedable for god knows what reason

const MWC_CYCLE = 4096; // from paper
const MWC_MAX = 809430660; // from paper

class MWCRandom {
    protected prev: number;
    constructor(seed: number = Math.random()){
        this.prev = seed;
    }

    public random(){
        let x: number = this.prev;
        return (1791398085 * x + 1929682203) % Math.pow(2, 32) / Math.pow(2, 32);
    }
}

export default MWCRandom;
