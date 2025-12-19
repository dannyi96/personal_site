// Window Object - Environment toggle
import InteractiveObject from './index.js';

export default class WindowObject extends InteractiveObject {
  constructor(objectData, contentData, interactionData, stateManager) {
    super(objectData, contentData, interactionData, stateManager);
    this.currentView = 'city'; // Default view
  }
  
  executeInteraction() {
    // Toggle between city and mountain views
    this.currentView = this.currentView === 'city' ? 'mountain' : 'city';
    
    // Get environment content
    const environmentContent = this.contentData.content.personal.environment;
    
    if (!environmentContent) {
      console.warn('Environment content not found');
      return;
    }
    
    // Find the current view data
    const currentViewData = environmentContent.data.views.find(
      view => view.name.toLowerCase().includes(this.currentView)
    );
    
    // Emit specialized event for window interaction
    const windowEvent = new CustomEvent('windowInteraction', {
      detail: {
        objectId: this.objectData.id,
        objectData: this.objectData,
        content: environmentContent,
        currentView: this.currentView,
        viewData: currentViewData
      }
    });
    document.dispatchEvent(windowEvent);
    
    // Update visual state to reflect current view
    this.updateViewState();
    
    // Call parent method for standard interaction handling
    super.executeInteraction();
  }
  
  updateViewState() {
    // Add view-specific class to element
    this.element.classList.remove('view-city', 'view-mountain');
    this.element.classList.add(`view-${this.currentView}`);
    
    // Update aria-label to reflect current view
    const baseLabel = this.objectData.accessibility.label;
    const viewLabel = `${baseLabel} - Currently showing ${this.currentView} view`;
    this.element.setAttribute('aria-label', viewLabel);
  }
  
  // Method to get current view
  getCurrentView() {
    return this.currentView;
  }
  
  // Method to set specific view
  setView(view) {
    if (view === 'city' || view === 'mountain') {
      this.currentView = view;
      this.updateViewState();
    }
  }
  
  // Method to get environment content
  getEnvironmentContent() {
    return this.contentData.content.personal.environment;
  }
}