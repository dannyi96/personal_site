// Sports Gear Object - Activities
import InteractiveObject from './index.js';

export default class SportsGearObject extends InteractiveObject {
  constructor(objectData, contentData, interactionData, stateManager) {
    super(objectData, contentData, interactionData, stateManager);
    this.selectedActivity = null;
  }
  
  executeInteraction() {
    // Get activities content
    const activitiesContent = this.contentData.content.personal.activities;
    
    if (!activitiesContent) {
      console.warn('Activities content not found');
      return;
    }
    
    // Emit specialized event for sports gear interaction
    const sportsEvent = new CustomEvent('sportsGearInteraction', {
      detail: {
        objectId: this.objectData.id,
        objectData: this.objectData,
        content: activitiesContent,
        activities: activitiesContent.data.activities,
        selectedActivity: this.selectedActivity
      }
    });
    document.dispatchEvent(sportsEvent);
    
    // Call parent method for standard interaction handling
    super.executeInteraction();
  }
  
  // Method to select a specific activity
  selectActivity(activityName) {
    const activitiesContent = this.getActivitiesContent();
    if (activitiesContent && activitiesContent.data.activities) {
      const activity = activitiesContent.data.activities.find(
        act => act.name === activityName
      );
      
      if (activity) {
        this.selectedActivity = activity;
        this.updateActivityState();
        
        // Emit activity selection event
        const activityEvent = new CustomEvent('activitySelected', {
          detail: {
            objectId: this.objectData.id,
            activity: activity
          }
        });
        document.dispatchEvent(activityEvent);
      }
    }
  }
  
  updateActivityState() {
    if (this.selectedActivity) {
      // Update aria-label to reflect selected activity
      const baseLabel = this.objectData.accessibility.label;
      const activityLabel = `${baseLabel} - Currently viewing ${this.selectedActivity.name}`;
      this.element.setAttribute('aria-label', activityLabel);
      
      // Add selected activity class
      this.element.classList.add('activity-selected');
    } else {
      this.element.classList.remove('activity-selected');
    }
  }
  
  // Method to get activities content
  getActivitiesContent() {
    return this.contentData.content.personal.activities;
  }
  
  // Method to get all activities
  getActivities() {
    const activities = this.getActivitiesContent();
    return activities ? activities.data.activities : [];
  }
  
  // Method to get selected activity
  getSelectedActivity() {
    return this.selectedActivity;
  }
  
  // Method to clear activity selection
  clearSelection() {
    this.selectedActivity = null;
    this.updateActivityState();
  }
  
  // Method to get activity by name
  getActivityByName(name) {
    const activities = this.getActivities();
    return activities.find(activity => activity.name === name);
  }
}