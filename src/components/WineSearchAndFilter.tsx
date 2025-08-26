'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  Star, 
  Calendar, 
  MapPin, 
  Grape,
  Award,
  SlidersHorizontal
} from 'lucide-react';
import type { Wine } from '@/types/wine';

interface FilterOptions {
  type: string;
  region: string;
  grape: string;
  yearFrom: string;
  yearTo: string;
  ratingMin: string;
  rarity: string;
}

interface WineSearchAndFilterProps {
  wines: Wine[];
  onFilteredWinesChange: (wines: Wine[]) => void;
  onSearchChange?: (query: string) => void;
}

export default function WineSearchAndFilter({ 
  wines, 
  onFilteredWinesChange, 
  onSearchChange 
}: WineSearchAndFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<FilterOptions>({
    type: '',
    region: '',
    grape: '',
    yearFrom: '',
    yearTo: '',
    ratingMin: '',
    rarity: ''
  });

  // Extract unique values for filter options
  const filterOptions = useMemo(() => {
    return {
      types: [...new Set(wines.map(wine => wine.type))].sort(),
      regions: [...new Set(wines.map(wine => wine.region))].sort(),
      grapes: [...new Set(wines.map(wine => wine.grape))].sort(),
      rarities: [...new Set(wines.map(wine => wine.rarity))].sort(),
      years: {
        min: Math.min(...wines.map(wine => wine.year)),
        max: Math.max(...wines.map(wine => wine.year))
      }
    };
  }, [wines]);

  // Filter and sort wines
  const filteredAndSortedWines = useMemo(() => {
    let result = wines;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(wine =>
        wine.name.toLowerCase().includes(query) ||
        wine.region.toLowerCase().includes(query) ||
        wine.producer.toLowerCase().includes(query) ||
        wine.grape.toLowerCase().includes(query) ||
        wine.tastingNotes.toLowerCase().includes(query) ||
        wine.year.toString().includes(query)
      );
    }

    // Apply filters
    if (filters.type) {
      result = result.filter(wine => wine.type === filters.type);
    }
    if (filters.region) {
      result = result.filter(wine => wine.region === filters.region);
    }
    if (filters.grape) {
      result = result.filter(wine => wine.grape === filters.grape);
    }
    if (filters.yearFrom) {
      result = result.filter(wine => wine.year >= parseInt(filters.yearFrom));
    }
    if (filters.yearTo) {
      result = result.filter(wine => wine.year <= parseInt(filters.yearTo));
    }
    if (filters.ratingMin) {
      result = result.filter(wine => wine.rating >= parseInt(filters.ratingMin));
    }
    if (filters.rarity) {
      result = result.filter(wine => wine.rarity === filters.rarity);
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue: string | number | Date = a[sortBy as keyof Wine] as string | number | Date;
      let bValue: string | number | Date = b[sortBy as keyof Wine] as string | number | Date;

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return result;
  }, [wines, searchQuery, filters, sortBy, sortOrder]);

  // Update parent component when filtered wines change
  useMemo(() => {
    onFilteredWinesChange(filteredAndSortedWines);
  }, [filteredAndSortedWines, onFilteredWinesChange]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    onSearchChange?.(query);
  };

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      region: '',
      grape: '',
      yearFrom: '',
      yearTo: '',
      ratingMin: '',
      rarity: ''
    });
    setSearchQuery('');
  };

  const activeFilterCount = Object.values(filters).filter(value => value !== '').length + (searchQuery ? 1 : 0);

  return (
    <motion.div
      className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search wines, regions, producers..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <motion.button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
              isFilterOpen 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Filter size={20} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} size={16} />
          </motion.button>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="appearance-none bg-gray-100 text-gray-700 px-4 py-3 rounded-xl font-medium border border-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer"
            >
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="year-desc">Newest First</option>
              <option value="year-asc">Oldest First</option>
              <option value="rating-desc">Highest Rated</option>
              <option value="rating-asc">Lowest Rated</option>
              <option value="region-asc">Region A-Z</option>
              <option value="producer-asc">Producer A-Z</option>
            </select>
            <SlidersHorizontal className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      <motion.div
        initial={false}
        animate={{ 
          height: isFilterOpen ? 'auto' : 0,
          opacity: isFilterOpen ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Wine Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Grape className="inline w-4 h-4 mr-1" />
                Wine Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">All Types</option>
                {filterOptions.types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Region Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline w-4 h-4 mr-1" />
                Region
              </label>
              <select
                value={filters.region}
                onChange={(e) => handleFilterChange('region', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">All Regions</option>
                {filterOptions.regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            {/* Grape Variety Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Grape className="inline w-4 h-4 mr-1" />
                Grape Variety
              </label>
              <select
                value={filters.grape}
                onChange={(e) => handleFilterChange('grape', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">All Grapes</option>
                {filterOptions.grapes.map(grape => (
                  <option key={grape} value={grape}>{grape}</option>
                ))}
              </select>
            </div>

            {/* Rarity Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Award className="inline w-4 h-4 mr-1" />
                Rarity
              </label>
              <select
                value={filters.rarity}
                onChange={(e) => handleFilterChange('rarity', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">All Rarities</option>
                {filterOptions.rarities.map(rarity => (
                  <option key={rarity} value={rarity}>{rarity}</option>
                ))}
              </select>
            </div>

            {/* Year From Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                From Year
              </label>
              <input
                type="number"
                min={filterOptions.years.min}
                max={filterOptions.years.max}
                value={filters.yearFrom}
                onChange={(e) => handleFilterChange('yearFrom', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder={`${filterOptions.years.min}`}
              />
            </div>

            {/* Year To Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                To Year
              </label>
              <input
                type="number"
                min={filterOptions.years.min}
                max={filterOptions.years.max}
                value={filters.yearTo}
                onChange={(e) => handleFilterChange('yearTo', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder={`${filterOptions.years.max}`}
              />
            </div>

            {/* Minimum Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Star className="inline w-4 h-4 mr-1" />
                Min. Rating
              </label>
              <select
                value={filters.ratingMin}
                onChange={(e) => handleFilterChange('ratingMin', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Any Rating</option>
                <option value="1">1+ Stars</option>
                <option value="2">2+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="5">5 Stars Only</option>
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          {activeFilterCount > 0 && (
            <div className="flex justify-center mt-6">
              <motion.button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X size={16} />
                Clear All Filters
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Results Summary */}
      <div className="px-4 py-3 bg-gray-50 text-sm text-gray-600">
        <div className="flex items-center justify-between">
          <span>
            Showing {filteredAndSortedWines.length} of {wines.length} wines
          </span>
          {activeFilterCount > 0 && (
            <span className="text-blue-600 font-medium">
              {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} applied
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}