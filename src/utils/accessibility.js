// Accessibility utilities
export class AccessibilityUtils {
  constructor() {
    this.announcementElement = null;
    this.focusStack = [];
    this.keyboardHandlers = new Map();
    this.init();
  }
  
  init() {
    this.createAnnouncementElement();
    this.setupGlobalKeyboardHandlers();
  }
  
  // ARIA announcement helpers
  createAnnouncementElement() {
    // Check if announcement element already exists
    this.announcementElement = document.getElementById('announcements');
    
    if (!this.announcementElement) {
      this.announcementElement = document.createElement('div');
      this.announcementElement.id = 'announcements';
      this.announcementElement.setAttribute('aria-live', 'polite');
      this.announcementElement.setAttribute('aria-atomic', 'true');
      this.announcementElement.className = 'sr-only';
      document.body.appendChild(this.announcementElement);
    }
  }
  
  announceToScreenReader(message, priority = 'polite') {
    if (!message || typeof message !== 'string') return;
    
    // Ensure announcement element exists
    if (!this.announcementElement) {
      this.createAnnouncementElement();
    }
    
    // Set the appropriate aria-live priority
    this.announcementElement.setAttribute('aria-live', priority);
    
    // Clear any existing content first to ensure re-announcement
    this.announcementElement.textContent = '';
    
    // Use requestAnimationFrame to ensure the clear happens before the new announcement
    requestAnimationFrame(() => {
      this.announcementElement.textContent = message;
      
      // Clear the announcement after a delay to allow for re-announcements
      setTimeout(() => {
        if (this.announcementElement.textContent === message) {
          this.announcementElement.textContent = '';
        }
      }, 1000);
    });
  }
  
  announceUrgent(message) {
    this.announceToScreenReader(message, 'assertive');
  }
  
  // Focus management utilities
  saveFocus(element = document.activeElement) {
    if (element && element !== document.body) {
      this.focusStack.push(element);
    }
  }
  
  restoreFocus() {
    const previousFocus = this.focusStack.pop();
    if (previousFocus && typeof previousFocus.focus === 'function') {
      try {
        previousFocus.focus();
      } catch (error) {
        console.warn('Failed to restore focus:', error);
        // Fallback to body if focus restoration fails
        document.body.focus();
      }
    }
  }
  
  clearFocusStack() {
    this.focusStack = [];
  }
  
  trapFocus(container, options = {}) {
    if (!container) return null;
    
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ];
    
    const focusableElements = Array.from(
      container.querySelectorAll(focusableSelectors.join(', '))
    ).filter(el => {
      return el.offsetWidth > 0 && el.offsetHeight > 0 && !el.hidden;
    });
    
    if (focusableElements.length === 0) return null;
    
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    const handleFocusTrap = (event) => {
      if (event.key !== 'Tab') return;
      
      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          event.preventDefault();
          lastFocusable.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          event.preventDefault();
          firstFocusable.focus();
        }
      }
    };
    
    container.addEventListener('keydown', handleFocusTrap);
    
    // Focus the first element if requested
    if (options.focusFirst !== false) {
      firstFocusable.focus();
    }
    
    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleFocusTrap);
    };
  }
  
  setFocusIndicator(element, visible = true) {
    if (!element) return;
    
    if (visible) {
      element.classList.add('focus-visible');
      element.style.outline = '2px solid #4A90E2';
      element.style.outlineOffset = '2px';
    } else {
      element.classList.remove('focus-visible');
      element.style.outline = '';
      element.style.outlineOffset = '';
    }
  }
  
  // Keyboard navigation handlers
  setupGlobalKeyboardHandlers() {
    document.addEventListener('keydown', this.handleGlobalKeydown.bind(this));
    
    // Handle focus visibility
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    });
    
    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation');
    });
  }
  
  handleGlobalKeydown(event) {
    // Handle escape key globally
    if (event.key === 'Escape') {
      this.handleEscapeKey(event);
    }
    
    // Handle skip links
    if (event.key === 'Tab' && !event.shiftKey && event.target === document.body) {
      this.handleSkipToContent(event);
    }
  }
  
  handleEscapeKey(event) {
    // Close any open modals
    const openModals = document.querySelectorAll('.content-modal[aria-hidden="false"]');
    if (openModals.length > 0) {
      const topModal = openModals[openModals.length - 1];
      const closeButton = topModal.querySelector('.modal-close, .panel-close, .inline-collapse');
      if (closeButton) {
        closeButton.click();
        event.preventDefault();
      }
    }
    
    // Emit custom escape event for other components to handle
    const escapeEvent = new CustomEvent('globalEscape', {
      detail: { originalEvent: event }
    });
    document.dispatchEvent(escapeEvent);
  }
  
  handleSkipToContent(event) {
    const mainContent = document.querySelector('main, [role="main"], #main-content');
    if (mainContent) {
      event.preventDefault();
      mainContent.focus();
      this.announceToScreenReader('Skipped to main content');
    }
  }
  
  addKeyboardHandler(key, handler, element = document) {
    const handlerKey = `${key}_${element === document ? 'global' : element.id || 'element'}`;
    
    const keydownHandler = (event) => {
      if (event.key === key) {
        handler(event);
      }
    };
    
    element.addEventListener('keydown', keydownHandler);
    this.keyboardHandlers.set(handlerKey, { element, handler: keydownHandler });
    
    return () => this.removeKeyboardHandler(handlerKey);
  }
  
  removeKeyboardHandler(handlerKey) {
    const handlerData = this.keyboardHandlers.get(handlerKey);
    if (handlerData) {
      handlerData.element.removeEventListener('keydown', handlerData.handler);
      this.keyboardHandlers.delete(handlerKey);
    }
  }
  
  // Arrow key navigation for spatial layouts
  setupArrowKeyNavigation(container, options = {}) {
    if (!container) return null;
    
    const {
      selector = '[tabindex="0"], button:not([disabled]), a[href]',
      wrap = true,
      announceNavigation = true
    } = options;
    
    const handleArrowNavigation = (event) => {
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        return;
      }
      
      const focusableElements = Array.from(container.querySelectorAll(selector))
        .filter(el => el.offsetWidth > 0 && el.offsetHeight > 0 && !el.hidden);
      
      if (focusableElements.length === 0) return;
      
      const currentIndex = focusableElements.indexOf(document.activeElement);
      if (currentIndex === -1) return;
      
      event.preventDefault();
      
      let nextIndex;
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          nextIndex = wrap ? (currentIndex + 1) % focusableElements.length : Math.min(currentIndex + 1, focusableElements.length - 1);
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          nextIndex = wrap ? (currentIndex - 1 + focusableElements.length) % focusableElements.length : Math.max(currentIndex - 1, 0);
          break;
      }
      
      if (nextIndex !== undefined && focusableElements[nextIndex]) {
        focusableElements[nextIndex].focus();
        
        if (announceNavigation) {
          const element = focusableElements[nextIndex];
          const label = element.getAttribute('aria-label') || element.textContent || element.alt || 'Interactive element';
          this.announceToScreenReader(`Navigated to ${label}`);
        }
      }
    };
    
    container.addEventListener('keydown', handleArrowNavigation);
    
    return () => {
      container.removeEventListener('keydown', handleArrowNavigation);
    };
  }
  
  // Utility methods for ARIA attributes
  setAriaLabel(element, label) {
    if (element && label) {
      element.setAttribute('aria-label', label);
    }
  }
  
  setAriaDescription(element, description) {
    if (!element || !description) return;
    
    const descriptionId = `${element.id || 'element'}-description-${Date.now()}`;
    
    let descriptionElement = document.getElementById(descriptionId);
    if (!descriptionElement) {
      descriptionElement = document.createElement('div');
      descriptionElement.id = descriptionId;
      descriptionElement.className = 'sr-only';
      document.body.appendChild(descriptionElement);
    }
    
    descriptionElement.textContent = description;
    element.setAttribute('aria-describedby', descriptionId);
    
    return descriptionId;
  }
  
  setAriaExpanded(element, expanded) {
    if (element) {
      element.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    }
  }
  
  setAriaHidden(element, hidden) {
    if (element) {
      element.setAttribute('aria-hidden', hidden ? 'true' : 'false');
    }
  }
  
  // Screen reader utilities
  isScreenReaderActive() {
    // Basic detection - not foolproof but covers common cases
    return window.navigator.userAgent.includes('NVDA') ||
           window.navigator.userAgent.includes('JAWS') ||
           window.speechSynthesis?.speaking ||
           document.body.classList.contains('screen-reader-active');
  }
  
  // Cleanup method
  destroy() {
    // Remove global event listeners
    document.removeEventListener('keydown', this.handleGlobalKeydown);
    
    // Clear all keyboard handlers
    this.keyboardHandlers.forEach((handlerData, key) => {
      this.removeKeyboardHandler(key);
    });
    
    // Clear focus stack
    this.clearFocusStack();
    
    // Remove announcement element
    if (this.announcementElement && this.announcementElement.parentNode) {
      this.announcementElement.parentNode.removeChild(this.announcementElement);
    }
  }
}

// Create and export a singleton instance
export const accessibilityUtils = new AccessibilityUtils();

// Export individual utility functions for convenience
export const {
  announceToScreenReader,
  announceUrgent,
  saveFocus,
  restoreFocus,
  trapFocus,
  setFocusIndicator,
  addKeyboardHandler,
  setupArrowKeyNavigation,
  setAriaLabel,
  setAriaDescription,
  setAriaExpanded,
  setAriaHidden
} = accessibilityUtils;