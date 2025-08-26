import type { Wine, CollectionBadge } from '@/types/wine';

// Local Storage Keys
const STORAGE_KEYS = {
  WINES: 'wine_pokedex_wines',
  COLLECTION: 'wine_pokedex_collection',
  BADGES: 'wine_pokedex_badges',
  SESSIONS: 'wine_pokedex_sessions',
  USER_PREFERENCES: 'wine_pokedex_preferences'
};

// Wine Storage Service
export class WineStorageService {
  // Get all wines from storage
  static getWines(): Wine[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WINES);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading wines from storage:', error);
      return [];
    }
  }

  // Save wines to storage
  static saveWines(wines: Wine[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEYS.WINES, JSON.stringify(wines));
    } catch (error) {
      console.error('Error saving wines to storage:', error);
    }
  }

  // Add a new wine
  static addWine(wine: Omit<Wine, 'id' | 'dateAdded' | 'experiencePoints'>): Wine {
    const wines = this.getWines();
    const newWine: Wine = {
      ...wine,
      id: Date.now(),
      dateAdded: new Date(),
      experiencePoints: this.calculateExperiencePoints(wine)
    };
    
    wines.push(newWine);
    this.saveWines(wines);
    
    // Update collection stats
    this.updateCollectionStats();
    
    // Check for new badges
    this.checkForNewBadges(newWine);
    
    return newWine;
  }

  // Update existing wine
  static updateWine(id: number, updates: Partial<Wine>): Wine | null {
    const wines = this.getWines();
    const index = wines.findIndex(wine => wine.id === id);
    
    if (index === -1) return null;
    
    wines[index] = { ...wines[index], ...updates };
    this.saveWines(wines);
    
    return wines[index];
  }

  // Delete wine
  static deleteWine(id: number): boolean {
    const wines = this.getWines();
    const filteredWines = wines.filter(wine => wine.id !== id);
    
    if (filteredWines.length === wines.length) return false;
    
    this.saveWines(filteredWines);
    this.updateCollectionStats();
    return true;
  }

  // Get wine by ID
  static getWineById(id: number): Wine | null {
    const wines = this.getWines();
    return wines.find(wine => wine.id === id) || null;
  }

  // Search wines
  static searchWines(query: string): Wine[] {
    const wines = this.getWines();
    const searchTerm = query.toLowerCase();
    
    return wines.filter(wine =>
      wine.name.toLowerCase().includes(searchTerm) ||
      wine.region.toLowerCase().includes(searchTerm) ||
      wine.producer.toLowerCase().includes(searchTerm) ||
      wine.grape.toLowerCase().includes(searchTerm) ||
      wine.tastingNotes.toLowerCase().includes(searchTerm) ||
      wine.year.toString().includes(searchTerm)
    );
  }

  // Filter wines by category
  static filterWines(filters: {
    type?: string;
    region?: string;
    grape?: string;
    yearRange?: [number, number];
    ratingMin?: number;
    rarity?: string;
  }): Wine[] {
    const wines = this.getWines();
    
    return wines.filter(wine => {
      if (filters.type && wine.type !== filters.type) return false;
      if (filters.region && wine.region !== filters.region) return false;
      if (filters.grape && wine.grape !== filters.grape) return false;
      if (filters.yearRange && (wine.year < filters.yearRange[0] || wine.year > filters.yearRange[1])) return false;
      if (filters.ratingMin && wine.rating < filters.ratingMin) return false;
      if (filters.rarity && wine.rarity !== filters.rarity) return false;
      
      return true;
    });
  }

  // Get collection statistics
  static getCollectionStats() {
    const wines = this.getWines();
    const badges = this.getBadges();
    
    const stats = {
      totalWines: wines.length,
      totalExperience: wines.reduce((sum, wine) => sum + wine.experiencePoints, 0),
      averageRating: wines.length > 0 ? wines.reduce((sum, wine) => sum + wine.rating, 0) / wines.length : 0,
      uniqueRegions: new Set(wines.map(wine => wine.region)).size,
      uniqueGrapes: new Set(wines.map(wine => wine.grape)).size,
      uniqueProducers: new Set(wines.map(wine => wine.producer)).size,
      vintageRange: wines.length > 0 ? {
        oldest: Math.min(...wines.map(wine => wine.year)),
        newest: Math.max(...wines.map(wine => wine.year))
      } : null,
      rarityDistribution: wines.reduce((acc, wine) => {
        acc[wine.rarity] = (acc[wine.rarity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      level: this.calculateLevel(wines.reduce((sum, wine) => sum + wine.experiencePoints, 0)),
      badges: badges.length
    };
    
    return stats;
  }

  // Calculate experience points for a wine
  private static calculateExperiencePoints(wine: Wine): number {
    let points = 100; // Base points
    
    // Bonus points for rarity
    const rarityMultiplier = {
      'Common': 1,
      'Uncommon': 1.5,
      'Rare': 2,
      'Epic': 3,
      'Legendary': 5
    };
    points *= (rarityMultiplier[wine.rarity as keyof typeof rarityMultiplier] || 1);
    
    // Bonus for age
    const currentYear = new Date().getFullYear();
    const age = currentYear - wine.year;
    if (age > 20) points += 50;
    else if (age > 10) points += 25;
    else if (age > 5) points += 10;
    
    // Bonus for high rating
    if (wine.rating >= 4) points += 25;
    if (wine.rating === 5) points += 50;
    
    return Math.round(points);
  }

  // Calculate level from experience points
  private static calculateLevel(experiencePoints: number): number {
    return Math.floor(Math.sqrt(experiencePoints / 100)) + 1;
  }

  // Badge Management
  static getBadges(): CollectionBadge[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BADGES);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading badges:', error);
      return [];
    }
  }

  static saveBadges(badges: CollectionBadge[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(badges));
    } catch (error) {
      console.error('Error saving badges:', error);
    }
  }

  // Check for new badges after adding a wine
  private static checkForNewBadges(newWine: Wine): CollectionBadge[] {
    const wines = this.getWines();
    const existingBadges = this.getBadges();
    const newBadges: CollectionBadge[] = [];
    
    // First Wine Badge
    if (wines.length === 1 && !existingBadges.find(b => b.id === 'first_wine')) {
      newBadges.push({
        id: 'first_wine',
        name: 'First Catch',
        description: 'Added your first wine to the collection',
        icon: '🍷',
        earnedDate: new Date(),
        category: 'Collection'
      });
    }

    // Regional badges
    const regionCount = wines.filter(wine => wine.region === newWine.region).length;
    if (regionCount === 5 && !existingBadges.find(b => b.id === `regional_${newWine.region.replace(/\s+/g, '_')}`)) {
      newBadges.push({
        id: `regional_${newWine.region.replace(/\s+/g, '_')}`,
        name: `${newWine.region} Explorer`,
        description: `Collected 5 wines from ${newWine.region}`,
        icon: '🗺️',
        earnedDate: new Date(),
        category: 'Regional'
      });
    }

    // Grape variety badges
    const grapeCount = wines.filter(wine => wine.grape === newWine.grape).length;
    if (grapeCount === 3 && !existingBadges.find(b => b.id === `grape_${newWine.grape.replace(/\s+/g, '_')}`)) {
      newBadges.push({
        id: `grape_${newWine.grape.replace(/\s+/g, '_')}`,
        name: `${newWine.grape} Specialist`,
        description: `Collected 3 wines made from ${newWine.grape}`,
        icon: '🍇',
        earnedDate: new Date(),
        category: 'Grape'
      });
    }

    // Vintage badges
    const currentYear = new Date().getFullYear();
    const wineAge = currentYear - newWine.year;
    if (wineAge >= 20 && !existingBadges.find(b => b.id === 'vintage_collector')) {
      newBadges.push({
        id: 'vintage_collector',
        name: 'Vintage Collector',
        description: 'Added a wine that\'s 20+ years old',
        icon: '🏺',
        earnedDate: new Date(),
        category: 'Vintage'
      });
    }

    // Quality badges
    if (newWine.rating === 5 && !existingBadges.find(b => b.id === 'perfectionist')) {
      newBadges.push({
        id: 'perfectionist',
        name: 'Perfectionist',
        description: 'Awarded a perfect 5-star rating',
        icon: '⭐',
        earnedDate: new Date(),
        category: 'Tasting'
      });
    }

    // Collection size badges
    const milestones = [10, 25, 50, 100, 200, 500];
    milestones.forEach(milestone => {
      if (wines.length === milestone && !existingBadges.find(b => b.id === `collection_${milestone}`)) {
        newBadges.push({
          id: `collection_${milestone}`,
          name: `${milestone} Wine Master`,
          description: `Collected ${milestone} wines`,
          icon: '🏆',
          earnedDate: new Date(),
          category: 'Collection'
        });
      }
    });

    if (newBadges.length > 0) {
      const allBadges = [...existingBadges, ...newBadges];
      this.saveBadges(allBadges);
    }

    return newBadges;
  }

  // Update collection stats in storage
  private static updateCollectionStats(): void {
    const stats = this.getCollectionStats();
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEYS.COLLECTION, JSON.stringify(stats));
      } catch (error) {
        console.error('Error saving collection stats:', error);
      }
    }
  }

  // Export collection to JSON
  static exportCollection(): string {
    const wines = this.getWines();
    const badges = this.getBadges();
    const stats = this.getCollectionStats();
    
    const collection = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      wines,
      badges,
      stats
    };
    
    return JSON.stringify(collection, null, 2);
  }

  // Import collection from JSON
  static importCollection(jsonData: string): { success: boolean; message: string } {
    try {
      const collection = JSON.parse(jsonData);
      
      if (!collection.wines || !Array.isArray(collection.wines)) {
        return { success: false, message: 'Invalid collection format' };
      }
      
      // Backup existing data
      const existingWines = this.getWines();
      const existingBadges = this.getBadges();
      
      try {
        // Import wines
        this.saveWines(collection.wines);
        
        // Import badges if available
        if (collection.badges && Array.isArray(collection.badges)) {
          this.saveBadges(collection.badges);
        }
        
        // Update stats
        this.updateCollectionStats();
        
        return { 
          success: true, 
          message: `Successfully imported ${collection.wines.length} wines` 
        };
      } catch (importError) {
        // Restore backup on error
        this.saveWines(existingWines);
        this.saveBadges(existingBadges);
        throw importError;
      }
    } catch (_error) {
      return { 
        success: false, 
        message: 'Failed to import collection: Invalid JSON format' 
      };
    }
  }

  // Clear all data (use with caution)
  static clearAllData(): void {
    if (typeof window === 'undefined') return;
    
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

// Sample data for demo
export const sampleWines: Omit<Wine, 'id' | 'dateAdded' | 'experiencePoints'>[] = [
  {
    name: "Château Margaux",
    year: 2015,
    region: "Bordeaux, France",
    producer: "Château Margaux",
    type: "Red Wine",
    grape: "Cabernet Sauvignon Blend",
    rating: 5,
    tastingNotes: "Complex aromas of blackcurrant, cedar, and graphite with silky tannins and a long, elegant finish",
    captured: true,
    rarity: "Legendary",
    abv: 13.5,
    appearance: {
      intensity: "Deep",
      color: "Garnet with purple hues"
    },
    nose: {
      condition: "Clean",
      intensity: "Pronounced",
      developmentLevel: "Developing",
      primaryAromas: ["blackcurrant", "cassis", "violet"],
      secondaryAromas: ["cedar", "tobacco", "graphite"],
      tertiaryAromas: []
    },
    palate: {
      sweetness: "Dry",
      acidity: "Medium(+)",
      tannin: "Medium(+)",
      alcohol: "Medium",
      body: "Full",
      flavorIntensity: "Pronounced",
      flavorCharacteristics: ["dark fruit", "minerality", "spice"],
      finish: "Long"
    }
  },
  {
    name: "Domaine de la Côte Pinot Noir",
    year: 2019,
    region: "Sta. Rita Hills, California",
    producer: "Domaine de la Côte",
    type: "Red Wine",
    grape: "Pinot Noir",
    rating: 4,
    tastingNotes: "Bright cherry and strawberry with earthy undertones, silky texture and balanced acidity",
    captured: true,
    rarity: "Rare",
    abv: 14.2
  },
  {
    name: "Chablis Premier Cru Les Montmains",
    year: 2020,
    region: "Burgundy, France",
    producer: "Domaine William Fèvre",
    type: "White Wine",
    grape: "Chardonnay",
    rating: 4,
    tastingNotes: "Crisp minerality with notes of green apple, citrus, and a hint of oak. Clean, refreshing finish",
    captured: true,
    rarity: "Uncommon",
    abv: 12.5
  }
];

// Initialize sample data if no wines exist
export const initializeSampleData = (): void => {
  const existingWines = WineStorageService.getWines();
  
  if (existingWines.length === 0) {
    sampleWines.forEach(wine => {
      WineStorageService.addWine(wine);
    });
  }
};