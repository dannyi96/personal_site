// Puzzle Modal Component - UI for puzzle interactions
import { announceToScreenReader } from '../../utils/accessibility.js';

export default class PuzzleModal {
  constructor() {
    this.modal = null;
    this.currentPuzzle = null;
    this.onSolvedCallback = null;
    this.onCancelCallback = null;
    this.isVisible = false;
  }

  /**
   * Show puzzle modal
   * @param {Object} puzzleData - Puzzle data from content
   * @param {Function} onSolved - Callback when puzzle is solved
   * @param {Function} onCancel - Callback when puzzle is cancelled
   */
  show(puzzleData, onSolved = null, onCancel = null) {
    this.currentPuzzle = puzzleData;
    this.onSolvedCallback = onSolved;
    this.onCancelCallback = onCancel;
    
    this.createModal();
    this.isVisible = true;
    
    // Focus the input field
    const input = this.modal.querySelector('.puzzle-input');
    if (input) {
      setTimeout(() => input.focus(), 100);
    }
    
    // Announce to screen readers
    announceToScreenReader(`Puzzle modal opened: ${puzzleData.question}`);
  }

  /**
   * Hide puzzle modal
   */
  hide() {
    if (this.modal && this.modal.parentNode) {
      this.modal.parentNode.removeChild(this.modal);
    }
    this.modal = null;
    this.currentPuzzle = null;
    this.onSolvedCallback = null;
    this.onCancelCallback = null;
    this.isVisible = false;
    
    announceToScreenReader('Puzzle modal closed');
  }

  /**
   * Create the modal DOM structure
   */
  createModal() {
    // Remove existing modal if present
    if (this.modal) {
      this.hide();
    }

    this.modal = document.createElement('div');
    this.modal.className = 'puzzle-modal-overlay';
    this.modal.setAttribute('role', 'dialog');
    this.modal.setAttribute('aria-modal', 'true');
    this.modal.setAttribute('aria-labelledby', 'puzzle-title');
    this.modal.setAttribute('aria-describedby', 'puzzle-question');

    this.modal.innerHTML = `
      <div class="puzzle-modal-content">
        <div class="puzzle-header">
          <h2 id="puzzle-title" class="puzzle-title">Puzzle Required</h2>
          <button class="puzzle-close" aria-label="Close puzzle">×</button>
        </div>
        
        <div class="puzzle-body">
          <p id="puzzle-question" class="puzzle-question">${this.currentPuzzle.question}</p>
          
          <div class="puzzle-input-section">
            <label for="puzzle-answer" class="puzzle-label">Your Answer:</label>
            <input 
              type="text" 
              id="puzzle-answer" 
              class="puzzle-input"
              placeholder="Enter your answer..."
              autocomplete="off"
            />
          </div>
          
          <div class="puzzle-feedback" aria-live="polite" aria-atomic="true"></div>
          
          <div class="puzzle-hint" aria-live="polite"></div>
          
          <div class="puzzle-actions">
            <button class="puzzle-submit" type="button">Submit Answer</button>
            <button class="puzzle-hint-btn" type="button">Get Hint</button>
            <button class="puzzle-cancel" type="button">Cancel</button>
          </div>
          
          <div class="puzzle-info">
            <p class="puzzle-difficulty">Difficulty: ${this.currentPuzzle.difficulty}</p>
            <p class="puzzle-attempts">Attempts remaining: <span class="attempts-count">3</span></p>
          </div>
        </div>
      </div>
    `;

    // Add event listeners
    this.addEventListeners();
    
    // Add to DOM
    document.body.appendChild(this.modal);
    
    // Trap focus within modal
    this.trapFocus();
  }

  /**
   * Add event listeners to modal elements
   */
  addEventListeners() {
    const closeBtn = this.modal.querySelector('.puzzle-close');
    const submitBtn = this.modal.querySelector('.puzzle-submit');
    const hintBtn = this.modal.querySelector('.puzzle-hint-btn');
    const cancelBtn = this.modal.querySelector('.puzzle-cancel');
    const input = this.modal.querySelector('.puzzle-input');

    // Close button
    closeBtn.addEventListener('click', () => this.handleCancel());

    // Submit button
    submitBtn.addEventListener('click', () => this.handleSubmit());

    // Hint button
    hintBtn.addEventListener('click', () => this.showHint());

    // Cancel button
    cancelBtn.addEventListener('click', () => this.handleCancel());

    // Input field - submit on Enter
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.handleSubmit();
      }
    });

    // Escape key to close
    this.modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        this.handleCancel();
      }
    });

    // Click outside to close
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.handleCancel();
      }
    });
  }

  /**
   * Handle puzzle submission
   */
  handleSubmit() {
    const input = this.modal.querySelector('.puzzle-input');
    const answer = input.value.trim();
    
    if (!answer) {
      this.showFeedback('Please enter an answer', 'error');
      return;
    }

    // Emit puzzle attempt event
    const attemptEvent = new CustomEvent('puzzleAttempt', {
      detail: {
        puzzleId: this.currentPuzzle.id,
        answer: answer,
        callback: (result) => this.handleAttemptResult(result)
      }
    });
    document.dispatchEvent(attemptEvent);
  }

  /**
   * Handle puzzle attempt result
   * @param {Object} result - Result from puzzle system
   */
  handleAttemptResult(result) {
    const input = this.modal.querySelector('.puzzle-input');
    const attemptsSpan = this.modal.querySelector('.attempts-count');
    
    // Update attempts remaining
    attemptsSpan.textContent = result.attemptsRemaining;
    
    if (result.solved) {
      this.showFeedback(result.message, 'success');
      announceToScreenReader('Puzzle solved successfully!');
      
      // Call success callback after a brief delay
      setTimeout(() => {
        if (this.onSolvedCallback) {
          this.onSolvedCallback();
        }
        this.hide();
      }, 1500);
      
    } else {
      this.showFeedback(result.message, 'error');
      
      // Show hint if available
      if (result.hint) {
        this.showHint(result.hint);
      }
      
      // Clear input for next attempt
      input.value = '';
      input.focus();
      
      // If no attempts remaining, disable input
      if (result.attemptsRemaining === 0) {
        input.disabled = true;
        this.modal.querySelector('.puzzle-submit').disabled = true;
        this.modal.querySelector('.puzzle-hint-btn').disabled = true;
        
        announceToScreenReader('No more attempts remaining. Puzzle failed.');
      }
    }
  }

  /**
   * Show feedback message
   * @param {string} message - Message to display
   * @param {string} type - Type of message ('success', 'error', 'info')
   */
  showFeedback(message, type = 'info') {
    const feedback = this.modal.querySelector('.puzzle-feedback');
    feedback.textContent = message;
    feedback.className = `puzzle-feedback ${type}`;
    
    // Clear feedback after 5 seconds for non-success messages
    if (type !== 'success') {
      setTimeout(() => {
        if (feedback.textContent === message) {
          feedback.textContent = '';
          feedback.className = 'puzzle-feedback';
        }
      }, 5000);
    }
  }

  /**
   * Show hint
   * @param {string} hintText - Optional hint text to show
   */
  showHint(hintText = null) {
    const hintDiv = this.modal.querySelector('.puzzle-hint');
    
    if (hintText) {
      hintDiv.textContent = `Hint: ${hintText}`;
      hintDiv.style.display = 'block';
      announceToScreenReader(`Hint provided: ${hintText}`);
    } else if (this.currentPuzzle.hints && this.currentPuzzle.hints.length > 0) {
      // Show first available hint
      const hint = this.currentPuzzle.hints[0];
      hintDiv.textContent = `Hint: ${hint}`;
      hintDiv.style.display = 'block';
      announceToScreenReader(`Hint provided: ${hint}`);
    } else {
      this.showFeedback('No hints available for this puzzle', 'info');
    }
  }

  /**
   * Handle cancel action
   */
  handleCancel() {
    if (this.onCancelCallback) {
      this.onCancelCallback();
    }
    this.hide();
  }

  /**
   * Trap focus within the modal
   */
  trapFocus() {
    const focusableElements = this.modal.querySelectorAll(
      'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    this.modal.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    });
  }

  /**
   * Check if modal is currently visible
   * @returns {boolean} True if modal is visible
   */
  isOpen() {
    return this.isVisible;
  }

  /**
   * Update attempts remaining display
   * @param {number} remaining - Number of attempts remaining
   */
  updateAttemptsRemaining(remaining) {
    if (this.modal) {
      const attemptsSpan = this.modal.querySelector('.attempts-count');
      if (attemptsSpan) {
        attemptsSpan.textContent = remaining;
      }
    }
  }
}