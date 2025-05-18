// Data model for the Portfolio Highlights section

export interface HighlightStat {
  id: string;
  icon: string;
  value: number;
  label: string;
  active: boolean;
}

export interface HighlightsConfig {
  title: string;
  description: string;
  stats: HighlightStat[];
}

// Default configuration for the highlights section
export const defaultHighlightsConfig: HighlightsConfig = {
  title: "Portfolio Highlights",
  description: "A snapshot of my professional journey and creative output across different domains",
  stats: [
    {
      id: '1',
      icon: 'computer',
      value: 48,
      label: 'Web Projects',
      active: true
    },
    {
      id: '2',
      icon: 'link',
      value: 65,
      label: 'Logo Designs',
      active: true
    },
    {
      id: '3',
      icon: '3d_rotation',
      value: 32,
      label: '3D Graphics',
      active: true
    },
    {
      id: '4',
      icon: 'calendar_today',
      value: 8,
      label: 'Years of Development',
      active: true
    },
    {
      id: '5',
      icon: 'code',
      value: 120,
      label: 'GitHub Repositories',
      active: false
    },
    {
      id: '6',
      icon: 'people',
      value: 15,
      label: 'Team Collaborations',
      active: false
    }
  ]
};

// Helper function to get the highlights configuration from localStorage
export function getHighlightsConfig(): HighlightsConfig {
  if (typeof window === 'undefined') {
    return defaultHighlightsConfig;
  }

  try {
    const storedConfig = localStorage.getItem('highlightsConfig');
    if (storedConfig) {
      return JSON.parse(storedConfig) as HighlightsConfig;
    }

    // If no config exists yet, initialize with default and save it
    localStorage.setItem('highlightsConfig', JSON.stringify(defaultHighlightsConfig));
    return defaultHighlightsConfig;
  } catch (error) {
    console.error('Error loading highlights config:', error);
    return defaultHighlightsConfig;
  }
}

// Helper function to save the highlights configuration to localStorage
export function saveHighlightsConfig(config: HighlightsConfig): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Make sure we have a valid config before saving
    if (!config || !Array.isArray(config.stats)) {
      console.error('Invalid config format, using defaults instead');
      localStorage.setItem('highlightsConfig', JSON.stringify(defaultHighlightsConfig));
    } else {
      console.log('Saving highlights config:', config);
      localStorage.setItem('highlightsConfig', JSON.stringify(config));
    }
    
    // Trigger storage events for other components to update
    try {
      window.dispatchEvent(new Event('storage'));
      document.dispatchEvent(new CustomEvent('custom-storage-event', { 
        detail: { key: 'highlightsConfig', action: 'update' } 
      }));
      console.log('Dispatched update events for highlights config');
    } catch (eventError) {
      console.error('Error dispatching events:', eventError);
    }
  } catch (error) {
    console.error('Error saving highlights config:', error);
  }
}

// For backward compatibility - migrate from old format to new format
export function migrateHighlightsData(): void {
  if (typeof window === 'undefined') return;
  
  try {
    console.log('Checking if highlights data migration is needed...');
    const storedStats = localStorage.getItem('highlightStats');
    const storedConfig = localStorage.getItem('highlightsConfig');
    
    // If we already have the new format, validate it
    if (storedConfig) {
      try {
        const config = JSON.parse(storedConfig) as HighlightsConfig;
        // Validate the config has the expected structure
        if (!config.title || !config.description || !Array.isArray(config.stats)) {
          console.warn('Found invalid highlights config, will recreate it');
          localStorage.setItem('highlightsConfig', JSON.stringify(defaultHighlightsConfig));
        } else {
          console.log('Valid highlights config found, no migration needed');
        }
        return;
      } catch (parseError) {
        console.error('Error parsing stored config, will recreate:', parseError);
        localStorage.setItem('highlightsConfig', JSON.stringify(defaultHighlightsConfig));
        return;
      }
    }
    
    // If we have old stats, migrate them to the new format
    if (storedStats) {
      console.log('Found old highlights stats format, migrating...');
      try {
        const stats = JSON.parse(storedStats) as HighlightStat[];
        const newConfig: HighlightsConfig = {
          ...defaultHighlightsConfig,
          stats: Array.isArray(stats) ? stats : defaultHighlightsConfig.stats
        };
        
        localStorage.setItem('highlightsConfig', JSON.stringify(newConfig));
        console.log('Successfully migrated highlights data to new format');
        
        // Optionally remove the old data to avoid confusion
        localStorage.removeItem('highlightStats');
      } catch (parseError) {
        console.error('Error parsing old stats during migration:', parseError);
        localStorage.setItem('highlightsConfig', JSON.stringify(defaultHighlightsConfig));
      }
    } else {
      // If no old data exists, just initialize with defaults
      console.log('No existing highlights data found, initializing with defaults');
      localStorage.setItem('highlightsConfig', JSON.stringify(defaultHighlightsConfig));
    }
    
    // Trigger events to notify components of the migration
    window.dispatchEvent(new Event('storage'));
    document.dispatchEvent(new CustomEvent('custom-storage-event', { 
      detail: { key: 'highlightsConfig', action: 'update' } 
    }));
  } catch (error) {
    console.error('Error migrating highlights data:', error);
    // Fallback to defaults in case of any error
    localStorage.setItem('highlightsConfig', JSON.stringify(defaultHighlightsConfig));
  }
}
