// Room component - Main spatial layout container
import { StateManager } from '../../utils/stateManager.js';
import ObjectFactory from '../InteractiveObjects/ObjectFactory.js';
import ContentModal from '../ContentModals/index.js';
import RecruiterMode from '../RecruiterMode/index.js';

export default class Room {
  constructor() {
    this.stateManager = new StateManager();
    this.container = null;
    this.objects = {};
    this.contentData = null;
    this.interactionData = null;
    this.currentMode = this.stateManager.getMode() || 'interactive';
    this.recruiterMode = null;
    
    this.init();
  }
  
  async init() {
    // Load content and interaction data
    await this.loadData();
    
    // Get the room container element
    this.container = document.getElementById('room-container');
    if (!this.container) {
      console.error('Room container element not found');
      return;
    }
    
    // Initialize the room
    this.setupRoom();
    this.renderObjects();
    this.setupEventListeners();
    this.setupKeyboardNavigation();
  }
  
  async loadData() {
    try {
      // Load content data
      const contentResponse = await fetch('/src/data/content.json');
      this.contentData = await contentResponse.json();
      
      // Load interaction data
      const interactionResponse = await fetch('/src/data/interactions.json');
      this.interactionData = await interactionResponse.json();
    } catch (error) {
      console.error('Failed to load room data:', error);
      // Fallback to empty data structure
      this.contentData = { objects: {}, content: {} };
      this.interactionData = { interactions: {} };
    }
  }
  
  setupRoom() {
    // Clear existing content
    this.container.innerHTML = '';
    
    // Add room class for styling
    this.container.className = 'room-container';
    
    // Add mode-specific class
    this.container.classList.add(`room-${this.currentMode}`);
    
    // Set up ARIA attributes for accessibility
    this.container.setAttribute('role', 'main');
    
    if (this.currentMode === 'recruiter') {
      this.container.setAttribute('aria-label', 'Linear presentation of professional content');
    } else {
      this.container.setAttribute('aria-label', 'Interactive room with clickable objects');
    }
    
    this.container.setAttribute('tabindex', '0');
  }
  
  renderObjects() {
    if (this.currentMode === 'recruiter') {
      this.renderRecruiterMode();
      return;
    }
    
    if (!this.contentData || !this.contentData.objects) {
      console.warn('No object data available for rendering');
      return;
    }
    
    // Create objects container
    const objectsContainer = document.createElement('div');
    objectsContainer.className = 'room-objects';
    objectsContainer.setAttribute('role', 'group');
    objectsContainer.setAttribute('aria-label', 'Interactive room objects');
    
    // Render each object using ObjectFactory
    Object.values(this.contentData.objects).forEach(objectData => {
      const interactiveObject = ObjectFactory.createObject(
        objectData,
        this.contentData,
        this.interactionData,
        this.stateManager
      );
      
      if (interactiveObject) {
        const objectElement = interactiveObject.getElement();
        objectsContainer.appendChild(objectElement);
        this.objects[objectData.id] = interactiveObject;
      }
    });
    
    this.container.appendChild(objectsContainer);
  }
  
  renderRecruiterMode() {
    if (!this.recruiterMode) {
      this.recruiterMode = new RecruiterMode(this.contentData, this.stateManager);
    }
    
    this.recruiterMode.render(this.container);
  }
  

  
  setupEventListeners() {
    // Objects now handle their own events through the InteractiveObject classes
    // Just set up global room event listeners
    
    // Listen for custom events from interactive objects
    document.addEventListener('objectInteraction', this.handleObjectInteraction.bind(this));
    document.addEventListener('objectLocked', this.handleObjectLocked.bind(this));
    document.addEventListener('puzzleRequired', this.handlePuzzleRequired.bind(this));
    
    // Listen for specific object events
    document.addEventListener('laptopInteraction', this.handleLaptopInteraction.bind(this));
    document.addEventListener('windowInteraction', this.handleWindowInteraction.bind(this));
    document.addEventListener('mapInteraction', this.handleMapInteraction.bind(this));
    document.addEventListener('notebookInteraction', this.handleNotebookInteraction.bind(this));
    document.addEventListener('bookshelfInteraction', this.handleBookshelfInteraction.bind(this));
    document.addEventListener('tvInteraction', this.handleTVInteraction.bind(this));
    document.addEventListener('sportsGearInteraction', this.handleSportsGearInteraction.bind(this));
    document.addEventListener('clockInteraction', this.handleClockInteraction.bind(this));
    document.addEventListener('dustbinInteraction', this.handleDustbinInteraction.bind(this));
  }
  
  setupKeyboardNavigation() {
    // Set up tab order based on interaction data
    const tabOrder = this.interactionData?.globalInteractions?.navigation?.tabOrder || [];
    
    tabOrder.forEach((objectId, index) => {
      const interactiveObject = this.objects[objectId];
      if (interactiveObject) {
        const element = interactiveObject.getElement();
        element.style.zIndex = 100 + index; // Ensure proper stacking order
      }
    });
    
    // Add keyboard navigation for the room container
    this.container.addEventListener('keydown', this.handleRoomKeydown.bind(this));
  }
  
  // Event handlers for specific object interactions
  handleObjectInteraction(event) {
    const { objectId, objectData, interaction, contentRef } = event.detail;
    console.log(`Room received interaction from ${objectId}:`, interaction.action);
    
    // Handle different interaction types with ContentModal
    this.openContentModal(objectId, objectData, interaction, contentRef);
  }
  
  handleObjectLocked(event) {
    const { objectId, objectData } = event.detail;
    console.log(`Object ${objectId} is locked and requires puzzle completion`);
    
    // This will be handled by the puzzle system when implemented
  }
  
  handlePuzzleRequired(event) {
    const { objectId, puzzle, onSolved } = event.detail;
    console.log(`Puzzle required for ${objectId}:`, puzzle.question);
    
    // This will be handled by the puzzle system when implemented
    // For now, just log the puzzle requirement
  }
  
  // Specific object interaction handlers
  handleLaptopInteraction(event) {
    const { content, sections } = event.detail;
    console.log('Laptop interaction - Professional content:', sections);
    // Content modal is handled by the generic handleObjectInteraction
  }
  
  handleWindowInteraction(event) {
    const { currentView, viewData } = event.detail;
    console.log(`Window interaction - Current view: ${currentView}`, viewData);
    // Special handling for window toggle behavior could be added here
  }
  
  handleMapInteraction(event) {
    const { locations } = event.detail;
    console.log('Map interaction - Journey locations:', locations.length);
    // Content modal is handled by the generic handleObjectInteraction
  }
  
  handleNotebookInteraction(event) {
    const { methodology } = event.detail;
    console.log('Notebook interaction - Methodology steps:', methodology.length);
    // Content modal is handled by the generic handleObjectInteraction
  }
  
  handleBookshelfInteraction(event) {
    const { categories } = event.detail;
    console.log('Bookshelf interaction - Reading categories:', categories.length);
    // Content modal is handled by the generic handleObjectInteraction
  }
  
  handleTVInteraction(event) {
    const { shows, movies } = event.detail;
    console.log('TV interaction - Entertainment content:', { shows: shows?.length, movies: movies?.length });
    // Content modal is handled by the generic handleObjectInteraction
    // Puzzle handling is done in handlePuzzleRequired
  }
  
  handleSportsGearInteraction(event) {
    const { activities } = event.detail;
    console.log('Sports gear interaction - Activities:', activities.length);
    // Content modal is handled by the generic handleObjectInteraction
  }
  
  handleClockInteraction(event) {
    const { principles } = event.detail;
    console.log('Clock interaction - Time principles:', principles.length);
    // Content modal is handled by the generic handleObjectInteraction
  }
  
  handleDustbinInteraction(event) {
    const { reward, isEasterEgg } = event.detail;
    console.log('Dustbin interaction - Easter egg found!', reward);
    // Content modal is handled by the generic handleObjectInteraction
  }
  
  handleRoomKeydown(event) {
    // Handle global keyboard shortcuts
    if (event.key === 'r' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      this.toggleMode();
    }
    
    // Handle escape key to close any open modals
    if (event.key === 'Escape') {
      this.closeAllModals();
    }
  }
  

  
  toggleMode() {
    this.currentMode = this.currentMode === 'interactive' ? 'recruiter' : 'interactive';
    
    // Store mode preference
    this.stateManager.setMode(this.currentMode);
    
    // Re-render the room with new mode
    this.setupRoom();
    this.renderObjects();
    this.setupEventListeners();
    this.setupKeyboardNavigation();
    
    // Announce mode change
    const modeDescription = this.currentMode === 'recruiter' 
      ? 'Linear content presentation mode activated. All professional content is now displayed sequentially.'
      : 'Interactive room exploration mode activated. Click on objects to discover content.';
    
    this.announceToScreenReader(`Switched to ${this.currentMode} mode. ${modeDescription}`);
    
    // Emit custom event for other components to listen to
    const modeChangeEvent = new CustomEvent('modeChange', {
      detail: { mode: this.currentMode }
    });
    document.dispatchEvent(modeChangeEvent);
  }
  
  setMode(mode) {
    if (mode !== this.currentMode) {
      this.currentMode = mode;
      this.stateManager.setMode(this.currentMode);
      
      // Re-render the room with new mode
      this.setupRoom();
      this.renderObjects();
      this.setupEventListeners();
      this.setupKeyboardNavigation();
      
      // Announce mode change
      const modeDescription = this.currentMode === 'recruiter' 
        ? 'Linear content presentation mode activated. All professional content is now displayed sequentially.'
        : 'Interactive room exploration mode activated. Click on objects to discover content.';
      
      this.announceToScreenReader(`Switched to ${this.currentMode} mode. ${modeDescription}`);
      
      // Emit custom event for other components to listen to
      const modeChangeEvent = new CustomEvent('modeChange', {
        detail: { mode: this.currentMode }
      });
      document.dispatchEvent(modeChangeEvent);
    }
  }
  
  getCurrentMode() {
    return this.currentMode;
  }
  
  async openContentModal(objectId, objectData, interaction, contentRef) {
    try {
      const modalOptions = {
        mode: interaction.action === 'modal' ? 'modal' : 
              interaction.action === 'panel' ? 'panel' : 'inline',
        title: objectData.name || objectData.id,
        announcement: interaction.effects?.announceToScreenReader,
        contentData: this.contentData,
        onClose: () => {
          // Handle modal close
          this.announceToScreenReader('Content closed');
        },
        onOpen: (modal) => {
          // Handle modal open
          if (interaction.effects?.trackVisit) {
            this.stateManager.markVisited(objectId);
            this.updateObjectState(objectId);
          }
          if (interaction.effects?.incrementExploration) {
            this.stateManager.incrementExploration();
            this.checkExplorationThreshold();
          }
        }
      };
      
      // Position inline modals near the target object
      if (interaction.action === 'inline') {
        const objectElement = this.objects[objectId]?.getElement();
        if (objectElement) {
          modalOptions.position = { target: objectElement };
        }
      }
      
      // Open modal with content rendering
      const modal = await ContentModal.openWithRenderer(contentRef, this.contentData, modalOptions);
      
      // Store reference to modal for cleanup
      if (!this.activeModals) {
        this.activeModals = new Set();
      }
      this.activeModals.add(modal);
      
      // Remove from active modals when closed
      const originalOnClose = modalOptions.onClose;
      modal.onClose = (modal) => {
        this.activeModals.delete(modal);
        if (originalOnClose) originalOnClose(modal);
      };
      
    } catch (error) {
      console.error('Failed to open content modal:', error);
      this.announceToScreenReader('Error opening content');
    }
  }
  
  closeAllModals() {
    if (this.activeModals) {
      this.activeModals.forEach(modal => {
        modal.close();
      });
      this.activeModals.clear();
    }
  }
  
  checkExplorationThreshold() {
    const explorationCount = this.stateManager.getExplorationCount();
    const threshold = this.contentData?.metadata?.explorationThreshold || 6;
    
    if (explorationCount >= threshold && !this.stateManager.isFinalRevealed()) {
      this.stateManager.setFinalRevealed(true);
      this.showFinalReveal();
    }
  }
  
  async showFinalReveal() {
    const finalReveal = this.contentData?.metadata?.finalReveal;
    if (!finalReveal) return;
    
    try {
      this.stateManager.markFinalRevealed();
      
      const modal = await ContentModal.openWithRenderer('metadata.finalReveal', this.contentData, {
        mode: 'modal',
        title: finalReveal.title || 'Final Reveal',
        announcement: 'Final content unlocked! You have explored enough to reveal the complete experience.',
        className: 'final-reveal-modal'
      });
      
      this.announceToScreenReader('Final content unlocked! You have explored enough to reveal the complete experience.');
    } catch (error) {
      console.error('Failed to show final reveal:', error);
    }
  }
  
  announceToScreenReader(message) {
    if (!message) return;
    
    const announcements = document.getElementById('announcements');
    if (announcements) {
      announcements.textContent = message;
      
      // Clear the announcement after a delay to allow for re-announcements
      setTimeout(() => {
        announcements.textContent = '';
      }, 1000);
    }
  }
  
  // Method to update object states (for use by other components)
  updateObjectState(objectId, state) {
    const interactiveObject = this.objects[objectId];
    if (!interactiveObject) return;
    
    // Update the interactive object's state
    interactiveObject.updateState();
  }
  
  // Method to get current room state
  getRoomState() {
    return {
      mode: this.currentMode,
      objects: this.objects,
      contentData: this.contentData,
      interactionData: this.interactionData
    };
  }
  
  // Method to refresh the room (useful for state changes)
  refresh() {
    this.setupRoom();
    this.renderObjects();
    this.setupEventListeners();
    this.setupKeyboardNavigation();
  }
}