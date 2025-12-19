// Recruiter Mode - Linear content presentation
import { ContentRenderer } from '../../utils/contentRenderer.js';

export default class RecruiterMode {
  constructor(contentData, stateManager) {
    this.contentData = contentData;
    this.stateManager = stateManager;
    this.container = null;
    this.contentRenderer = new ContentRenderer(contentData);
  }

  /**
   * Initialize and render the recruiter mode
   * @param {HTMLElement} container - Container element to render into
   */
  render(container) {
    this.container = container;
    
    // Clear existing content
    this.container.innerHTML = '';
    
    // Add recruiter mode class
    this.container.className = 'room-container room-recruiter';
    
    // Set up ARIA attributes for accessibility
    this.container.setAttribute('role', 'main');
    this.container.setAttribute('aria-label', 'Linear presentation of professional content');
    this.container.setAttribute('tabindex', '0');
    
    // Create the linear content layout
    this.createLinearLayout();
  }

  /**
   * Create the linear content layout displaying all professional sections
   */
  createLinearLayout() {
    // Create main content wrapper
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'recruiter-content';
    contentWrapper.setAttribute('role', 'document');
    
    // Add title
    const title = document.createElement('h1');
    title.className = 'recruiter-title';
    title.textContent = 'Professional Information';
    title.setAttribute('id', 'recruiter-title');
    contentWrapper.appendChild(title);
    
    // Add description
    const description = document.createElement('p');
    description.className = 'recruiter-description';
    description.textContent = 'Complete professional information presented in a linear format for easy review.';
    contentWrapper.appendChild(description);
    
    // Get professional content
    const professionalContent = this.contentData?.content?.professional;
    if (!professionalContent) {
      this.renderError(contentWrapper, 'Professional content not available');
      this.container.appendChild(contentWrapper);
      return;
    }
    
    // Render all professional sections sequentially
    this.renderProfessionalSections(contentWrapper, professionalContent);
    
    // Add personal highlights section (non-locked content only)
    this.renderPersonalHighlights(contentWrapper);
    
    this.container.appendChild(contentWrapper);
    
    // Set focus to the title for screen readers
    title.focus();
    
    // Announce mode activation
    this.announceToScreenReader('Recruiter mode activated. All professional content is now displayed in linear format.');
  }

  /**
   * Render all professional sections in order
   * @param {HTMLElement} container - Container to render into
   * @param {Object} professionalContent - Professional content data
   */
  renderProfessionalSections(container, professionalContent) {
    // Define the order of sections
    const sectionOrder = ['resume', 'experience', 'projects', 'skills'];
    
    sectionOrder.forEach(sectionKey => {
      const sectionData = professionalContent[sectionKey];
      if (sectionData) {
        this.renderProfessionalSection(container, sectionKey, sectionData);
      }
    });
  }

  /**
   * Render a single professional section
   * @param {HTMLElement} container - Container to render into
   * @param {string} sectionKey - Section key (resume, experience, etc.)
   * @param {Object} sectionData - Section data
   */
  renderProfessionalSection(container, sectionKey, sectionData) {
    const section = document.createElement('section');
    section.className = `recruiter-section recruiter-${sectionKey}`;
    section.setAttribute('aria-labelledby', `${sectionKey}-heading`);
    
    // Create section heading
    const heading = document.createElement('h2');
    heading.className = 'recruiter-section-title';
    heading.id = `${sectionKey}-heading`;
    heading.textContent = this.getSectionTitle(sectionKey);
    section.appendChild(heading);
    
    // Create content container
    const contentContainer = document.createElement('div');
    contentContainer.className = 'recruiter-section-content';
    
    try {
      // Use ContentRenderer to render the section content
      const contentRef = `professional.${sectionKey}`;
      const renderedContent = this.contentRenderer.render(contentRef);
      
      if (renderedContent) {
        contentContainer.appendChild(renderedContent);
      } else {
        this.renderError(contentContainer, `Unable to render ${sectionKey} content`);
      }
    } catch (error) {
      console.error(`Error rendering ${sectionKey} section:`, error);
      this.renderError(contentContainer, `Error loading ${sectionKey} content`);
    }
    
    section.appendChild(contentContainer);
    container.appendChild(section);
  }

  /**
   * Render personal highlights (non-locked content only)
   * @param {HTMLElement} container - Container to render into
   */
  renderPersonalHighlights(container) {
    const personalContent = this.contentData?.content?.personal;
    if (!personalContent) return;
    
    // Create personal highlights section
    const section = document.createElement('section');
    section.className = 'recruiter-section recruiter-personal';
    section.setAttribute('aria-labelledby', 'personal-heading');
    
    const heading = document.createElement('h2');
    heading.className = 'recruiter-section-title';
    heading.id = 'personal-heading';
    heading.textContent = 'Personal Insights';
    section.appendChild(heading);
    
    const contentContainer = document.createElement('div');
    contentContainer.className = 'recruiter-section-content';
    
    // Only include non-locked personal content
    const allowedPersonalSections = [
      'environment', 'journey', 'thinking', 'reading', 
      'activities', 'time'
    ];
    
    allowedPersonalSections.forEach(sectionKey => {
      const sectionData = personalContent[sectionKey];
      if (sectionData) {
        this.renderPersonalSection(contentContainer, sectionKey, sectionData);
      }
    });
    
    // Note about locked content
    const lockedNote = document.createElement('div');
    lockedNote.className = 'recruiter-note';
    lockedNote.innerHTML = `
      <p><strong>Note:</strong> Some personal content (like entertainment preferences) 
      requires puzzle completion in interactive mode but is not essential for professional evaluation.</p>
    `;
    contentContainer.appendChild(lockedNote);
    
    section.appendChild(contentContainer);
    container.appendChild(section);
  }

  /**
   * Render a personal section
   * @param {HTMLElement} container - Container to render into
   * @param {string} sectionKey - Section key
   * @param {Object} sectionData - Section data
   */
  renderPersonalSection(container, sectionKey, sectionData) {
    const subsection = document.createElement('div');
    subsection.className = `recruiter-subsection recruiter-personal-${sectionKey}`;
    
    const subheading = document.createElement('h3');
    subheading.className = 'recruiter-subsection-title';
    subheading.textContent = sectionData.title || this.getSectionTitle(sectionKey);
    subsection.appendChild(subheading);
    
    try {
      const contentRef = `personal.${sectionKey}`;
      const renderedContent = this.contentRenderer.render(contentRef);
      
      if (renderedContent) {
        subsection.appendChild(renderedContent);
      } else {
        this.renderError(subsection, `Unable to render ${sectionKey} content`);
      }
    } catch (error) {
      console.error(`Error rendering personal ${sectionKey} section:`, error);
      this.renderError(subsection, `Error loading ${sectionKey} content`);
    }
    
    container.appendChild(subsection);
  }

  /**
   * Get human-readable section title
   * @param {string} sectionKey - Section key
   * @returns {string} Human-readable title
   */
  getSectionTitle(sectionKey) {
    const titles = {
      resume: 'Resume & Background',
      experience: 'Work Experience',
      projects: 'Projects & Portfolio',
      skills: 'Skills & Expertise',
      environment: 'Work Environment Preferences',
      journey: 'Professional Journey',
      thinking: 'Problem-Solving Approach',
      reading: 'Professional Development',
      activities: 'Work-Life Balance',
      time: 'Time Management Philosophy'
    };
    
    return titles[sectionKey] || sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1);
  }

  /**
   * Render error message
   * @param {HTMLElement} container - Container to render into
   * @param {string} message - Error message
   */
  renderError(container, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'content-error';
    errorDiv.textContent = message;
    container.appendChild(errorDiv);
  }

  /**
   * Announce message to screen readers
   * @param {string} message - Message to announce
   */
  announceToScreenReader(message) {
    if (!message) return;
    
    const announcements = document.getElementById('announcements');
    if (announcements) {
      announcements.textContent = message;
      
      // Clear the announcement after a delay
      setTimeout(() => {
        announcements.textContent = '';
      }, 1000);
    }
  }

  /**
   * Clean up the recruiter mode
   */
  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
      this.container.className = 'room-container';
    }
  }

  /**
   * Update content data
   * @param {Object} newContentData - New content data
   */
  updateContent(newContentData) {
    this.contentData = newContentData;
    this.contentRenderer.updateContentData(newContentData);
    if (this.container) {
      this.render(this.container);
    }
  }
}