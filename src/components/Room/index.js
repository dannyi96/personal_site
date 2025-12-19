// Room component - Main spatial layout container
import { StateManager } from '../../utils/stateManager.js';

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
    
    // Render each object
    Object.values(this.contentData.objects).forEach(objectData => {
      const objectElement = this.createObjectElement(objectData);
      if (objectElement) {
        objectsContainer.appendChild(objectElement);
        this.objects[objectData.id] = objectElement;
      }
    });
    
    this.container.appendChild(objectsContainer);
  }
  
  createObjectElement(objectData) {
    const element = document.createElement('div');
    element.className = `room-object room-object-${objectData.id}`;
    element.id = `object-${objectData.id}`;
    
    // Position the object
    element.style.position = 'absolute';
    element.style.left = objectData.position.x;
    element.style.top = objectData.position.y;
    element.style.transform = 'translate(-50%, -50%)'; // Center the object on its position
    
    // Add visual content
    const icon = document.createElement('span');
    icon.className = 'object-icon';
    icon.textContent = objectData.visual.icon;
    icon.setAttribute('aria-hidden', 'true');
    
    const label = document.createElement('span');
    label.className = 'object-label sr-only';
    label.textContent = objectData.name;
    
    element.appendChild(icon);
    element.appendChild(label);
    
    // Add accessibility attributes
    element.setAttribute('role', objectData.accessibility.role || 'button');
    element.setAttribute('aria-label', objectData.accessibility.label);
    element.setAttribute('aria-describedby', `${objectData.id}-description`);
    element.setAttribute('tabindex', '0');
    
    // Add description element for screen readers
    const description = document.createElement('div');
    description.id = `${objectData.id}-description`;
    description.className = 'sr-only';
    description.textContent = objectData.accessibility.description;
    element.appendChild(description);
    
    // Add visual styling classes
    element.classList.add(`object-color-${objectData.visual.color}`);
    element.classList.add(`object-size-${objectData.visual.size}`);
    
    // Add locked state if applicable
    if (objectData.locked) {
      element.classList.add('object-locked');
      element.setAttribute('aria-disabled', 'true');
    }
    
    // Store object data for interaction handling
    element.dataset.objectId = objectData.id;
    element.dataset.contentRef = objectData.contentRef;
    element.dataset.locked = objectData.locked ? 'true' : 'false';
    
    return element;
  }
  
  setupEventListeners() {
    // Add click listeners to all objects
    Object.keys(this.objects).forEach(objectId => {
      const element = this.objects[objectId];
      element.addEventListener('click', (e) => this.handleObjectClick(e, objectId));
      element.addEventListener('keydown', (e) => this.handleObjectKeydown(e, objectId));
    });
    
    // Add hover effects for better UX (while maintaining accessibility)
    Object.values(this.objects).forEach(element => {
      element.addEventListener('mouseenter', this.handleObjectHover.bind(this));
      element.addEventListener('mouseleave', this.handleObjectHoverEnd.bind(this));
    });
  }
  
  setupKeyboardNavigation() {
    // Set up tab order based on interaction data
    const tabOrder = this.interactionData?.globalInteractions?.navigation?.tabOrder || [];
    
    tabOrder.forEach((objectId, index) => {
      const element = this.objects[objectId];
      if (element) {
        element.style.zIndex = 100 + index; // Ensure proper stacking order
      }
    });
    
    // Add keyboard navigation for the room container
    this.container.addEventListener('keydown', this.handleRoomKeydown.bind(this));
  }
  
  handleObjectClick(event, objectId) {
    event.preventDefault();
    event.stopPropagation();
    
    // Track the interaction
    this.stateManager.trackInteraction(objectId);
    
    // Get object data
    const objectData = this.contentData.objects[objectId];
    const interactionData = this.interactionData.interactions[`${objectId}_click`];
    
    if (!objectData || !interactionData) {
      console.warn(`No interaction data found for object: ${objectId}`);
      return;
    }
    
    // Check if object is locked and handle accordingly
    if (objectData.locked && !this.stateManager.isUnlocked(objectId)) {
      this.handleLockedObject(objectId, objectData);
      return;
    }
    
    // Handle the interaction based on action type
    this.executeInteraction(objectId, interactionData);
    
    // Announce to screen readers
    this.announceToScreenReader(interactionData.effects.announceToScreenReader);
  }
  
  handleObjectKeydown(event, objectId) {
    // Handle Enter and Space key presses
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.handleObjectClick(event, objectId);
    }
  }
  
  handleObjectHover(event) {
    const element = event.currentTarget;
    element.classList.add('object-hover');
    
    // Add subtle scale effect
    element.style.transform = 'translate(-50%, -50%) scale(1.05)';
  }
  
  handleObjectHoverEnd(event) {
    const element = event.currentTarget;
    element.classList.remove('object-hover');
    
    // Reset scale
    element.style.transform = 'translate(-50%, -50%) scale(1)';
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
  
  handleLockedObject(objectId, objectData) {
    // This will be implemented when puzzle system is added
    console.log(`Object ${objectId} is locked and requires puzzle completion`);
    
    // For now, just announce that it's locked
    this.announceToScreenReader(`${objectData.name} is locked and requires puzzle completion`);
  }
  
  executeInteraction(objectId, interactionData) {
    // This will be expanded when modal system is implemented
    console.log(`Executing ${interactionData.action} interaction for ${objectId}`);
    
    // Add visual feedback
    const element = this.objects[objectId];
    if (element) {
      element.classList.add('object-activated');
      setTimeout(() => {
        element.classList.remove('object-activated');
      }, interactionData.animation.duration || 300);
    }
    
    // Track visit and exploration
    if (interactionData.effects.trackVisit) {
      this.stateManager.markVisited(objectId);
    }
    
    if (interactionData.effects.incrementExploration) {
      this.stateManager.incrementExploration();
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
    const element = this.objects[objectId];
    if (!element) return;
    
    if (state.unlocked !== undefined) {
      element.dataset.locked = state.unlocked ? 'false' : 'true';
      element.classList.toggle('object-locked', !state.unlocked);
      element.setAttribute('aria-disabled', state.unlocked ? 'false' : 'true');
    }
    
    if (state.visited !== undefined) {
      element.classList.toggle('object-visited', state.visited);
    }
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