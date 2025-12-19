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
    
    // Create room background elements with embedded interactive objects
    this.renderRoomBackgroundWithObjects();
  }
  
  renderRoomBackgroundWithObjects() {
    // Create background container
    const backgroundContainer = document.createElement('div');
    backgroundContainer.className = 'room-background';
    
    // Room structure elements
    const floor = document.createElement('div');
    floor.className = 'room-floor';
    
    const backWall = document.createElement('div');
    backWall.className = 'room-back-wall';
    
    const leftWall = document.createElement('div');
    leftWall.className = 'room-left-wall';
    
    const rightWall = document.createElement('div');
    rightWall.className = 'room-right-wall';
    
    const ceiling = document.createElement('div');
    ceiling.className = 'room-ceiling';
    
    // Furniture elements with embedded interactive objects
    const window = document.createElement('div');
    window.className = 'room-window room-interactive-furniture';
    window.setAttribute('data-object-id', 'window');
    
    // Make window directly clickable
    this.makeFurnitureInteractive(window, 'window');
    
    const bookshelf = document.createElement('div');
    bookshelf.className = 'room-bookshelf room-interactive-furniture';
    bookshelf.setAttribute('data-object-id', 'bookshelf');
    
    // Add bookshelf shelves and books
    for (let i = 1; i <= 4; i++) {
      const shelf = document.createElement('div');
      shelf.className = 'bookshelf-shelf';
      bookshelf.appendChild(shelf);
    }
    
    // Add books to all shelves with variety
    const bookColors = ['#8b4513', '#228b22', '#4169e1', '#dc143c', '#ff8c00', '#9932cc', '#2e8b57', '#b22222', '#4682b4', '#d2691e'];
    const bookWidths = [6, 8, 10, 12, 7, 9, 11];
    const bookHeights = [35, 40, 38, 42, 36, 39, 41];
    
    // Books for each shelf
    const shelfBooks = [
      { count: 8, startLeft: 8 },   // Shelf 1
      { count: 7, startLeft: 10 },  // Shelf 2  
      { count: 9, startLeft: 6 },   // Shelf 3
      { count: 6, startLeft: 12 }   // Shelf 4
    ];
    
    shelfBooks.forEach((shelfData, shelfIndex) => {
      let currentLeft = shelfData.startLeft;
      
      for (let bookIndex = 0; bookIndex < shelfData.count; bookIndex++) {
        const book = document.createElement('div');
        book.className = 'book';
        
        const colorIndex = (shelfIndex * shelfData.count + bookIndex) % bookColors.length;
        const widthIndex = bookIndex % bookWidths.length;
        const heightIndex = bookIndex % bookHeights.length;
        
        book.style.background = bookColors[colorIndex];
        book.style.width = `${bookWidths[widthIndex]}px`;
        book.style.height = `${bookHeights[heightIndex]}px`;
        book.style.left = `${currentLeft}%`;
        book.style.top = `${20 + (shelfIndex * 20)}%`;
        
        // Add some books with slight tilt for realism
        if (bookIndex % 3 === 0) {
          book.style.transform = 'rotate(2deg)';
        } else if (bookIndex % 4 === 0) {
          book.style.transform = 'rotate(-1deg)';
        }
        
        bookshelf.appendChild(book);
        currentLeft += (bookWidths[widthIndex] / bookshelf.offsetWidth * 100) + 2; // 2% gap between books
      }
    });
    
    // Make bookshelf directly interactive
    this.makeFurnitureInteractive(bookshelf, 'bookshelf');
    
    const desk = document.createElement('div');
    desk.className = 'room-desk';
    
    // Add desk legs
    const leftLeg = document.createElement('div');
    leftLeg.className = 'desk-leg desk-leg-left';
    desk.appendChild(leftLeg);
    
    const rightLeg = document.createElement('div');
    rightLeg.className = 'desk-leg desk-leg-right';
    desk.appendChild(rightLeg);
    
    // Add laptop and notebook to desk
    this.addInteractiveObjectToContainer(desk, 'laptop');
    this.addInteractiveObjectToContainer(desk, 'notebook');
    
    const tvStand = document.createElement('div');
    tvStand.className = 'room-tv-stand';
    
    // Add TV to TV stand
    this.addInteractiveObjectToContainer(tvStand, 'tv');
    
    const clockArea = document.createElement('div');
    clockArea.className = 'room-clock-area room-interactive-furniture';
    clockArea.setAttribute('data-object-id', 'clock');
    
    // Make clock area directly clickable
    this.makeFurnitureInteractive(clockArea, 'clock');
    
    const picture = document.createElement('div');
    picture.className = 'room-picture';
    
    // Add map to picture frame
    this.addInteractiveObjectToContainer(picture, 'map');
    
    const carpet = document.createElement('div');
    carpet.className = 'room-carpet';
    
    // Add sports gear to carpet area
    this.addInteractiveObjectToContainer(carpet, 'sports_gear');
    
    // Add dustbin to floor (not in furniture)
    this.addInteractiveObjectToContainer(floor, 'dustbin');
    
    const lighting = document.createElement('div');
    lighting.className = 'room-lighting';
    
    // Floor shadows
    const deskShadow = document.createElement('div');
    deskShadow.className = 'floor-shadow shadow-desk';
    
    const tvShadow = document.createElement('div');
    tvShadow.className = 'floor-shadow shadow-tv';
    
    const bookshelfShadow = document.createElement('div');
    bookshelfShadow.className = 'floor-shadow shadow-bookshelf';
    
    // Append all elements in proper z-order
    backgroundContainer.appendChild(backWall);
    backgroundContainer.appendChild(leftWall);
    backgroundContainer.appendChild(rightWall);
    backgroundContainer.appendChild(ceiling);
    backgroundContainer.appendChild(floor);
    backgroundContainer.appendChild(window);
    backgroundContainer.appendChild(bookshelf);
    backgroundContainer.appendChild(desk);
    backgroundContainer.appendChild(tvStand);
    backgroundContainer.appendChild(clockArea);
    backgroundContainer.appendChild(picture);
    backgroundContainer.appendChild(carpet);
    backgroundContainer.appendChild(deskShadow);
    backgroundContainer.appendChild(tvShadow);
    backgroundContainer.appendChild(bookshelfShadow);
    backgroundContainer.appendChild(lighting);
    
    this.container.appendChild(backgroundContainer);
  }
  
  addInteractiveObjectToContainer(container, objectId) {
    const objectData = this.contentData.objects[objectId];
    if (!objectData) return;
    
    const interactiveObject = ObjectFactory.createObject(
      objectData,
      this.contentData,
      this.interactionData,
      this.stateManager
    );
    
    if (interactiveObject) {
      const objectElement = interactiveObject.getElement();
      
      // Remove absolute positioning - objects will be positioned naturally within containers
      objectElement.style.position = 'relative';
      objectElement.style.left = 'auto';
      objectElement.style.top = 'auto';
      objectElement.style.transform = 'none';
      
      // Add container-specific classes for fine-tuning if needed
      objectElement.classList.add(`in-${container.className.replace('room-', '')}`);
      
      container.appendChild(objectElement);
      this.objects[objectId] = interactiveObject;
    }
  }
  
  makeFurnitureInteractive(furnitureElement, objectId) {
    if (!this.contentData || !this.interactionData) {
      console.error('Content data or interaction data not loaded yet');
      return;
    }
    
    const objectData = this.contentData.objects[objectId];
    if (!objectData) {
      console.error(`No object data found for ${objectId}`);
      return;
    }
    
    // Make the furniture element itself interactive
    furnitureElement.setAttribute('tabindex', '0');
    furnitureElement.setAttribute('role', 'button');
    furnitureElement.setAttribute('aria-label', objectData.accessibility?.label || objectData.name);
    furnitureElement.setAttribute('aria-description', objectData.accessibility?.description || '');
    furnitureElement.style.cursor = 'pointer';
    
    // Add event listeners to furniture element
    const handleInteraction = (event) => {
      event.preventDefault();
      event.stopPropagation();
      
      console.log(`Furniture ${objectId} activated`);
      
      // Check if object is locked
      const isLocked = objectData.locked && !this.stateManager.isContentUnlocked(objectId);
      
      if (isLocked) {
        // Handle locked interaction
        furnitureElement.classList.add('object-locked-shake');
        setTimeout(() => {
          furnitureElement.classList.remove('object-locked-shake');
        }, 500);
        
        const message = `${objectData.name} is locked and requires puzzle completion to access.`;
        this.announceToScreenReader(message);
        
        const lockedEvent = new CustomEvent('objectLocked', {
          detail: {
            objectId: objectId,
            objectData: objectData
          }
        });
        document.dispatchEvent(lockedEvent);
        return;
      }
      
      // Track the interaction
      this.stateManager.trackInteraction(objectId);
      
      // Execute the interaction directly
      const interactionKey = `${objectId}_click`;
      const interaction = this.interactionData.interactions[interactionKey];
      
      if (interaction) {
        // Emit interaction event for content modal system to handle
        const interactionEvent = new CustomEvent('objectInteraction', {
          detail: {
            objectId: objectId,
            objectData: objectData,
            interaction: interaction,
            contentRef: objectData.contentRef
          }
        });
        document.dispatchEvent(interactionEvent);
        
        // Announce interaction to screen readers
        if (interaction.effects.announceToScreenReader) {
          this.announceToScreenReader(interaction.effects.announceToScreenReader);
        }
        
        // Add visual feedback
        furnitureElement.classList.add('object-activated');
        setTimeout(() => {
          furnitureElement.classList.remove('object-activated');
        }, interaction.animation?.duration || 300);
      } else {
        console.warn(`No interaction found for ${interactionKey}`);
      }
    };
    
    furnitureElement.addEventListener('click', handleInteraction);
    furnitureElement.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        handleInteraction(event);
      }
    });
    
    // Create a simple object for state management without using ObjectFactory
    this.objects[objectId] = {
      objectData: objectData,
      updateState: () => {
        // Update visual state based on visited/locked status
        const isVisited = this.stateManager.hasVisited(objectId);
        const isUnlocked = this.stateManager.isContentUnlocked(objectId);
        const effectivelyLocked = objectData.locked && !isUnlocked;
        
        furnitureElement.classList.toggle('object-visited', isVisited);
        furnitureElement.classList.toggle('object-locked', effectivelyLocked);
        furnitureElement.setAttribute('aria-disabled', effectivelyLocked ? 'true' : 'false');
      },
      getElement: () => furnitureElement
    };
    
    // Update initial state
    this.objects[objectId].updateState();
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
    // Import accessibility utilities
    import('../../utils/accessibility.js').then((module) => {
      const { accessibilityUtils } = module;
      
      // Set up tab order based on interaction data
      const tabOrder = this.interactionData?.globalInteractions?.navigation?.tabOrder || [];
      
      tabOrder.forEach((objectId, index) => {
        const interactiveObject = this.objects[objectId];
        if (interactiveObject) {
          const element = interactiveObject.getElement();
          element.style.zIndex = 100 + index; // Ensure proper stacking order
          element.setAttribute('tabindex', '0');
        }
      });
      
      // Set up arrow key navigation for objects and interactive furniture
      if (this.currentMode === 'interactive') {
        this.arrowNavCleanup = accessibilityUtils.setupArrowKeyNavigation(this.container, {
          selector: '.room-object[tabindex="0"], .room-interactive-furniture[tabindex="0"]',
          wrap: true,
          announceNavigation: true
        });
      }
      
      // Add keyboard navigation for the room container
      this.container.addEventListener('keydown', this.handleRoomKeydown.bind(this));
      
      // Set up escape key handler for closing modals
      this.escapeHandler = accessibilityUtils.addKeyboardHandler('Escape', (event) => {
        this.closeAllModals();
      });
      
      // Add skip to content functionality
      this.addSkipToContentLink();
      
    }).catch(error => {
      console.error('Failed to load accessibility utilities:', error);
      // Fallback to basic keyboard navigation
      this.container.addEventListener('keydown', this.handleRoomKeydown.bind(this));
    });
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
    
    // Handle tab order management
    if (event.key === 'Tab') {
      this.handleTabNavigation(event);
    }
    
    // Handle home/end keys for quick navigation
    if (event.key === 'Home' || event.key === 'End') {
      this.handleHomeEndNavigation(event);
    }
    
    // Handle number keys for quick object access (1-9)
    if (event.key >= '1' && event.key <= '9' && !event.ctrlKey && !event.metaKey && !event.altKey) {
      this.handleNumberKeyNavigation(event);
    }
  }
  
  handleTabNavigation(event) {
    if (this.currentMode !== 'interactive') return;
    
    const focusableObjects = Array.from(this.container.querySelectorAll('.room-object[tabindex="0"], .room-interactive-furniture[tabindex="0"]'))
      .filter(el => el.offsetWidth > 0 && el.offsetHeight > 0 && !el.hidden);
    
    if (focusableObjects.length === 0) return;
    
    // If we're not currently focused on an object, focus the first one
    if (!focusableObjects.includes(document.activeElement)) {
      event.preventDefault();
      focusableObjects[0].focus();
    }
  }
  
  handleHomeEndNavigation(event) {
    if (this.currentMode !== 'interactive') return;
    
    const focusableObjects = Array.from(this.container.querySelectorAll('.room-object[tabindex="0"], .room-interactive-furniture[tabindex="0"]'))
      .filter(el => el.offsetWidth > 0 && el.offsetHeight > 0 && !el.hidden);
    
    if (focusableObjects.length === 0) return;
    
    event.preventDefault();
    
    if (event.key === 'Home') {
      focusableObjects[0].focus();
      this.announceToScreenReader('Moved to first interactive element');
    } else if (event.key === 'End') {
      focusableObjects[focusableObjects.length - 1].focus();
      this.announceToScreenReader('Moved to last interactive element');
    }
  }
  
  handleNumberKeyNavigation(event) {
    if (this.currentMode !== 'interactive') return;
    
    const number = parseInt(event.key);
    const focusableObjects = Array.from(this.container.querySelectorAll('.room-object[tabindex="0"], .room-interactive-furniture[tabindex="0"]'))
      .filter(el => el.offsetWidth > 0 && el.offsetHeight > 0 && !el.hidden);
    
    if (number > 0 && number <= focusableObjects.length) {
      event.preventDefault();
      const targetObject = focusableObjects[number - 1];
      targetObject.focus();
      
      const objectId = targetObject.dataset.objectId;
      const objectName = targetObject.getAttribute('aria-label') || objectId;
      this.announceToScreenReader(`Jumped to ${objectName}`);
    }
  }
  
  addSkipToContentLink() {
    // Check if skip link already exists
    if (document.getElementById('skip-to-content')) return;
    
    const skipLink = document.createElement('a');
    skipLink.id = 'skip-to-content';
    skipLink.href = '#room-container';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      background: #000;
      color: #fff;
      padding: 8px;
      text-decoration: none;
      border-radius: 4px;
      z-index: 10000;
      transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });
    
    skipLink.addEventListener('click', (event) => {
      event.preventDefault();
      this.container.focus();
      this.announceToScreenReader('Skipped to main room content');
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
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
    this.cleanup();
    this.setupRoom();
    this.renderObjects();
    this.setupEventListeners();
    this.setupKeyboardNavigation();
  }
  
  // Cleanup method for navigation handlers
  cleanup() {
    if (this.arrowNavCleanup) {
      this.arrowNavCleanup();
      this.arrowNavCleanup = null;
    }
    
    if (this.escapeHandler) {
      this.escapeHandler();
      this.escapeHandler = null;
    }
  }
  
  // Destroy method for complete cleanup
  destroy() {
    this.cleanup();
    this.closeAllModals();
    
    // Remove skip link
    const skipLink = document.getElementById('skip-to-content');
    if (skipLink && skipLink.parentNode) {
      skipLink.parentNode.removeChild(skipLink);
    }
  }
}