// Content Rendering System - Handles JSON content loading and rendering
export class ContentRenderer {
  constructor(contentData = {}) {
    this.contentData = contentData;
    this.renderers = new Map();
    
    // Register default renderers
    this.registerDefaultRenderers();
  }
  
  registerDefaultRenderers() {
    // Text content renderer
    this.registerRenderer('text', (data, options = {}) => {
      const container = document.createElement('div');
      container.className = 'content-text';
      
      if (data.title) {
        const title = document.createElement('h3');
        title.className = 'content-title';
        title.textContent = data.title;
        container.appendChild(title);
      }
      
      if (data.content) {
        const content = document.createElement('p');
        content.className = 'content-body';
        content.textContent = data.content;
        container.appendChild(content);
      }
      
      // Handle additional data
      if (data.data && typeof data.data === 'object') {
        this.renderDataSection(container, data.data);
      }
      
      return container;
    });
    
    // List content renderer
    this.registerRenderer('list', (data, options = {}) => {
      const container = document.createElement('div');
      container.className = 'content-list';
      
      if (data.title) {
        const title = document.createElement('h3');
        title.className = 'content-title';
        title.textContent = data.title;
        container.appendChild(title);
      }
      
      if (data.content) {
        const description = document.createElement('p');
        description.className = 'content-description';
        description.textContent = data.content;
        container.appendChild(description);
      }
      
      if (data.data) {
        this.renderListData(container, data.data);
      }
      
      return container;
    });
    
    // Markdown content renderer
    this.registerRenderer('markdown', (data, options = {}) => {
      const container = document.createElement('div');
      container.className = 'content-markdown';
      
      if (data.title) {
        const title = document.createElement('h3');
        title.className = 'content-title';
        title.textContent = data.title;
        container.appendChild(title);
      }
      
      if (data.content) {
        const content = document.createElement('div');
        content.className = 'content-body';
        content.innerHTML = this.parseMarkdown(data.content);
        container.appendChild(content);
      }
      
      if (data.data && data.data.methodology) {
        this.renderMethodology(container, data.data.methodology);
      } else if (data.data && data.data.principles) {
        this.renderPrinciples(container, data.data.principles);
      }
      
      return container;
    });
    
    // Professional content renderer (complex structured content)
    this.registerRenderer('professional', (data, options = {}) => {
      const container = document.createElement('div');
      container.className = 'content-professional';
      
      // Render resume section
      if (data.resume) {
        container.appendChild(this.renderResume(data.resume));
      }
      
      // Render experience section
      if (data.experience) {
        container.appendChild(this.renderExperience(data.experience));
      }
      
      // Render projects section
      if (data.projects) {
        container.appendChild(this.renderProjects(data.projects));
      }
      
      // Render skills section
      if (data.skills) {
        container.appendChild(this.renderSkills(data.skills));
      }
      
      return container;
    });
  }
  
  registerRenderer(type, rendererFunction) {
    this.renderers.set(type, rendererFunction);
  }
  
  render(contentRef, options = {}) {
    const content = this.getContentByRef(contentRef);
    if (!content) {
      return this.renderError(`Content not found: ${contentRef}`);
    }
    
    const type = content.type || 'text';
    const renderer = this.renderers.get(type);
    
    if (!renderer) {
      return this.renderError(`No renderer found for type: ${type}`);
    }
    
    try {
      return renderer(content, options);
    } catch (error) {
      console.error('Content rendering error:', error);
      return this.renderError(`Error rendering content: ${error.message}`);
    }
  }
  
  getContentByRef(contentRef) {
    if (!contentRef || !this.contentData) return null;
    
    // Handle nested references like "personal.environment"
    const parts = contentRef.split('.');
    let current = this.contentData.content || this.contentData;
    
    for (const part of parts) {
      if (current && typeof current === 'object' && current[part] !== undefined) {
        current = current[part];
      } else {
        return null;
      }
    }
    
    return current;
  }
  
  renderError(message) {
    const container = document.createElement('div');
    container.className = 'content-error';
    container.innerHTML = `
      <h3>Content Error</h3>
      <p>${message}</p>
    `;
    return container;
  }
  
  renderDataSection(container, data) {
    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        this.renderArray(container, key, value);
      } else if (typeof value === 'object') {
        this.renderObject(container, key, value);
      } else {
        this.renderKeyValue(container, key, value);
      }
    });
  }
  
  renderListData(container, data) {
    if (data.categories) {
      // Render categorized lists (like reading list)
      data.categories.forEach(category => {
        const categorySection = document.createElement('div');
        categorySection.className = 'content-category';
        
        const categoryTitle = document.createElement('h4');
        categoryTitle.className = 'category-title';
        categoryTitle.textContent = category.name;
        categorySection.appendChild(categoryTitle);
        
        if (category.books) {
          const booksList = document.createElement('ul');
          booksList.className = 'books-list';
          category.books.forEach(book => {
            const bookItem = document.createElement('li');
            bookItem.textContent = book;
            booksList.appendChild(bookItem);
          });
          categorySection.appendChild(booksList);
        }
        
        container.appendChild(categorySection);
      });
    } else if (data.locations) {
      // Render journey locations
      const locationsContainer = document.createElement('div');
      locationsContainer.className = 'journey-locations';
      
      data.locations.forEach(location => {
        const locationCard = document.createElement('div');
        locationCard.className = 'location-card';
        
        const locationHeader = document.createElement('div');
        locationHeader.className = 'location-header';
        
        const locationName = document.createElement('h4');
        locationName.textContent = location.name;
        locationHeader.appendChild(locationName);
        
        const locationYear = document.createElement('span');
        locationYear.className = 'location-year';
        locationYear.textContent = location.year;
        locationHeader.appendChild(locationYear);
        
        const locationDescription = document.createElement('p');
        locationDescription.textContent = location.description;
        
        locationCard.appendChild(locationHeader);
        locationCard.appendChild(locationDescription);
        locationsContainer.appendChild(locationCard);
      });
      
      container.appendChild(locationsContainer);
    } else if (data.activities) {
      // Render activities
      const activitiesContainer = document.createElement('div');
      activitiesContainer.className = 'activities-list';
      
      data.activities.forEach(activity => {
        const activityCard = document.createElement('div');
        activityCard.className = 'activity-card';
        
        const activityName = document.createElement('h4');
        activityName.textContent = activity.name;
        activityCard.appendChild(activityName);
        
        const activityDescription = document.createElement('p');
        activityDescription.textContent = activity.description;
        activityCard.appendChild(activityDescription);
        
        const activityFrequency = document.createElement('span');
        activityFrequency.className = 'activity-frequency';
        activityFrequency.textContent = activity.frequency;
        activityCard.appendChild(activityFrequency);
        
        activitiesContainer.appendChild(activityCard);
      });
      
      container.appendChild(activitiesContainer);
    } else if (data.shows || data.movies) {
      // Render entertainment content
      if (data.shows) {
        const showsSection = document.createElement('div');
        showsSection.className = 'entertainment-section';
        
        const showsTitle = document.createElement('h4');
        showsTitle.textContent = 'Favorite Shows';
        showsSection.appendChild(showsTitle);
        
        const showsList = document.createElement('ul');
        data.shows.forEach(show => {
          const showItem = document.createElement('li');
          showItem.textContent = show;
          showsList.appendChild(showItem);
        });
        showsSection.appendChild(showsList);
        container.appendChild(showsSection);
      }
      
      if (data.movies) {
        const moviesSection = document.createElement('div');
        moviesSection.className = 'entertainment-section';
        
        const moviesTitle = document.createElement('h4');
        moviesTitle.textContent = 'Favorite Movies';
        moviesSection.appendChild(moviesTitle);
        
        const moviesList = document.createElement('ul');
        data.movies.forEach(movie => {
          const movieItem = document.createElement('li');
          movieItem.textContent = movie;
          moviesList.appendChild(movieItem);
        });
        moviesSection.appendChild(moviesList);
        container.appendChild(moviesSection);
      }
    } else if (data.views) {
      // Render environment views
      const viewsContainer = document.createElement('div');
      viewsContainer.className = 'environment-views';
      
      data.views.forEach(view => {
        const viewCard = document.createElement('div');
        viewCard.className = 'view-card';
        
        const viewName = document.createElement('h4');
        viewName.textContent = view.name;
        viewCard.appendChild(viewName);
        
        const viewDescription = document.createElement('p');
        viewDescription.textContent = view.description;
        viewCard.appendChild(viewDescription);
        
        const viewPreference = document.createElement('em');
        viewPreference.textContent = view.preference;
        viewCard.appendChild(viewPreference);
        
        viewsContainer.appendChild(viewCard);
      });
      
      container.appendChild(viewsContainer);
    }
  }
  
  renderMethodology(container, methodology) {
    const methodologySection = document.createElement('div');
    methodologySection.className = 'methodology-section';
    
    const methodologyTitle = document.createElement('h4');
    methodologyTitle.textContent = 'Methodology';
    methodologySection.appendChild(methodologyTitle);
    
    const methodologyList = document.createElement('ul');
    methodologyList.className = 'methodology-list';
    
    methodology.forEach(step => {
      const stepItem = document.createElement('li');
      stepItem.innerHTML = this.parseMarkdown(step);
      methodologyList.appendChild(stepItem);
    });
    
    methodologySection.appendChild(methodologyList);
    container.appendChild(methodologySection);
  }
  
  renderPrinciples(container, principles) {
    const principlesSection = document.createElement('div');
    principlesSection.className = 'principles-section';
    
    const principlesTitle = document.createElement('h4');
    principlesTitle.textContent = 'Principles';
    principlesSection.appendChild(principlesTitle);
    
    const principlesList = document.createElement('ul');
    principlesList.className = 'principles-list';
    
    principles.forEach(principle => {
      const principleItem = document.createElement('li');
      principleItem.innerHTML = this.parseMarkdown(principle);
      principlesList.appendChild(principleItem);
    });
    
    principlesSection.appendChild(principlesList);
    container.appendChild(principlesSection);
  }
  
  renderResume(resume) {
    const section = document.createElement('section');
    section.className = 'resume-section';
    
    const title = document.createElement('h3');
    title.textContent = 'Resume';
    section.appendChild(title);
    
    // Summary
    if (resume.summary) {
      const summary = document.createElement('div');
      summary.className = 'resume-summary';
      
      const summaryTitle = document.createElement('h4');
      summaryTitle.textContent = 'Professional Summary';
      summary.appendChild(summaryTitle);
      
      const summaryText = document.createElement('p');
      summaryText.textContent = resume.summary;
      summary.appendChild(summaryText);
      
      section.appendChild(summary);
    }
    
    // Contact information
    if (resume.contact) {
      const contact = document.createElement('div');
      contact.className = 'resume-contact';
      
      const contactTitle = document.createElement('h4');
      contactTitle.textContent = 'Contact Information';
      contact.appendChild(contactTitle);
      
      const contactList = document.createElement('ul');
      Object.entries(resume.contact).forEach(([key, value]) => {
        const contactItem = document.createElement('li');
        if (key === 'email') {
          contactItem.innerHTML = `<strong>Email:</strong> <a href="mailto:${value}">${value}</a>`;
        } else if (key === 'phone') {
          contactItem.innerHTML = `<strong>Phone:</strong> <a href="tel:${value}">${value}</a>`;
        } else if (key === 'linkedin' || key === 'github' || key === 'website') {
          contactItem.innerHTML = `<strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong> <a href="${value}" target="_blank" rel="noopener">${value}</a>`;
        } else {
          contactItem.innerHTML = `<strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong> ${value}`;
        }
        contactList.appendChild(contactItem);
      });
      contact.appendChild(contactList);
      section.appendChild(contact);
    }
    
    // Education
    if (resume.education) {
      const education = document.createElement('div');
      education.className = 'resume-education';
      
      const educationTitle = document.createElement('h4');
      educationTitle.textContent = 'Education';
      education.appendChild(educationTitle);
      
      resume.education.forEach(edu => {
        const eduItem = document.createElement('div');
        eduItem.className = 'education-item';
        
        const eduHeader = document.createElement('div');
        eduHeader.className = 'education-header';
        eduHeader.innerHTML = `
          <strong>${edu.degree} in ${edu.field}</strong>
          <span class="education-year">${edu.year}</span>
        `;
        eduItem.appendChild(eduHeader);
        
        const eduInstitution = document.createElement('div');
        eduInstitution.textContent = edu.institution;
        eduItem.appendChild(eduInstitution);
        
        if (edu.gpa) {
          const eduGpa = document.createElement('div');
          eduGpa.textContent = `GPA: ${edu.gpa}`;
          eduItem.appendChild(eduGpa);
        }
        
        if (edu.honors) {
          const eduHonors = document.createElement('div');
          eduHonors.textContent = `Honors: ${edu.honors.join(', ')}`;
          eduItem.appendChild(eduHonors);
        }
        
        education.appendChild(eduItem);
      });
      
      section.appendChild(education);
    }
    
    // Certifications
    if (resume.certifications) {
      const certifications = document.createElement('div');
      certifications.className = 'resume-certifications';
      
      const certificationsTitle = document.createElement('h4');
      certificationsTitle.textContent = 'Certifications';
      certifications.appendChild(certificationsTitle);
      
      const certificationsList = document.createElement('ul');
      resume.certifications.forEach(cert => {
        const certItem = document.createElement('li');
        if (cert.url) {
          certItem.innerHTML = `<a href="${cert.url}" target="_blank" rel="noopener">${cert.name}</a> - ${cert.issuer} (${cert.date})`;
        } else {
          certItem.textContent = `${cert.name} - ${cert.issuer} (${cert.date})`;
        }
        certificationsList.appendChild(certItem);
      });
      certifications.appendChild(certificationsList);
      section.appendChild(certifications);
    }
    
    return section;
  }
  
  renderExperience(experience) {
    const section = document.createElement('section');
    section.className = 'experience-section';
    
    const title = document.createElement('h3');
    title.textContent = 'Work Experience';
    section.appendChild(title);
    
    experience.forEach(job => {
      const jobItem = document.createElement('div');
      jobItem.className = 'experience-item';
      
      const jobHeader = document.createElement('div');
      jobHeader.className = 'experience-header';
      
      const jobTitle = document.createElement('h4');
      jobTitle.textContent = job.position;
      jobHeader.appendChild(jobTitle);
      
      const jobCompany = document.createElement('div');
      jobCompany.className = 'experience-company';
      jobCompany.textContent = job.company;
      jobHeader.appendChild(jobCompany);
      
      const jobDates = document.createElement('div');
      jobDates.className = 'experience-dates';
      const endDate = job.current ? 'Present' : job.endDate;
      jobDates.textContent = `${job.startDate} - ${endDate}`;
      jobHeader.appendChild(jobDates);
      
      jobItem.appendChild(jobHeader);
      
      if (job.location) {
        const jobLocation = document.createElement('div');
        jobLocation.className = 'experience-location';
        jobLocation.textContent = job.location;
        jobItem.appendChild(jobLocation);
      }
      
      if (job.description) {
        const jobDescription = document.createElement('p');
        jobDescription.className = 'experience-description';
        jobDescription.textContent = job.description;
        jobItem.appendChild(jobDescription);
      }
      
      if (job.achievements) {
        const achievements = document.createElement('div');
        achievements.className = 'experience-achievements';
        
        const achievementsTitle = document.createElement('h5');
        achievementsTitle.textContent = 'Key Achievements';
        achievements.appendChild(achievementsTitle);
        
        const achievementsList = document.createElement('ul');
        job.achievements.forEach(achievement => {
          const achievementItem = document.createElement('li');
          achievementItem.textContent = achievement;
          achievementsList.appendChild(achievementItem);
        });
        achievements.appendChild(achievementsList);
        jobItem.appendChild(achievements);
      }
      
      if (job.technologies) {
        const technologies = document.createElement('div');
        technologies.className = 'experience-technologies';
        
        const techTitle = document.createElement('h5');
        techTitle.textContent = 'Technologies Used';
        technologies.appendChild(techTitle);
        
        const techList = document.createElement('div');
        techList.className = 'tech-tags';
        job.technologies.forEach(tech => {
          const techTag = document.createElement('span');
          techTag.className = 'tech-tag';
          techTag.textContent = tech;
          techList.appendChild(techTag);
        });
        technologies.appendChild(techList);
        jobItem.appendChild(technologies);
      }
      
      section.appendChild(jobItem);
    });
    
    return section;
  }
  
  renderProjects(projects) {
    const section = document.createElement('section');
    section.className = 'projects-section';
    
    const title = document.createElement('h3');
    title.textContent = 'Projects';
    section.appendChild(title);
    
    projects.forEach(project => {
      const projectItem = document.createElement('div');
      projectItem.className = 'project-item';
      
      const projectHeader = document.createElement('div');
      projectHeader.className = 'project-header';
      
      const projectName = document.createElement('h4');
      projectName.textContent = project.name;
      projectHeader.appendChild(projectName);
      
      const projectStatus = document.createElement('span');
      projectStatus.className = `project-status status-${project.status}`;
      projectStatus.textContent = project.status;
      projectHeader.appendChild(projectStatus);
      
      projectItem.appendChild(projectHeader);
      
      if (project.description) {
        const projectDescription = document.createElement('p');
        projectDescription.className = 'project-description';
        projectDescription.textContent = project.description;
        projectItem.appendChild(projectDescription);
      }
      
      if (project.technologies) {
        const technologies = document.createElement('div');
        technologies.className = 'project-technologies';
        
        const techList = document.createElement('div');
        techList.className = 'tech-tags';
        project.technologies.forEach(tech => {
          const techTag = document.createElement('span');
          techTag.className = 'tech-tag';
          techTag.textContent = tech;
          techList.appendChild(techTag);
        });
        technologies.appendChild(techList);
        projectItem.appendChild(technologies);
      }
      
      if (project.highlights) {
        const highlights = document.createElement('div');
        highlights.className = 'project-highlights';
        
        const highlightsTitle = document.createElement('h5');
        highlightsTitle.textContent = 'Key Highlights';
        highlights.appendChild(highlightsTitle);
        
        const highlightsList = document.createElement('ul');
        project.highlights.forEach(highlight => {
          const highlightItem = document.createElement('li');
          highlightItem.textContent = highlight;
          highlightsList.appendChild(highlightItem);
        });
        highlights.appendChild(highlightsList);
        projectItem.appendChild(highlights);
      }
      
      if (project.github || project.demo) {
        const projectLinks = document.createElement('div');
        projectLinks.className = 'project-links';
        
        if (project.github) {
          const githubLink = document.createElement('a');
          githubLink.href = project.github;
          githubLink.target = '_blank';
          githubLink.rel = 'noopener';
          githubLink.textContent = 'View Code';
          githubLink.className = 'project-link';
          projectLinks.appendChild(githubLink);
        }
        
        if (project.demo) {
          const demoLink = document.createElement('a');
          demoLink.href = project.demo;
          demoLink.target = '_blank';
          demoLink.rel = 'noopener';
          demoLink.textContent = 'Live Demo';
          demoLink.className = 'project-link';
          projectLinks.appendChild(demoLink);
        }
        
        projectItem.appendChild(projectLinks);
      }
      
      section.appendChild(projectItem);
    });
    
    return section;
  }
  
  renderSkills(skills) {
    const section = document.createElement('section');
    section.className = 'skills-section';
    
    const title = document.createElement('h3');
    title.textContent = 'Skills';
    section.appendChild(title);
    
    // Technical skills
    if (skills.technical) {
      const techSkills = document.createElement('div');
      techSkills.className = 'skills-category';
      
      const techTitle = document.createElement('h4');
      techTitle.textContent = 'Technical Skills';
      techSkills.appendChild(techTitle);
      
      const techList = document.createElement('div');
      techList.className = 'skills-tags';
      skills.technical.forEach(skill => {
        const skillTag = document.createElement('span');
        skillTag.className = 'skill-tag';
        skillTag.textContent = skill;
        techList.appendChild(skillTag);
      });
      techSkills.appendChild(techList);
      section.appendChild(techSkills);
    }
    
    // Frameworks
    if (skills.frameworks) {
      const frameworks = document.createElement('div');
      frameworks.className = 'skills-category';
      
      const frameworksTitle = document.createElement('h4');
      frameworksTitle.textContent = 'Frameworks & Libraries';
      frameworks.appendChild(frameworksTitle);
      
      const frameworksList = document.createElement('div');
      frameworksList.className = 'skills-tags';
      skills.frameworks.forEach(framework => {
        const frameworkTag = document.createElement('span');
        frameworkTag.className = 'skill-tag';
        frameworkTag.textContent = framework;
        frameworksList.appendChild(frameworkTag);
      });
      frameworks.appendChild(frameworksList);
      section.appendChild(frameworks);
    }
    
    // Tools
    if (skills.tools) {
      const tools = document.createElement('div');
      tools.className = 'skills-category';
      
      const toolsTitle = document.createElement('h4');
      toolsTitle.textContent = 'Tools & Technologies';
      tools.appendChild(toolsTitle);
      
      const toolsList = document.createElement('div');
      toolsList.className = 'skills-tags';
      skills.tools.forEach(tool => {
        const toolTag = document.createElement('span');
        toolTag.className = 'skill-tag';
        toolTag.textContent = tool;
        toolsList.appendChild(toolTag);
      });
      tools.appendChild(toolsList);
      section.appendChild(tools);
    }
    
    // Languages
    if (skills.languages) {
      const languages = document.createElement('div');
      languages.className = 'skills-category';
      
      const languagesTitle = document.createElement('h4');
      languagesTitle.textContent = 'Languages';
      languages.appendChild(languagesTitle);
      
      const languagesList = document.createElement('ul');
      skills.languages.forEach(lang => {
        const langItem = document.createElement('li');
        langItem.textContent = `${lang.name} (${lang.proficiency})`;
        languagesList.appendChild(langItem);
      });
      languages.appendChild(languagesList);
      section.appendChild(languages);
    }
    
    // Soft skills
    if (skills.soft) {
      const softSkills = document.createElement('div');
      softSkills.className = 'skills-category';
      
      const softTitle = document.createElement('h4');
      softTitle.textContent = 'Soft Skills';
      softSkills.appendChild(softTitle);
      
      const softList = document.createElement('div');
      softList.className = 'skills-tags';
      skills.soft.forEach(skill => {
        const skillTag = document.createElement('span');
        skillTag.className = 'skill-tag soft-skill';
        skillTag.textContent = skill;
        softList.appendChild(skillTag);
      });
      softSkills.appendChild(softList);
      section.appendChild(softSkills);
    }
    
    return section;
  }
  
  renderArray(container, key, array) {
    const section = document.createElement('div');
    section.className = 'data-array';
    
    const title = document.createElement('h4');
    title.textContent = key.charAt(0).toUpperCase() + key.slice(1);
    section.appendChild(title);
    
    const list = document.createElement('ul');
    array.forEach(item => {
      const listItem = document.createElement('li');
      if (typeof item === 'object') {
        listItem.textContent = JSON.stringify(item);
      } else {
        listItem.textContent = item;
      }
      list.appendChild(listItem);
    });
    section.appendChild(list);
    container.appendChild(section);
  }
  
  renderObject(container, key, obj) {
    const section = document.createElement('div');
    section.className = 'data-object';
    
    const title = document.createElement('h4');
    title.textContent = key.charAt(0).toUpperCase() + key.slice(1);
    section.appendChild(title);
    
    Object.entries(obj).forEach(([subKey, subValue]) => {
      this.renderKeyValue(section, subKey, subValue);
    });
    
    container.appendChild(section);
  }
  
  renderKeyValue(container, key, value) {
    const item = document.createElement('div');
    item.className = 'data-item';
    
    const keySpan = document.createElement('strong');
    keySpan.textContent = `${key}: `;
    item.appendChild(keySpan);
    
    const valueSpan = document.createElement('span');
    valueSpan.textContent = value;
    item.appendChild(valueSpan);
    
    container.appendChild(item);
  }
  
  parseMarkdown(text) {
    if (!text) return '';
    
    // Simple markdown parsing for basic formatting
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }
  
  // Method to update content data
  updateContentData(newContentData) {
    this.contentData = newContentData;
  }
  
  // Method to get available content references
  getAvailableRefs() {
    const refs = [];
    
    const traverse = (obj, prefix = '') => {
      Object.keys(obj).forEach(key => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          if (obj[key].type || obj[key].title || obj[key].content) {
            refs.push(fullKey);
          } else {
            traverse(obj[key], fullKey);
          }
        }
      });
    };
    
    if (this.contentData && this.contentData.content) {
      traverse(this.contentData.content);
    }
    
    return refs;
  }
}

// Export the class as default
export default ContentRenderer;