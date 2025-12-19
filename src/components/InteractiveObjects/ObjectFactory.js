// Object Factory - Creates specific interactive object instances
import InteractiveObject from './index.js';
import LaptopObject from './LaptopObject.js';
import WindowObject from './WindowObject.js';
import MapObject from './MapObject.js';
import NotebookObject from './NotebookObject.js';
import BookshelfObject from './BookshelfObject.js';
import TVObject from './TVObject.js';
import SportsGearObject from './SportsGearObject.js';
import ClockObject from './ClockObject.js';
import DustbinObject from './DustbinObject.js';

export default class ObjectFactory {
  static createObject(objectData, contentData, interactionData, stateManager) {
    switch (objectData.id) {
      case 'laptop':
        return new LaptopObject(objectData, contentData, interactionData, stateManager);
      
      case 'window':
        return new WindowObject(objectData, contentData, interactionData, stateManager);
      
      case 'map':
        return new MapObject(objectData, contentData, interactionData, stateManager);
      
      case 'notebook':
        return new NotebookObject(objectData, contentData, interactionData, stateManager);
      
      case 'bookshelf':
        return new BookshelfObject(objectData, contentData, interactionData, stateManager);
      
      case 'tv':
        return new TVObject(objectData, contentData, interactionData, stateManager);
      
      case 'sports_gear':
        return new SportsGearObject(objectData, contentData, interactionData, stateManager);
      
      case 'clock':
        return new ClockObject(objectData, contentData, interactionData, stateManager);
      
      case 'dustbin':
        return new DustbinObject(objectData, contentData, interactionData, stateManager);
      
      default:
        // Fallback to base InteractiveObject for unknown types
        console.warn(`Unknown object type: ${objectData.id}, using base InteractiveObject`);
        return new InteractiveObject(objectData, contentData, interactionData, stateManager);
    }
  }
  
  // Method to get available object types
  static getAvailableTypes() {
    return [
      'laptop',
      'window', 
      'map',
      'notebook',
      'bookshelf',
      'tv',
      'sports_gear',
      'clock',
      'dustbin'
    ];
  }
  
  // Method to check if object type is supported
  static isSupported(objectId) {
    return this.getAvailableTypes().includes(objectId);
  }
}