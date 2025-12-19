// Map Object - Journey locations
import InteractiveObject from './index.js';

export default class MapObject extends InteractiveObject {
  constructor(objectData, contentData, interactionData, stateManager) {
    super(objectData, contentData, interactionData, stateManager);
    this.selectedLocation = null;
  }
  
  executeInteraction() {
    // Get journey content
    const journeyContent = this.contentData.content.personal.journey;
    
    if (!journeyContent) {
      console.warn('Journey content not found');
      return;
    }
    
    // Emit specialized event for map interaction
    const mapEvent = new CustomEvent('mapInteraction', {
      detail: {
        objectId: this.objectData.id,
        objectData: this.objectData,
        content: journeyContent,
        locations: journeyContent.data.locations,
        selectedLocation: this.selectedLocation
      }
    });
    document.dispatchEvent(mapEvent);
    
    // Call parent method for standard interaction handling
    super.executeInteraction();
  }
  
  // Method to select a specific location
  selectLocation(locationName) {
    const journeyContent = this.getJourneyContent();
    if (journeyContent && journeyContent.data.locations) {
      const location = journeyContent.data.locations.find(
        loc => loc.name === locationName
      );
      
      if (location) {
        this.selectedLocation = location;
        this.updateLocationState();
        
        // Emit location selection event
        const locationEvent = new CustomEvent('locationSelected', {
          detail: {
            objectId: this.objectData.id,
            location: location
          }
        });
        document.dispatchEvent(locationEvent);
      }
    }
  }
  
  updateLocationState() {
    if (this.selectedLocation) {
      // Update aria-label to reflect selected location
      const baseLabel = this.objectData.accessibility.label;
      const locationLabel = `${baseLabel} - Currently viewing ${this.selectedLocation.name}`;
      this.element.setAttribute('aria-label', locationLabel);
      
      // Add selected location class
      this.element.classList.add('location-selected');
    } else {
      this.element.classList.remove('location-selected');
    }
  }
  
  // Method to get journey content
  getJourneyContent() {
    return this.contentData.content.personal.journey;
  }
  
  // Method to get all locations
  getLocations() {
    const journey = this.getJourneyContent();
    return journey ? journey.data.locations : [];
  }
  
  // Method to get selected location
  getSelectedLocation() {
    return this.selectedLocation;
  }
  
  // Method to clear location selection
  clearSelection() {
    this.selectedLocation = null;
    this.updateLocationState();
  }
}