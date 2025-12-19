// Content Modals - Content display overlays
export default class ContentModal {
  constructor(options = {}) {
    this.mode = options.mode || 'modal'; // 'modal', 'panel', 'inline'
    this.contentData = options.contentData || {};
    this.onClose = options.onClose || (() => {});
    this.onOpen = options.onOpen || (() => {});
    this.trapFocus = options.trapFocus !== false;
    this.returnFocus = options.returnFocus !== false;
    
    this.element = null;
    this.isOpen = false;
    this.previousFocus = null;
    this.focusableElements = [];
    this.firstFocusable = null;
    this.lastFocusable = null;
    
    this.init();
  }
  
  init() {
    this.createElement();
    this.setupEventListeners();
  }
  
  createElement() {
    // Create the main modal container
    this.element = document.createElement('div');
    this.element.className = `content-modal content-modal-${this.mode}`;
    this.element.setAttribute('role', this.mode === 'modal' ? 'dialog' : 'region');
    this.element.setAttribute('aria-modal', this.mode === 'modal' ? 'true' : 'false');
    this.element.setAttribute('aria-hidden', 'true');
    this.element.style.display = 'none';
    
    if (this.mode === 'modal') {
      // Create overlay for modal mode
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.setAttribute('aria-hidden', 'true');
      
      // Create modal panel
      const panel = document.createElement('div');
      panel.className = 'modal-panel';
      panel.setAttribute('role', 'document');
      
      // Create close button
      const closeButton = document.createElement('button');
      closeButton.className = 'modal-close';
      closeButton.setAttribute('aria-label', 'Close modal');
      closeButton.innerHTML = '&times;';
      closeButton.addEventListener('click', () => this.close());
      
      // Create content container
      const contentContainer = document.createElement('div');
      contentContainer.className = 'modal-content';
      
      panel.appendChild(closeButton);
      panel.appendChild(contentContainer);
      overlay.appendChild(panel);
      this.element.appendChild(overlay);
      
      this.contentContainer = contentContainer;
      this.closeButton = closeButton;
      this.overlay = overlay;
      this.panel = panel;
      
    } else if (this.mode === 'panel') {
      // Create side panel
      this.element.className += ' panel-side';
      
      // Create panel header
      const header = document.createElement('div');
      header.className = 'panel-header';
      
      const title = document.createElement('h2');
      title.className = 'panel-title';
      title.id = `panel-title-${Date.now()}`;
      
      const closeButton = document.createElement('button');
      closeButton.className = 'panel-close';
      closeButton.setAttribute('aria-label', 'Close panel');
      closeButton.innerHTML = '&times;';
      closeButton.addEventListener('click', () => this.close());
      
      header.appendChild(title);
      header.appendChild(closeButton);
      
      // Create content container
      const contentContainer = document.createElement('div');
      contentContainer.className = 'panel-content';
      
      this.element.appendChild(header);
      this.element.appendChild(contentContainer);
      this.element.setAttribute('aria-labelledby', title.id);
      
      this.contentContainer = contentContainer;
      this.closeButton = closeButton;
      this.titleElement = title;
      
    } else if (this.mode === 'inline') {
      // Create inline expansion
      this.element.className += ' inline-expansion';
      
      // Create content container
      const contentContainer = document.createElement('div');
      contentContainer.className = 'inline-content';
      
      // Create collapse button (optional)
      const collapseButton = document.createElement('button');
      collapseButton.className = 'inline-collapse';
      collapseButton.setAttribute('aria-label', 'Collapse content');
      collapseButton.innerHTML = '&minus;';
      collapseButton.addEventListener('click', () => this.close());
      
      this.element.appendChild(contentContainer);
      this.element.appendChild(collapseButton);
      
      this.contentContainer = contentContainer;
      this.closeButton = collapseButton;
    }
    
    // Add to document body (will be moved to appropriate location when opened)
    document.body.appendChild(this.element);
  }
  
  setupEventListeners() {
    // Handle escape key
    this.handleKeydown = (event) => {
      if (event.key === 'Escape' && this.isOpen) {
        event.preventDefault();
        this.close();
      }
      
      // Handle focus trapping for modal mode
      if (this.mode === 'modal' && this.isOpen && this.trapFocus) {
        this.handleFocusTrap(event);
      }
    };
    
    // Handle overlay click for modal mode
    if (this.mode === 'modal' && this.overlay) {
      this.overlay.addEventListener('click', (event) => {
        if (event.target === this.overlay) {
          this.close();
        }
      });
    }
    
    document.addEventListener('keydown', this.handleKeydown);
  }
  
  handleFocusTrap(event) {
    if (event.key !== 'Tab') return;
    
    if (this.focusableElements.length === 0) return;
    
    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === this.firstFocusable) {
        event.preventDefault();
        this.lastFocusable.focus();
      }
    } else {
      // Tab
      if (document.activeElement === this.lastFocusable) {
        event.preventDefault();
        this.firstFocusable.focus();
      }
    }
  }
  
  updateFocusableElements() {
    if (this.mode !== 'modal' || !this.trapFocus) return;
    
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])'
    ];
    
    this.focusableElements = Array.from(
      this.element.querySelectorAll(focusableSelectors.join(', '))
    ).filter(el => {
      return el.offsetWidth > 0 && el.offsetHeight > 0 && !el.hidden;
    });
    
    this.firstFocusable = this.focusableElements[0];
    this.lastFocusable = this.focusableElements[this.focusableElements.length - 1];
  }
  
  open(content, options = {}) {
    if (this.isOpen) return;
    
    // Store previous focus for return
    if (this.returnFocus) {
      this.previousFocus = document.activeElement;
    }
    
    // Set content
    this.setContent(content, options);
    
    // Position modal appropriately
    this.position(options.position);
    
    // Show the modal
    this.element.style.display = '';
    this.element.setAttribute('aria-hidden', 'false');
    this.isOpen = true;
    
    // Add body class to prevent scrolling for modal mode
    if (this.mode === 'modal') {
      document.body.classList.add('modal-open');
    }
    
    // Focus management
    requestAnimationFrame(() => {
      this.updateFocusableElements();
      
      if (this.mode === 'modal' && this.firstFocusable) {
        this.firstFocusable.focus();
      } else if (this.closeButton) {
        this.closeButton.focus();
      }
    });
    
    // Announce to screen readers
    this.announceToScreenReader(options.announcement || `${options.title || 'Content'} opened`);
    
    // Call onOpen callback
    this.onOpen(this);
    
    // Emit custom event
    const openEvent = new CustomEvent('modalOpen', {
      detail: { modal: this, content, options }
    });
    document.dispatchEvent(openEvent);
  }
  
  close() {
    if (!this.isOpen) return;
    
    // Hide the modal
    this.element.style.display = 'none';
    this.element.setAttribute('aria-hidden', 'true');
    this.isOpen = false;
    
    // Remove body class
    if (this.mode === 'modal') {
      document.body.classList.remove('modal-open');
    }
    
    // Return focus
    if (this.returnFocus && this.previousFocus) {
      this.previousFocus.focus();
      this.previousFocus = null;
    }
    
    // Announce to screen readers
    this.announceToScreenReader('Content closed');
    
    // Call onClose callback
    this.onClose(this);
    
    // Emit custom event
    const closeEvent = new CustomEvent('modalClose', {
      detail: { modal: this }
    });
    document.dispatchEvent(closeEvent);
  }
  
  setContent(content, options = {}) {
    if (!this.contentContainer) return;
    
    // Clear existing content
    this.contentContainer.innerHTML = '';
    
    // Set title if provided and supported
    if (options.title) {
      this.element.setAttribute('aria-label', options.title);
      
      if (this.titleElement) {
        this.titleElement.textContent = options.title;
      } else if (this.mode === 'modal') {
        // Add title to modal if not present
        const title = document.createElement('h2');
        title.className = 'modal-title';
        title.textContent = options.title;
        this.contentContainer.appendChild(title);
      }
    }
    
    // Add content based on type
    if (typeof content === 'string') {
      this.contentContainer.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      this.contentContainer.appendChild(content);
    } else if (content && typeof content === 'object') {
      // Handle structured content data
      this.renderStructuredContent(content);
    }
    
    // Apply any custom classes
    if (options.className) {
      this.contentContainer.classList.add(options.className);
    }
  }
  
  renderStructuredContent(contentData) {
    // Import and use ContentRenderer
    import('../../utils/contentRenderer.js').then((module) => {
      const ContentRenderer = module.default;
      const renderer = new ContentRenderer(this.contentData);
      
      // If contentData is a string reference, render it
      if (typeof contentData === 'string') {
        const renderedContent = renderer.render(contentData);
        this.contentContainer.appendChild(renderedContent);
      } else if (contentData && typeof contentData === 'object') {
        // If it's already structured data, render directly
        const type = contentData.type || 'text';
        const rendererFunction = renderer.renderers.get(type);
        
        if (rendererFunction) {
          const renderedContent = rendererFunction(contentData);
          this.contentContainer.appendChild(renderedContent);
        } else {
          // Fallback to basic display
          const placeholder = document.createElement('div');
          placeholder.className = 'content-placeholder';
          placeholder.innerHTML = `
            <h3>${contentData.title || 'Content'}</h3>
            <p>${contentData.content || 'Content will be rendered here.'}</p>
          `;
          this.contentContainer.appendChild(placeholder);
        }
      }
    }).catch(error => {
      console.error('Failed to load ContentRenderer:', error);
      // Fallback to basic display
      const placeholder = document.createElement('div');
      placeholder.className = 'content-placeholder';
      placeholder.innerHTML = `
        <h3>${contentData.title || 'Content'}</h3>
        <p>${contentData.content || 'Content will be rendered here.'}</p>
      `;
      this.contentContainer.appendChild(placeholder);
    });
  }
  
  position(positionOptions = {}) {
    if (this.mode === 'inline' && positionOptions.target) {
      // Position inline expansion near the target element
      const target = positionOptions.target;
      const rect = target.getBoundingClientRect();
      
      this.element.style.position = 'absolute';
      this.element.style.top = `${rect.bottom + window.scrollY + 10}px`;
      this.element.style.left = `${rect.left + window.scrollX}px`;
      this.element.style.maxWidth = `${Math.max(300, rect.width)}px`;
      
      // Move to be a sibling of the target
      if (target.parentNode) {
        target.parentNode.insertBefore(this.element, target.nextSibling);
      }
    } else if (this.mode === 'panel') {
      // Position panel on the side
      this.element.style.position = 'fixed';
      this.element.style.top = '0';
      this.element.style.right = '0';
      this.element.style.height = '100vh';
      this.element.style.width = '400px';
      this.element.style.maxWidth = '90vw';
      this.element.style.zIndex = '1000';
    }
    // Modal mode positioning is handled by CSS
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
  
  destroy() {
    if (this.isOpen) {
      this.close();
    }
    
    // Remove event listeners
    document.removeEventListener('keydown', this.handleKeydown);
    
    // Remove element from DOM
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    
    // Clear references
    this.element = null;
    this.contentContainer = null;
    this.closeButton = null;
    this.previousFocus = null;
    this.focusableElements = [];
  }
  
  // Static method to create and open a modal in one call
  static open(content, options = {}) {
    const modal = new ContentModal(options);
    modal.open(content, options);
    return modal;
  }
  
  // Static method to create and open a modal with content rendering
  static async openWithRenderer(contentRef, contentData, options = {}) {
    try {
      const module = await import('../../utils/contentRenderer.js');
      const ContentRenderer = module.default;
      const renderer = new ContentRenderer(contentData);
      const renderedContent = renderer.render(contentRef, options);
      
      const modal = new ContentModal({
        ...options,
        contentData: contentData
      });
      
      modal.open(renderedContent, options);
      return modal;
    } catch (error) {
      console.error('Failed to render content:', error);
      // Fallback to basic modal
      return ContentModal.open(`Error loading content: ${contentRef}`, options);
    }
  }
  
  // Utility methods
  isModal() { return this.mode === 'modal'; }
  isPanel() { return this.mode === 'panel'; }
  isInline() { return this.mode === 'inline'; }
  
  getElement() { return this.element; }
  getContentContainer() { return this.contentContainer; }
}