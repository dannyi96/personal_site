// Room component - Main spatial layout container
import { StateManager } from '../../utils/stateManager.js';
import ObjectFactory from '../InteractiveObjects/ObjectFactory.js';

export default class Room {
  constructor() {
    this.stateManager = new StateManager();
    this.container = null;
    this.objects = {};
    this.contentData = null;
    this.interactionData = null;
    this.currentMode = 'interactive';
    
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
    this.container.setAttribute('aria-label', 'Interactive room with clickable objects');
    this.container.setAttribute('tabindex', '0');
  }
  
  renderObjects() {
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
    
    // This will be handled by the ContentModal system when implemented
    // For now, just log the interaction
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
  }
  
  handleWindowInteraction(event) {
    const { currentView, viewData } = event.detail;
    console.log(`Window interaction - Current view: ${currentView}`, viewData);
  }
  
  handleMapInteraction(event) {
    const { locations } = event.detail;
    console.log('Map interaction - Journey locations:', locations.length);
  }
  
  handleNotebookInteraction(event) {
    const { methodology } = event.detail;
    console.log('Notebook interaction - Methodology steps:', methodology.length);
  }
  
  handleBookshelfInteraction(event) {
    const { categories } = event.detail;
    console.log('Bookshelf interaction - Reading categories:', categories.length);
  }
  
  handleTVInteraction(event) {
    const { shows, movies } = event.detail;
    console.log('TV interaction - Entertainment content:', { shows: shows.length, movies: movies.length });
  }
  
  handleSportsGearInteraction(event) {
    const { activities } = event.detail;
    console.log('Sports gear interaction - Activities:', activities.length);
  }
  
  handleClockInteraction(event) {
    const { principles } = event.detail;
    console.log('Clock interaction - Time principles:', principles.length);
  }
  
  handleDustbinInteraction(event) {
    const { reward, isEasterEgg } = event.detail;
    console.log('Dustbin interaction - Easter egg found!', reward);
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
    
    // Update room styling
    this.container.className = 'room-container';
    this.container.classList.add(`room-${this.currentMode}`);
    
    // Store mode preference
    this.stateManager.setMode(this.currentMode);
    
    // Announce mode change
    const modeDescription = this.currentMode === 'recruiter' 
      ? 'Linear content presentation mode activated'
      : 'Interactive room exploration mode activated';
    
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
      this.toggleMode();
    }
  }
  
  closeAllModals() {
    // This will be implemented when modal system is added
    console.log('Closing all modals');
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