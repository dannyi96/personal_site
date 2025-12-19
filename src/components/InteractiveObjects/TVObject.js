// TV Object - Locked content with puzzle
import InteractiveObject from './index.js';

export default class TVObject extends InteractiveObject {
  constructor(objectData, contentData, interactionData, stateManager) {
    super(objectData, contentData, interactionData, stateManager);
    this.puzzleData = this.contentData.puzzles[objectData.puzzleRef];
  }
  
  handleLockedInteraction() {
    // Show puzzle instead of just announcing locked state
    this.showPuzzle();
  }
  
  showPuzzle() {
    if (!this.puzzleData) {
      console.warn('Puzzle data not found for TV object');
      super.handleLockedInteraction();
      return;
    }
    
    // Emit puzzle event
    const puzzleEvent = new CustomEvent('puzzleRequired', {
      detail: {
        objectId: this.objectData.id,
        objectData: this.objectData,
        puzzle: this.puzzleData,
        onSolved: () => this.onPuzzleSolved()
      }
    });
    document.dispatchEvent(puzzleEvent);
    
    // Announce puzzle to screen readers
    this.announceToScreenReader(`Puzzle required to unlock ${this.objectData.name}: ${this.puzzleData.question}`);
  }
  
  onPuzzleSolved() {
    // Unlock the TV content
    this.stateManager.unlockContent(this.objectData.id);
    this.updateState();
    
    // Now execute the normal interaction
    this.executeInteraction();
    
    // Announce success
    this.announceToScreenReader(`Puzzle solved! ${this.objectData.name} is now unlocked.`);
    
    // Add visual celebration effect
    this.addUnlockEffect();
  }
  
  executeInteraction() {
    // Only execute if unlocked
    if (this.isLocked && !this.stateManager.isContentUnlocked(this.objectData.id)) {
      this.handleLockedInteraction();
      return;
    }
    
    // Get entertainment content
    const entertainmentContent = this.contentData.content.personal.entertainment;
    
    if (!entertainmentContent) {
      console.warn('Entertainment content not found');
      return;
    }
    
    // Emit specialized event for TV interaction
    const tvEvent = new CustomEvent('tvInteraction', {
      detail: {
        objectId: this.objectData.id,
        objectData: this.objectData,
        content: entertainmentContent,
        shows: entertainmentContent.data.shows,
        movies: entertainmentContent.data.movies
      }
    });
    document.dispatchEvent(tvEvent);
    
    // Call parent method for standard interaction handling
    super.executeInteraction();
  }
  
  addUnlockEffect() {
    // Add special unlock animation
    this.element.classList.add('object-unlocked');
    
    // Create sparkle effect
    const sparkles = document.createElement('div');
    sparkles.className = 'unlock-sparkles';
    sparkles.innerHTML = '✨✨✨';
    this.element.appendChild(sparkles);
    
    setTimeout(() => {
      this.element.classList.remove('object-unlocked');
      if (sparkles.parentNode) {
        sparkles.parentNode.removeChild(sparkles);
      }
    }, 2000);
  }
  
  // Method to check puzzle answer
  checkPuzzleAnswer(answer) {
    if (!this.puzzleData) return false;
    
    const normalizedAnswer = answer.toLowerCase().trim();
    const correctAnswer = this.puzzleData.answer.toLowerCase().trim();
    
    return normalizedAnswer === correctAnswer;
  }
  
  // Method to get puzzle data
  getPuzzleData() {
    return this.puzzleData;
  }
  
  // Method to get entertainment content
  getEntertainmentContent() {
    return this.contentData.content.personal.entertainment;
  }
  
  // Method to get shows
  getShows() {
    const entertainment = this.getEntertainmentContent();
    return entertainment ? entertainment.data.shows : [];
  }
  
  // Method to get movies
  getMovies() {
    const entertainment = this.getEntertainmentContent();
    return entertainment ? entertainment.data.movies : [];
  }
}