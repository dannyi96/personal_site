// Dustbin Object - Easter egg
import InteractiveObject from './index.js';

export default class DustbinObject extends InteractiveObject {
  constructor(objectData, contentData, interactionData, stateManager) {
    super(objectData, contentData, interactionData, stateManager);
    this.hasBeenFound = false;
  }
  
  executeInteraction() {
    // Mark as found for special handling
    this.hasBeenFound = true;
    
    // Get easter egg content
    const easterEggContent = this.contentData.content.personal.easter_egg;
    
    if (!easterEggContent) {
      console.warn('Easter egg content not found');
      return;
    }
    
    // Emit specialized event for dustbin interaction
    const dustbinEvent = new CustomEvent('dustbinInteraction', {
      detail: {
        objectId: this.objectData.id,
        objectData: this.objectData,
        content: easterEggContent,
        isEasterEgg: true,
        reward: easterEggContent.data.reward
      }
    });
    document.dispatchEvent(dustbinEvent);
    
    // Add special easter egg effect
    this.addEasterEggEffect();
    
    // Call parent method for standard interaction handling
    super.executeInteraction();
  }
  
  addEasterEggEffect() {
    // Add special celebration animation
    this.element.classList.add('easter-egg-found');
    
    // Create confetti effect
    const confetti = document.createElement('div');
    confetti.className = 'easter-egg-confetti';
    confetti.innerHTML = '🎉🎊✨🌟💫';
    this.element.appendChild(confetti);
    
    // Add bounce animation
    this.element.style.animation = 'bounce 0.6s ease-in-out 3';
    
    setTimeout(() => {
      this.element.classList.remove('easter-egg-found');
      this.element.style.animation = '';
      if (confetti.parentNode) {
        confetti.parentNode.removeChild(confetti);
      }
    }, 3000);
    
    // Update accessibility to reflect discovery
    this.updateEasterEggState();
  }
  
  updateEasterEggState() {
    if (this.hasBeenFound) {
      // Update aria-label to reflect discovery
      const baseLabel = this.objectData.accessibility.label;
      const discoveryLabel = `${baseLabel} - Easter egg discovered!`;
      this.element.setAttribute('aria-label', discoveryLabel);
      
      // Add discovered class
      this.element.classList.add('easter-egg-discovered');
    }
  }
  
  // Method to get easter egg content
  getEasterEggContent() {
    return this.contentData.content.personal.easter_egg;
  }
  
  // Method to check if easter egg has been found
  isFound() {
    return this.hasBeenFound;
  }
  
  // Method to get the reward message
  getReward() {
    const easterEgg = this.getEasterEggContent();
    return easterEgg ? easterEgg.data.reward : null;
  }
  
  // Method to get the easter egg message
  getMessage() {
    const easterEgg = this.getEasterEggContent();
    return easterEgg ? easterEgg.data.message : null;
  }
}