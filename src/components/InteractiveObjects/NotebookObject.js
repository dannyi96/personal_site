// Notebook Object - Thinking style
import InteractiveObject from './index.js';

export default class NotebookObject extends InteractiveObject {
  constructor(objectData, contentData, interactionData, stateManager) {
    super(objectData, contentData, interactionData, stateManager);
  }
  
  executeInteraction() {
    // Get thinking content
    const thinkingContent = this.contentData.content.personal.thinking;
    
    if (!thinkingContent) {
      console.warn('Thinking content not found');
      return;
    }
    
    // Emit specialized event for notebook interaction
    const notebookEvent = new CustomEvent('notebookInteraction', {
      detail: {
        objectId: this.objectData.id,
        objectData: this.objectData,
        content: thinkingContent,
        methodology: thinkingContent.data.methodology
      }
    });
    document.dispatchEvent(notebookEvent);
    
    // Call parent method for standard interaction handling
    super.executeInteraction();
  }
  
  // Method to get thinking content
  getThinkingContent() {
    return this.contentData.content.personal.thinking;
  }
  
  // Method to get methodology steps
  getMethodology() {
    const thinking = this.getThinkingContent();
    return thinking ? thinking.data.methodology : [];
  }
  
  // Method to get specific methodology step
  getMethodologyStep(index) {
    const methodology = this.getMethodology();
    return methodology[index] || null;
  }
}