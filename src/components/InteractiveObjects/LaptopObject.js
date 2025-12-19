// Laptop Object - Professional content
import InteractiveObject from './index.js';

export default class LaptopObject extends InteractiveObject {
  constructor(objectData, contentData, interactionData, stateManager) {
    super(objectData, contentData, interactionData, stateManager);
  }
  
  executeInteraction() {
    // Get professional content
    const professionalContent = this.contentData.content.professional;
    
    if (!professionalContent) {
      console.warn('Professional content not found');
      return;
    }
    
    // Emit specialized event for laptop interaction
    const laptopEvent = new CustomEvent('laptopInteraction', {
      detail: {
        objectId: this.objectData.id,
        objectData: this.objectData,
        content: professionalContent,
        sections: ['resume', 'experience', 'projects', 'skills']
      }
    });
    document.dispatchEvent(laptopEvent);
    
    // Call parent method for standard interaction handling
    super.executeInteraction();
  }
  
  // Method to get professional content sections
  getProfessionalContent() {
    return this.contentData.content.professional;
  }
  
  // Method to get specific professional section
  getProfessionalSection(section) {
    const professional = this.getProfessionalContent();
    return professional ? professional[section] : null;
  }
}