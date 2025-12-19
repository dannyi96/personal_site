// Clock Object - Time philosophy
import InteractiveObject from './index.js';

export default class ClockObject extends InteractiveObject {
  constructor(objectData, contentData, interactionData, stateManager) {
    super(objectData, contentData, interactionData, stateManager);
  }
  
  executeInteraction() {
    // Get time philosophy content
    const timeContent = this.contentData.content.personal.time;
    
    if (!timeContent) {
      console.warn('Time content not found');
      return;
    }
    
    // Emit specialized event for clock interaction
    const clockEvent = new CustomEvent('clockInteraction', {
      detail: {
        objectId: this.objectData.id,
        objectData: this.objectData,
        content: timeContent,
        principles: timeContent.data.principles
      }
    });
    document.dispatchEvent(clockEvent);
    
    // Call parent method for standard interaction handling
    super.executeInteraction();
  }
  
  // Method to get time content
  getTimeContent() {
    return this.contentData.content.personal.time;
  }
  
  // Method to get time management principles
  getPrinciples() {
    const time = this.getTimeContent();
    return time ? time.data.principles : [];
  }
  
  // Method to get specific principle
  getPrinciple(index) {
    const principles = this.getPrinciples();
    return principles[index] || null;
  }
  
  // Method to get principle by keyword
  getPrincipleByKeyword(keyword) {
    const principles = this.getPrinciples();
    return principles.find(principle => 
      principle.toLowerCase().includes(keyword.toLowerCase())
    );
  }
}