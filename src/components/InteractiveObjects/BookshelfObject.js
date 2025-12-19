// Bookshelf Object - Reading list
import InteractiveObject from './index.js';

export default class BookshelfObject extends InteractiveObject {
  constructor(objectData, contentData, interactionData, stateManager) {
    super(objectData, contentData, interactionData, stateManager);
    this.selectedCategory = null;
  }
  
  executeInteraction() {
    // Get reading content
    const readingContent = this.contentData.content.personal.reading;
    
    if (!readingContent) {
      console.warn('Reading content not found');
      return;
    }
    
    // Emit specialized event for bookshelf interaction
    const bookshelfEvent = new CustomEvent('bookshelfInteraction', {
      detail: {
        objectId: this.objectData.id,
        objectData: this.objectData,
        content: readingContent,
        categories: readingContent.data.categories,
        selectedCategory: this.selectedCategory
      }
    });
    document.dispatchEvent(bookshelfEvent);
    
    // Call parent method for standard interaction handling
    super.executeInteraction();
  }
  
  // Method to select a book category
  selectCategory(categoryName) {
    const readingContent = this.getReadingContent();
    if (readingContent && readingContent.data.categories) {
      const category = readingContent.data.categories.find(
        cat => cat.name === categoryName
      );
      
      if (category) {
        this.selectedCategory = category;
        this.updateCategoryState();
        
        // Emit category selection event
        const categoryEvent = new CustomEvent('categorySelected', {
          detail: {
            objectId: this.objectData.id,
            category: category
          }
        });
        document.dispatchEvent(categoryEvent);
      }
    }
  }
  
  updateCategoryState() {
    if (this.selectedCategory) {
      // Update aria-label to reflect selected category
      const baseLabel = this.objectData.accessibility.label;
      const categoryLabel = `${baseLabel} - Currently viewing ${this.selectedCategory.name} books`;
      this.element.setAttribute('aria-label', categoryLabel);
      
      // Add selected category class
      this.element.classList.add('category-selected');
    } else {
      this.element.classList.remove('category-selected');
    }
  }
  
  // Method to get reading content
  getReadingContent() {
    return this.contentData.content.personal.reading;
  }
  
  // Method to get all categories
  getCategories() {
    const reading = this.getReadingContent();
    return reading ? reading.data.categories : [];
  }
  
  // Method to get books from a specific category
  getBooksFromCategory(categoryName) {
    const categories = this.getCategories();
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.books : [];
  }
  
  // Method to get selected category
  getSelectedCategory() {
    return this.selectedCategory;
  }
  
  // Method to clear category selection
  clearSelection() {
    this.selectedCategory = null;
    this.updateCategoryState();
  }
}