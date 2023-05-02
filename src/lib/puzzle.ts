import { init } from 'z3-solver/build/browser';
import { Solver, Context, AstVector, AstMap, Ast, Bool, Arith, Model } from 'z3-solver';
import MWCRandom from './random';

export type uniquenessResult = {
    unique: boolean,
    counterExample: Model<"main"> | null
}
abstract class Puzzle {
    // Puzzle is the base class for all types of puzzles. It contains the 
    // Z3 solver common methods
    protected random: MWCRandom;
    protected Z3: Context | null;
    protected solver: Solver | null;
    protected assertionsMap: AstMap<"main", Arith, Arith> | null;
    protected removedAssertions: [Arith, Arith][] = [];
    protected originalSolutionRestriction: Bool | null;

    constructor(seed: number) {
        this.random = new MWCRandom(seed);
        this.Z3 = null;
        this.solver = null;
        this.assertionsMap = null;
        this.originalSolutionRestriction = null;
    }

    public async init() {
        // init the Z3 solver
        let { Context, em } = await init();
        this.Z3 = Context("main");
        this.solver = new this.Z3.Solver();
        this.assertionsMap = new this.Z3.AstMap<Arith, Arith>();
    }

    public createOriginalSolutionRestriction(): void {
        // create a boolean restriction representing the original solution
        // This is used to check if the puzzle is unique
        // THIS MUST BE RUN AFTER addAssertions but BEFORE any assertions are removed

        if (this.Z3 === null || this.assertionsMap === null) {
            throw new Error("Solver not initialized");
        }

        let assertions = this.getAssertionVector();
        let orig = this.Z3.Bool.val(true);
        for (let assertion of assertions) {
            orig = orig.and(assertion);
        }
        this.originalSolutionRestriction = orig.not();
    }

    public getAssertionVector(): AstVector<"main", Bool> {
        // getAssertionVector returns the assertions vector as a AstVector
        if (this.Z3 === null || this.assertionsMap === null) {
            throw new Error("Solver not initialized");
        }

        let assertions = new this.Z3.AstVector<Bool>();
        for (let key of this.assertionsMap.keys()) {
            let value = this.assertionsMap.get(key);
            if (value === undefined || value === null) {
                throw new Error("Assertion value is null");
            }
            assertions.push(key.eq(value));
        }
        return assertions;

    }

    abstract addConstraints(): void;
    // addConstraints is the method that adds the constraints to the solver
    // These are the fixed constraints of a puzzle. Partial solutions (things that we can undo)
    // are added in the addAssertions method

    abstract addAssertions(): void;
    // addAssertions is where we add puzzle conditions, think actual filled numbers in a
    // sudoku puzzle. Seed is used to generate the puzzle

    abstract removeAssertion(val: any): void;
    // removeAssertion removes an assertion from the solver

    abstract undo(): void;
    // undo undoes the last removal



    public async checkUniqueness(): Promise<uniquenessResult> {
        // checkUniqueness checks if the puzzle is unique. This is done by adding a new constraint
        // that the puzzle is not equal to the current solution and then checking if the solver
        // is satisfiable. If it is, then the puzzle is not unique
        if (this.solver === null || this.Z3 === null || this.assertionsMap === null || this.originalSolutionRestriction === null) {
            throw new Error("Solver not initialized");
        }
        let assertions = this.getAssertionVector();
        // add the new constraint to the assertion array
        assertions.push(this.originalSolutionRestriction);
        // check if the solver is satisfiable
        let newSolution = await this.solver.check(assertions);
        if (newSolution === "sat") {
            return { unique: false, counterExample: this.solver.model() };
        }
        return { unique: true, counterExample: null };
    }


}

export default Puzzle;
