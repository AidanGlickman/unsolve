// A quick and dirty pseudorandom number generator because js math.Random isn't seedable for god knows what reason


class MWCRandom {
    protected prev: number;
    constructor(seed: number = Math.random()){
        this.prev = seed;
    }

    public seed(x: number){
        this.prev = x;
    }

    public random(){
        let x: number = this.prev;
        let out = (1791398085 * x + 1929682203) % Math.pow(2, 32) / Math.pow(2, 32);
        this.prev = out;
        return out;
    }
}

export default MWCRandom;
