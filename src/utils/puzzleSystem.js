// Puzzle System - Pluggable interface for locked content
// Provides a standardized way to create and manage puzzles

/**
 * Base Puzzle Interface
 * All puzzle types should extend this class
 */
export class BasePuzzle {
  constructor(puzzleData) {
    this.id = puzzleData.id;
    this.type = puzzleData.type;
    this.question = puzzleData.question;
    this.answer = puzzleData.answer;
    this.hints = puzzleData.hints || [];
    this.difficulty = puzzleData.difficulty || 'medium';
    this.attempts = 0;
    this.maxAttempts = 3;
    this.solved = false;
  }

  /**
   * Validate a user's answer
   * @param {string} userAnswer - The user's submitted answer
   * @returns {boolean} - Whether the answer is correct
   */
  validateAnswer(userAnswer) {
    throw new Error('validateAnswer must be implemented by puzzle subclass');
  }

  /**
   * Get the current hint based on attempts
   * @returns {string|null} - Current hint or null if no hints available
   */
  getCurrentHint() {
    if (this.hints.length === 0) return null;
    const hintIndex = Math.min(this.attempts, this.hints.length - 1);
    return this.hints[hintIndex];
  }

  /**
   * Check if puzzle can accept more attempts
   * @returns {boolean} - Whether more attempts are allowed
   */
  canAttempt() {
    return this.attempts < this.maxAttempts && !this.solved;
  }

  /**
   * Record an attempt
   * @param {string} userAnswer - The user's answer
   * @returns {PuzzleResult} - Result of the attempt
   */
  attempt(userAnswer) {
    if (!this.canAttempt()) {
      return {
        success: false,
        solved: false,
        message: 'No more attempts allowed',
        hint: null,
        attemptsRemaining: 0
      };
    }

    this.attempts++;
    const isCorrect = this.validateAnswer(userAnswer);
    
    if (isCorrect) {
      this.solved = true;
      return {
        success: true,
        solved: true,
        message: 'Puzzle solved! Content unlocked.',
        hint: null,
        attemptsRemaining: this.maxAttempts - this.attempts
      };
    }

    const attemptsRemaining = this.maxAttempts - this.attempts;
    const hint = attemptsRemaining > 0 ? this.getCurrentHint() : null;
    
    return {
      success: false,
      solved: false,
      message: attemptsRemaining > 0 ? 
        `Incorrect. ${attemptsRemaining} attempts remaining.` : 
        'No more attempts remaining. Puzzle failed.',
      hint: hint,
      attemptsRemaining: attemptsRemaining
    };
  }

  /**
   * Reset puzzle state
   */
  reset() {
    this.attempts = 0;
    this.solved = false;
  }

  /**
   * Get puzzle state for persistence
   * @returns {Object} - Serializable puzzle state
   */
  getState() {
    return {
      id: this.id,
      attempts: this.attempts,
      solved: this.solved
    };
  }

  /**
   * Restore puzzle state from persistence
   * @param {Object} state - Previously saved state
   */
  setState(state) {
    this.attempts = state.attempts || 0;
    this.solved = state.solved || false;
  }
}

/**
 * Riddle Puzzle Implementation
 * For text-based riddles with string answers
 */
export class RiddlePuzzle extends BasePuzzle {
  constructor(puzzleData) {
    super(puzzleData);
  }

  validateAnswer(userAnswer) {
    if (!userAnswer || typeof userAnswer !== 'string') {
      return false;
    }

    const normalizedUserAnswer = userAnswer.toLowerCase().trim();
    const normalizedCorrectAnswer = this.answer.toLowerCase().trim();
    
    return normalizedUserAnswer === normalizedCorrectAnswer;
  }
}

/**
 * Math Puzzle Implementation
 * For mathematical problems with numeric answers
 */
export class MathPuzzle extends BasePuzzle {
  constructor(puzzleData) {
    super(puzzleData);
    this.tolerance = puzzleData.tolerance || 0; // For floating point comparisons
  }

  validateAnswer(userAnswer) {
    const userNum = parseFloat(userAnswer);
    const correctNum = parseFloat(this.answer);
    
    if (isNaN(userNum) || isNaN(correctNum)) {
      return false;
    }

    return Math.abs(userNum - correctNum) <= this.tolerance;
  }
}

/**
 * Multiple Choice Puzzle Implementation
 * For puzzles with predefined answer choices
 */
export class MultipleChoicePuzzle extends BasePuzzle {
  constructor(puzzleData) {
    super(puzzleData);
    this.choices = puzzleData.choices || [];
  }

  validateAnswer(userAnswer) {
    if (!userAnswer) return false;
    
    // Support both index-based and text-based answers
    if (typeof userAnswer === 'number') {
      return userAnswer === parseInt(this.answer);
    }
    
    const normalizedUserAnswer = userAnswer.toLowerCase().trim();
    const normalizedCorrectAnswer = this.answer.toLowerCase().trim();
    
    return normalizedUserAnswer === normalizedCorrectAnswer;
  }
}

/**
 * Puzzle Factory
 * Creates appropriate puzzle instances based on type
 */
export class PuzzleFactory {
  static createPuzzle(puzzleData) {
    switch (puzzleData.type) {
      case 'riddle':
        return new RiddlePuzzle(puzzleData);
      case 'math':
        return new MathPuzzle(puzzleData);
      case 'multiple_choice':
        return new MultipleChoicePuzzle(puzzleData);
      default:
        console.warn(`Unknown puzzle type: ${puzzleData.type}. Falling back to riddle.`);
        return new RiddlePuzzle(puzzleData);
    }
  }

  static getSupportedTypes() {
    return ['riddle', 'math', 'multiple_choice'];
  }
}

/**
 * Puzzle Manager
 * Manages puzzle instances and state persistence
 */
export class PuzzleManager {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.puzzles = new Map();
    this.completionCallbacks = new Map();
  }

  /**
   * Register a puzzle
   * @param {Object} puzzleData - Puzzle configuration
   * @param {Function} onComplete - Callback when puzzle is solved
   */
  registerPuzzle(puzzleData, onComplete = null) {
    const puzzle = PuzzleFactory.createPuzzle(puzzleData);
    
    // Restore state if available
    const savedState = this.stateManager.getPuzzleState(puzzle.id);
    if (savedState) {
      puzzle.setState(savedState);
    }
    
    this.puzzles.set(puzzle.id, puzzle);
    
    if (onComplete) {
      this.completionCallbacks.set(puzzle.id, onComplete);
    }
    
    return puzzle;
  }

  /**
   * Get a puzzle by ID
   * @param {string} puzzleId - Puzzle identifier
   * @returns {BasePuzzle|null} - Puzzle instance or null
   */
  getPuzzle(puzzleId) {
    return this.puzzles.get(puzzleId) || null;
  }

  /**
   * Attempt to solve a puzzle
   * @param {string} puzzleId - Puzzle identifier
   * @param {string} userAnswer - User's answer
   * @returns {PuzzleResult} - Result of the attempt
   */
  attemptPuzzle(puzzleId, userAnswer) {
    const puzzle = this.getPuzzle(puzzleId);
    if (!puzzle) {
      return {
        success: false,
        solved: false,
        message: 'Puzzle not found',
        hint: null,
        attemptsRemaining: 0
      };
    }

    const result = puzzle.attempt(userAnswer);
    
    // Save state
    this.stateManager.savePuzzleState(puzzle.id, puzzle.getState());
    
    // Execute completion callback if solved
    if (result.solved) {
      const callback = this.completionCallbacks.get(puzzleId);
      if (callback) {
        callback(puzzle);
      }
    }
    
    return result;
  }

  /**
   * Check if a puzzle is solved
   * @param {string} puzzleId - Puzzle identifier
   * @returns {boolean} - Whether puzzle is solved
   */
  isPuzzleSolved(puzzleId) {
    const puzzle = this.getPuzzle(puzzleId);
    return puzzle ? puzzle.solved : false;
  }

  /**
   * Reset a puzzle
   * @param {string} puzzleId - Puzzle identifier
   */
  resetPuzzle(puzzleId) {
    const puzzle = this.getPuzzle(puzzleId);
    if (puzzle) {
      puzzle.reset();
      this.stateManager.savePuzzleState(puzzle.id, puzzle.getState());
    }
  }

  /**
   * Reset all puzzles
   */
  resetAllPuzzles() {
    this.puzzles.forEach(puzzle => {
      puzzle.reset();
      this.stateManager.savePuzzleState(puzzle.id, puzzle.getState());
    });
  }

  /**
   * Get all puzzle states for debugging
   * @returns {Object} - All puzzle states
   */
  getAllStates() {
    const states = {};
    this.puzzles.forEach((puzzle, id) => {
      states[id] = puzzle.getState();
    });
    return states;
  }
}

/**
 * Puzzle Result Type Definition
 * @typedef {Object} PuzzleResult
 * @property {boolean} success - Whether the attempt was successful
 * @property {boolean} solved - Whether the puzzle is now solved
 * @property {string} message - User-facing message about the result
 * @property {string|null} hint - Current hint or null
 * @property {number} attemptsRemaining - Number of attempts remaining
 */