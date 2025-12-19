// Main application entry point
import Room from './components/Room/index.js';
import { StateManager } from './utils/stateManager.js';
import { AccessibilityUtils } from './utils/accessibility.js';

class App {
  constructor() {
    this.stateManager = new StateManager();
    this.accessibilityUtils = new AccessibilityUtils();
    this.room = new Room();
    this.currentMode = 'interactive';
    
    this.init();
  }
  
  init() {
    // Initialize hash-based routing
    this.setupRouting();
    
    // Initialize the room
    this.initializeRoom();
    
    // Setup mode toggle
    this.setupModeToggle();
    
    // Setup accessibility features
    this.setupAccessibility();
  }
  
  setupRouting() {
    // Hash-based routing for GitHub Pages compatibility
    window.addEventListener('hashchange', this.handleRouteChange.bind(this));
    
    // Handle initial route
    this.handleRouteChange();
  }
  
  handleRouteChange() {
    const hash = window.location.hash.slice(1) || 'room';
    
    // Route handling will be expanded in later tasks
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
  
  initializeRoom() {
    // Room initialization will be implemented in later tasks
    console.log('Room initialized');
  }
  
  setupModeToggle() {
    const toggleButton = document.getElementById('mode-toggle');
    if (toggleButton) {
      toggleButton.addEventListener('click', this.toggleMode.bind(this));
    }
  }
  
  toggleMode() {
    if (this.currentMode === 'interactive') {
      this.showRecruiterMode();
    } else {
      this.showRoom();
    }
  }
  
  showRoom() {
    this.currentMode = 'interactive';
    window.location.hash = '#room';
    
    const toggleButton = document.getElementById('mode-toggle');
    if (toggleButton) {
      toggleButton.textContent = 'Switch to Recruiter Mode';
      toggleButton.setAttribute('aria-label', 'Switch to recruiter mode for linear content access');
    }
    
    // Room display logic will be implemented in later tasks
  }
  
  showRecruiterMode() {
    this.currentMode = 'recruiter';
    window.location.hash = '#recruiter';
    
    const toggleButton = document.getElementById('mode-toggle');
    if (toggleButton) {
      toggleButton.textContent = 'Switch to Interactive Mode';
      toggleButton.setAttribute('aria-label', 'Switch to interactive room mode');
    }
    
    // Recruiter mode display logic will be implemented in later tasks
  }
  
  setupAccessibility() {
    // Accessibility setup will be implemented in later tasks
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new App();
});