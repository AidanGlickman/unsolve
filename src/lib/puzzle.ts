import { init } from 'z3-solver/build/browser';
import { Solver, Context, AstVector, Bool } from 'z3-solver';
abstract class Puzzle {
    // Puzzle is the base class for all types of puzzles. It contains the 
    // Z3 solver common methods
    protected seed: number;
    protected Z3: Context | null;
    protected solver: Solver | null;
    protected assertions: AstVector<"main", Bool> | null;

    constructor(seed: number) {
        this.seed = seed;
        this.Z3 = null;
        this.solver = null;
        this.assertions = null;
    }

    public async init(){
        // init the Z3 solver
        let { Context, em } = await init();
        this.Z3 = Context("main");
        this.solver = new this.Z3.Solver();
        this.assertions = new this.Z3.AstVector<Bool>();
    }

    abstract addConstraints(): void;
    // addConstraints is the method that adds the constraints to the solver
    // These are the fixed constraints of a puzzle. Partial solutions (things that we can undo)
    // are added in the addAssertions method

    abstract addAssertions(): void;
    // addAssertions is where we add puzzle conditions, think actual filled numbers in a
    // sudoku puzzle. Seed is used to generate the puzzle

    public async checkUniqueness(): Promise<boolean> {
        // checkUniqueness checks if the puzzle is unique. This is done by adding a new constraint
        // that the puzzle is not equal to the current solution and then checking if the solver
        // is satisfiable. If it is, then the puzzle is not unique
        if (this.solver === null || this.Z3 === null) {
            throw new Error("Solver not initialized");
        }
        let assertions = this.assertions as AstVector<"main", Bool>;
        let solution = await this.solver.check(assertions);
        if(solution === "unsat" || solution === "unknown"){
            throw new Error("Solver returned unsat or unknown. This indicates that the puzzle definition is fundamentally broken, or a bad assertion was added at some point.");
        }
        let model = this.solver.model();
        // print the model for debugging
        console.log(model);
        // let newAssert = 
        return true;
    }


}

export default Puzzle;
