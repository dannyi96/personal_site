// Main application entry point
import Room from './components/Room/index.js';
import { StateManager } from './utils/stateManager.js';
import { AccessibilityUtils } from './utils/accessibility.js';
import { PuzzleManager } from './utils/puzzleSystem.js';
import PuzzleModal from './components/PuzzleModal/index.js';

class App {
  constructor() {
    this.stateManager = new StateManager();
    this.accessibilityUtils = new AccessibilityUtils();
    this.puzzleManager = new PuzzleManager(this.stateManager);
    this.puzzleModal = new PuzzleModal();
    this.room = null;
    this.currentMode = this.stateManager.getMode() || 'interactive';
    
    this.init();
  }
  
  async init() {
    try {
      // Initialize hash-based routing
      this.setupRouting();
      
      // Initialize the room
      await this.initializeRoom();
      
      // Setup mode toggle
      this.setupModeToggle();
      
      // Setup accessibility features
      this.setupAccessibility();
      
      // Listen for mode changes from room component
      document.addEventListener('modeChange', this.handleModeChange.bind(this));
      
      // Setup puzzle system event listeners
      this.setupPuzzleSystem();
      
      // Hide loading screen after everything is initialized
      this.hideLoadingScreen();
      
    } catch (error) {
      console.error('Failed to initialize application:', error);
      this.hideLoadingScreen(); // Hide loading screen even on error
    }
  }
  
  hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      // Add fade-out class for smooth transition
      loadingScreen.classList.add('fade-out');
      
      // Remove the loading screen from DOM after transition
      setTimeout(() => {
        if (loadingScreen.parentNode) {
          loadingScreen.parentNode.removeChild(loadingScreen);
        }
      }, 500); // Match the CSS transition duration
    }
  }
  
  setupRouting() {
    // Hash-based routing for GitHub Pages compatibility
    window.addEventListener('hashchange', this.handleRouteChange.bind(this));
    
    // Handle initial route
    this.handleRouteChange();
  }
  
  handleRouteChange() {
    const hash = window.location.hash.slice(1) || 'room';
    
    switch (hash) {
      case 'room':
      case '':
        this.showRoom();
        break;
      case 'recruiter':
        this.showRecruiterMode();
        break;
      default:
        // Default to room view
        window.location.hash = '#room';
    }
  }
  
  async initializeRoom() {
    try {
      this.room = new Room();
      
      // Set initial mode based on stored preference or hash
      const hash = window.location.hash.slice(1);
      if (hash === 'recruiter') {
        this.currentMode = 'recruiter';
      }
      
      this.room.setMode(this.currentMode);
      this.updateToggleButton();
      
      console.log('Room initialized successfully');
    } catch (error) {
      console.error('Failed to initialize room:', error);
    }
  }
  
  setupModeToggle() {
    const toggleButton = document.getElementById('mode-toggle');
    if (toggleButton) {
      toggleButton.addEventListener('click', this.toggleMode.bind(this));
      
      // Add keyboard support
      toggleButton.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          this.toggleMode();
        }
      });
      
      // Update initial button state
      this.updateToggleButton();
    }
  }
  
  toggleMode() {
    if (!this.room) return;
    
    // Toggle the mode
    this.room.toggleMode();
    this.currentMode = this.room.getCurrentMode();
    
    // Update URL hash
    window.location.hash = this.currentMode === 'recruiter' ? '#recruiter' : '#room';
    
    // Update button
    this.updateToggleButton();
  }
  
  showRoom() {
    if (!this.room) return;
    
    this.currentMode = 'interactive';
    this.room.setMode('interactive');
    this.updateToggleButton();
  }
  
  showRecruiterMode() {
    if (!this.room) return;
    
    this.currentMode = 'recruiter';
    this.room.setMode('recruiter');
    this.updateToggleButton();
  }
  
  handleModeChange(event) {
    const { mode } = event.detail;
    this.currentMode = mode;
    
    // Update URL hash without triggering hashchange event
    const newHash = mode === 'recruiter' ? '#recruiter' : '#room';
    if (window.location.hash !== newHash) {
      window.history.replaceState(null, null, newHash);
    }
    
    this.updateToggleButton();
  }
  
  updateToggleButton() {
    const toggleButton = document.getElementById('mode-toggle');
    if (!toggleButton) return;
    
    if (this.currentMode === 'recruiter') {
      toggleButton.textContent = 'Switch to Interactive Mode';
      toggleButton.setAttribute('aria-label', 'Switch to interactive room mode for spatial exploration');
      toggleButton.title = 'Switch to interactive room mode';
    } else {
      toggleButton.textContent = 'Switch to Recruiter Mode';
      toggleButton.setAttribute('aria-label', 'Switch to recruiter mode for linear content access');
      toggleButton.title = 'Switch to recruiter mode for direct access to all professional content';
    }
  }
  
  setupAccessibility() {
    // Add global keyboard shortcuts
    document.addEventListener('keydown', (event) => {
      // Ctrl/Cmd + M to toggle mode
      if ((event.ctrlKey || event.metaKey) && event.key === 'm') {
        event.preventDefault();
        this.toggleMode();
      }
      
      // Escape key to close any open modals (handled by room)
      if (event.key === 'Escape') {
        // Let the room component handle this
      }
    });
    
    // Ensure announcements element exists
    if (!document.getElementById('announcements')) {
      const announcements = document.createElement('div');
      announcements.id = 'announcements';
      announcements.setAttribute('aria-live', 'polite');
      announcements.setAttribute('aria-atomic', 'true');
      announcements.className = 'sr-only';
      document.body.appendChild(announcements);
    }
  }
  
  setupPuzzleSystem() {
    // Listen for puzzle required events
    document.addEventListener('puzzleRequired', this.handlePuzzleRequired.bind(this));
    
    // Listen for puzzle attempt events
    document.addEventListener('puzzleAttempt', this.handlePuzzleAttempt.bind(this));
  }
  
  handlePuzzleRequired(event) {
    const { objectId, puzzle, onSolved } = event.detail;
    
    // Register the puzzle if not already registered
    if (!this.puzzleManager.getPuzzle(puzzle.id)) {
      this.puzzleManager.registerPuzzle(puzzle, onSolved);
    }
    
    // Show the puzzle modal
    this.puzzleModal.show(
      puzzle,
      onSolved,
      () => {
        // Cancel callback - just close modal
        console.log('Puzzle cancelled by user');
      }
    );
  }
  
  handlePuzzleAttempt(event) {
    const { puzzleId, answer, callback } = event.detail;
    
    // Attempt to solve the puzzle
    const result = this.puzzleManager.attemptPuzzle(puzzleId, answer);
    
    // Call the callback with the result
    if (callback) {
      callback(result);
    }
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  
  // Fallback: Hide loading screen after 10 seconds if something goes wrong
  setTimeout(() => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen && !loadingScreen.classList.contains('fade-out')) {
      console.warn('Loading screen timeout - hiding loading screen');
      loadingScreen.classList.add('fade-out');
      setTimeout(() => {
        if (loadingScreen.parentNode) {
          loadingScreen.parentNode.removeChild(loadingScreen);
        }
      }, 500);
    }
  }, 10000);
});