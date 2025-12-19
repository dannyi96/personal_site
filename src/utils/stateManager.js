// Client-side state handling
export class StateManager {
  constructor() {
    this.storageKey = 'interactive-website-state';
    this.fallbackState = {
      visitedObjects: [],
      unlockedContent: [],
      currentMode: 'interactive',
      explorationCount: 0,
      finalRevealed: false
    };
    this.useLocalStorage = this.isLocalStorageAvailable();
    this.state = this.loadState();
  }

  /**
   * Check if localStorage is available
   * @returns {boolean} True if localStorage is available
   */
  isLocalStorageAvailable() {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Load state from localStorage or return fallback state
   * @returns {Object} Current state object
   */
  loadState() {
    if (!this.useLocalStorage) {
      return { ...this.fallbackState };
    }

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with fallback state to ensure all properties exist
        return { ...this.fallbackState, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to load state from localStorage:', e);
    }
    
    return { ...this.fallbackState };
  }

  /**
   * Save current state to localStorage
   */
  saveState() {
    if (!this.useLocalStorage) {
      return;
    }

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Failed to save state to localStorage:', e);
    }
  }

  /**
   * Track interaction with an object
   * @param {string} objectId - ID of the interacted object
   */
  trackInteraction(objectId) {
    if (!this.state.visitedObjects.includes(objectId)) {
      this.state.visitedObjects.push(objectId);
      this.state.explorationCount++;
      this.saveState();
    }
  }

  /**
   * Check if an object has been visited
   * @param {string} objectId - ID of the object to check
   * @returns {boolean} True if object has been visited
   */
  hasVisited(objectId) {
    return this.state.visitedObjects.includes(objectId);
  }

  /**
   * Get current exploration count
   * @returns {number} Number of unique objects explored
   */
  getExplorationCount() {
    return this.state.explorationCount;
  }

  /**
   * Unlock content by ID
   * @param {string} contentId - ID of content to unlock
   */
  unlockContent(contentId) {
    if (!this.state.unlockedContent.includes(contentId)) {
      this.state.unlockedContent.push(contentId);
      this.saveState();
    }
  }

  /**
   * Check if content is unlocked
   * @param {string} contentId - ID of content to check
   * @returns {boolean} True if content is unlocked
   */
  isContentUnlocked(contentId) {
    return this.state.unlockedContent.includes(contentId);
  }

  /**
   * Alias for isContentUnlocked for backward compatibility
   * @param {string} objectId - ID of object to check
   * @returns {boolean} True if object is unlocked
   */
  isUnlocked(objectId) {
    return this.isContentUnlocked(objectId);
  }

  /**
   * Mark an object as visited
   * @param {string} objectId - ID of the object to mark as visited
   */
  markVisited(objectId) {
    this.trackInteraction(objectId);
  }

  /**
   * Increment exploration count manually
   */
  incrementExploration() {
    this.state.explorationCount++;
    this.saveState();
  }

  /**
   * Set the current mode (interactive or recruiter)
   * @param {string} mode - Mode to set ('interactive' or 'recruiter')
   */
  setMode(mode) {
    if (mode === 'interactive' || mode === 'recruiter') {
      this.state.currentMode = mode;
      this.saveState();
    }
  }

  /**
   * Get current mode
   * @returns {string} Current mode ('interactive' or 'recruiter')
   */
  getMode() {
    return this.state.currentMode;
  }

  /**
   * Check if final reveal should be triggered
   * @param {number} threshold - Exploration threshold for final reveal
   * @returns {boolean} True if final reveal should be triggered
   */
  shouldTriggerFinalReveal(threshold = 5) {
    return this.state.explorationCount >= threshold && !this.state.finalRevealed;
  }

  /**
   * Mark final reveal as shown
   */
  markFinalRevealed() {
    this.state.finalRevealed = true;
    this.saveState();
  }

  /**
   * Set final reveal state
   * @param {boolean} revealed - Whether final reveal has been shown
   */
  setFinalRevealed(revealed) {
    this.state.finalRevealed = revealed;
    this.saveState();
  }

  /**
   * Check if final reveal has been shown
   * @returns {boolean} True if final reveal has been shown
   */
  isFinalRevealed() {
    return this.state.finalRevealed;
  }

  /**
   * Reset all state to initial values
   */
  resetState() {
    this.state = { ...this.fallbackState };
    this.saveState();
  }

  /**
   * Get complete state object (for debugging or export)
   * @returns {Object} Complete state object
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Check if localStorage is being used
   * @returns {boolean} True if localStorage is available and being used
   */
  isUsingLocalStorage() {
    return this.useLocalStorage;
  }
}