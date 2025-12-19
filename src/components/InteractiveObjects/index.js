// Interactive Objects - Clickable room objects
export default class InteractiveObject {
  constructor(objectData, contentData, interactionData, stateManager) {
    this.objectData = objectData;
    this.contentData = contentData;
    this.interactionData = interactionData;
    this.stateManager = stateManager;
    this.element = null;
    this.isLocked = objectData.locked || false;
    
    this.init();
  }
  
  init() {
    this.createElement();
    this.setupAccessibility();
    this.setupEventListeners();
    this.updateState();
  }
  
  createElement() {
    this.element = document.createElement('div');
    this.element.className = `room-object room-object-${this.objectData.id}`;
    this.element.id = `object-${this.objectData.id}`;
    
    // Position the object
    this.element.style.position = 'absolute';
    this.element.style.left = this.objectData.position.x;
    this.element.style.top = this.objectData.position.y;
    this.element.style.transform = 'translate(-50%, -50%)';
    this.element.style.cursor = 'pointer';
    
    // Add visual content
    const icon = document.createElement('span');
    icon.className = 'object-icon';
    icon.textContent = this.objectData.visual.icon;
    icon.setAttribute('aria-hidden', 'true');
    
    const label = document.createElement('span');
    label.className = 'object-label sr-only';
    label.textContent = this.objectData.name;
    
    this.element.appendChild(icon);
    this.element.appendChild(label);
    
    // Add visual styling classes
    this.element.classList.add(`object-color-${this.objectData.visual.color}`);
    this.element.classList.add(`object-size-${this.objectData.visual.size}`);
    
    // Store object data for interaction handling
    this.element.dataset.objectId = this.objectData.id;
    this.element.dataset.contentRef = this.objectData.contentRef;
    this.element.dataset.locked = this.isLocked ? 'true' : 'false';
  }
  
  setupAccessibility() {
    // Add ARIA attributes
    this.element.setAttribute('role', this.objectData.accessibility.role || 'button');
    this.element.setAttribute('aria-label', this.objectData.accessibility.label);
    this.element.setAttribute('tabindex', '0');
    
    // Add description for screen readers
    if (this.objectData.accessibility.description) {
      const description = document.createElement('div');
      description.id = `${this.objectData.id}-description`;
      description.className = 'sr-only';
      description.textContent = this.objectData.accessibility.description;
      this.element.appendChild(description);
      this.element.setAttribute('aria-describedby', description.id);
    }
    
    // Set initial accessibility state
    this.updateAccessibilityState();
  }
  
  setupEventListeners() {
    // Click handling
    this.element.addEventListener('click', this.handleClick.bind(this));
    
    // Keyboard navigation support
    this.element.addEventListener('keydown', this.handleKeydown.bind(this));
    
    // Hover effects (while maintaining accessibility)
    this.element.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
    this.element.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
    
    // Focus handling
    this.element.addEventListener('focus', this.handleFocus.bind(this));
    this.element.addEventListener('blur', this.handleBlur.bind(this));
  }
  
  handleClick(event) {
    event.preventDefault();
    event.stopPropagation();
    
    // Check if object is locked
    if (this.isLocked && !this.stateManager.isContentUnlocked(this.objectData.id)) {
      this.handleLockedInteraction();
      return;
    }
    
    // Track the interaction
    this.stateManager.trackInteraction(this.objectData.id);
    
    // Execute the interaction
    this.executeInteraction();
    
    // Update visual state
    this.updateState();
    
    // Provide visual feedback
    this.addActivationFeedback();
  }
  
  handleKeydown(event) {
    // Handle Enter and Space key presses for activation
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.handleClick(event);
    }
    
    // Handle arrow key navigation
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
      this.handleArrowKeyNavigation(event.key);
    }
  }
  
  handleMouseEnter(event) {
    if (!this.isLocked || this.stateManager.isContentUnlocked(this.objectData.id)) {
      this.element.classList.add('object-hover');
      this.element.style.transform = 'translate(-50%, -50%) scale(1.05)';
    }
  }
  
  handleMouseLeave(event) {
    this.element.classList.remove('object-hover');
    this.element.style.transform = 'translate(-50%, -50%) scale(1)';
  }
  
  handleFocus(event) {
    this.element.classList.add('object-focused');
    
    // Announce focus to screen readers
    const announcement = `Focused on ${this.objectData.name}. ${this.objectData.accessibility.description}`;
    this.announceToScreenReader(announcement);
  }
  
  handleBlur(event) {
    this.element.classList.remove('object-focused');
  }
  
  handleArrowKeyNavigation(key) {
    // Get all focusable objects in tab order
    const allObjects = Array.from(document.querySelectorAll('.room-object[tabindex="0"]'))
      .filter(el => el.offsetWidth > 0 && el.offsetHeight > 0 && !el.hidden);
    
    const currentIndex = allObjects.indexOf(this.element);
    if (currentIndex === -1) return;
    
    let nextIndex;
    switch (key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextIndex = (currentIndex + 1) % allObjects.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex = (currentIndex - 1 + allObjects.length) % allObjects.length;
        break;
    }
    
    if (nextIndex !== undefined && allObjects[nextIndex]) {
      allObjects[nextIndex].focus();
      
      // Announce navigation to screen readers
      const targetElement = allObjects[nextIndex];
      const targetName = targetElement.getAttribute('aria-label') || targetElement.dataset.objectId;
      this.announceToScreenReader(`Navigated to ${targetName}`);
    }
  }
  
  handleLockedInteraction() {
    // Add visual feedback for locked state
    this.element.classList.add('object-locked-shake');
    setTimeout(() => {
      this.element.classList.remove('object-locked-shake');
    }, 500);
    
    // Announce locked state to screen readers
    const message = `${this.objectData.name} is locked and requires puzzle completion to access.`;
    this.announceToScreenReader(message);
    
    // Emit event for puzzle system to handle
    const lockedEvent = new CustomEvent('objectLocked', {
      detail: {
        objectId: this.objectData.id,
        objectData: this.objectData
      }
    });
    document.dispatchEvent(lockedEvent);
  }
  
  executeInteraction() {
    const interactionKey = `${this.objectData.id}_click`;
    const interaction = this.interactionData.interactions[interactionKey];
    
    if (!interaction) {
      console.warn(`No interaction defined for ${this.objectData.id}`);
      return;
    }
    
    // Emit interaction event for content modal system to handle
    const interactionEvent = new CustomEvent('objectInteraction', {
      detail: {
        objectId: this.objectData.id,
        objectData: this.objectData,
        interaction: interaction,
        contentRef: this.objectData.contentRef
      }
    });
    document.dispatchEvent(interactionEvent);
    
    // Announce interaction to screen readers
    if (interaction.effects.announceToScreenReader) {
      this.announceToScreenReader(interaction.effects.announceToScreenReader);
    }
  }
  
  addActivationFeedback() {
    this.element.classList.add('object-activated');
    
    // Get animation duration from interaction data
    const interactionKey = `${this.objectData.id}_click`;
    const interaction = this.interactionData.interactions[interactionKey];
    const duration = interaction?.animation?.duration || 300;
    
    setTimeout(() => {
      this.element.classList.remove('object-activated');
    }, duration);
  }
  
  updateState() {
    // Update visited state
    const isVisited = this.stateManager.hasVisited(this.objectData.id);
    this.element.classList.toggle('object-visited', isVisited);
    
    // Update locked state
    const isUnlocked = this.stateManager.isContentUnlocked(this.objectData.id);
    const effectivelyLocked = this.isLocked && !isUnlocked;
    
    this.element.classList.toggle('object-locked', effectivelyLocked);
    this.element.dataset.locked = effectivelyLocked ? 'true' : 'false';
    
    this.updateAccessibilityState();
  }
  
  updateAccessibilityState() {
    const isUnlocked = this.stateManager.isContentUnlocked(this.objectData.id);
    const effectivelyLocked = this.isLocked && !isUnlocked;
    
    // Update aria-disabled state
    this.element.setAttribute('aria-disabled', effectivelyLocked ? 'true' : 'false');
    
    // Update description to reflect current state
    const descriptionElement = this.element.querySelector(`#${this.objectData.id}-description`);
    if (descriptionElement) {
      let description = this.objectData.accessibility.description;
      
      if (effectivelyLocked) {
        description += ' (Currently locked - requires puzzle completion)';
      } else if (this.stateManager.hasVisited(this.objectData.id)) {
        description += ' (Previously explored)';
      }
      
      descriptionElement.textContent = description;
    }
  }
  
  announceToScreenReader(message) {
    if (!message) return;
    
    // Find or create announcements element
    let announcements = document.getElementById('announcements');
    if (!announcements) {
      announcements = document.createElement('div');
      announcements.id = 'announcements';
      announcements.setAttribute('aria-live', 'polite');
      announcements.setAttribute('aria-atomic', 'true');
      announcements.className = 'sr-only';
      document.body.appendChild(announcements);
    }
    
    announcements.textContent = message;
    
    // Clear the announcement after a delay to allow for re-announcements
    setTimeout(() => {
      announcements.textContent = '';
    }, 1000);
  }
  
  // Public methods for external state management
  unlock() {
    this.stateManager.unlockContent(this.objectData.id);
    this.updateState();
    
    // Announce unlock to screen readers
    this.announceToScreenReader(`${this.objectData.name} has been unlocked and is now accessible`);
  }
  
  lock() {
    // Remove from unlocked content (if needed for puzzle reset)
    const unlockedContent = this.stateManager.getState().unlockedContent;
    const index = unlockedContent.indexOf(this.objectData.id);
    if (index > -1) {
      unlockedContent.splice(index, 1);
      this.stateManager.saveState();
    }
    this.updateState();
  }
  
  isUnlocked() {
    return !this.isLocked || this.stateManager.isContentUnlocked(this.objectData.id);
  }
  
  hasBeenVisited() {
    return this.stateManager.hasVisited(this.objectData.id);
  }
  
  getElement() {
    return this.element;
  }
  
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}