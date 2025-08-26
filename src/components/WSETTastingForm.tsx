'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronRight, Star, Award } from 'lucide-react';
import type { WSETTastingNote } from '@/types/wine';

interface WSETTastingFormProps {
  onSave: (tastingNote: WSETTastingNote) => void;
  initialData?: Partial<WSETTastingNote>;
}

export default function WSETTastingForm({ onSave, initialData }: WSETTastingFormProps) {
  const [expandedSections, setExpandedSections] = useState({
    appearance: true,
    nose: false,
    palate: false,
    conclusions: false
  });

  const [tastingNote, setTastingNote] = useState<WSETTastingNote>({
    appearance: {
      intensity: '',
      color: '',
      otherObservations: ''
    },
    nose: {
      condition: 'Clean',
      intensity: '',
      developmentLevel: 'Youthful',
      primaryAromas: [],
      secondaryAromas: [],
      tertiaryAromas: []
    },
    palate: {
      sweetness: '',
      acidity: '',
      tannin: '',
      alcohol: '',
      body: '',
      flavorIntensity: '',
      flavorCharacteristics: [],
      finish: ''
    },
    conclusions: {
      quality: 'Good',
      levelOfReadiness: 'Ready to Drink',
      suitableFor: ''
    },
    ...initialData
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateField = (section: keyof WSETTastingNote, field: string, value: any) => {
    setTastingNote(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const addAroma = (section: 'primaryAromas' | 'secondaryAromas' | 'tertiaryAromas', aroma: string) => {
    if (!aroma.trim()) return;
    
    setTastingNote(prev => ({
      ...prev,
      nose: {
        ...prev.nose,
        [section]: [...prev.nose[section], aroma.trim()]
      }
    }));
  };

  const removeAroma = (section: 'primaryAromas' | 'secondaryAromas' | 'tertiaryAromas', index: number) => {
    setTastingNote(prev => ({
      ...prev,
      nose: {
        ...prev.nose,
        [section]: prev.nose[section].filter((_, i) => i !== index)
      }
    }));
  };

  const intensityOptions = ['Light', 'Medium(-)', 'Medium', 'Medium(+)', 'Pronounced'];
  const sweetnessOptions = ['Bone Dry', 'Dry', 'Off-Dry', 'Medium-Dry', 'Medium-Sweet', 'Sweet', 'Lusciously Sweet'];
  const acidityOptions = ['Low', 'Medium(-)', 'Medium', 'Medium(+)', 'High'];
  const tanninOptions = ['Low', 'Medium(-)', 'Medium', 'Medium(+)', 'High'];
  const alcoholOptions = ['Low', 'Medium', 'Medium(+)', 'High'];
  const bodyOptions = ['Light', 'Medium(-)', 'Medium', 'Medium(+)', 'Full'];
  const finishOptions = ['Short', 'Medium(-)', 'Medium', 'Medium(+)', 'Long'];
  const qualityOptions = ['Faulty', 'Poor', 'Acceptable', 'Good', 'Very Good', 'Outstanding'];
  const readinessOptions = ['Too Young', 'Ready to Drink', 'Past its Best'];

  const Section = ({ 
    title, 
    sectionKey, 
    children, 
    icon 
  }: { 
    title: string; 
    sectionKey: keyof typeof expandedSections; 
    children: React.ReactNode;
    icon: React.ReactNode;
  }) => (
    <motion.div
      className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span>{title}</span>
        </div>
        {expandedSections[sectionKey] ? <ChevronDown /> : <ChevronRight />}
      </button>
      
      <motion.div
        initial={false}
        animate={{ 
          height: expandedSections[sectionKey] ? 'auto' : 0,
          opacity: expandedSections[sectionKey] ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="p-6">{children}</div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">WSET Level 3 Systematic Approach</h2>
        <p className="text-white/80">Complete wine tasting analysis</p>
      </div>

      {/* Appearance */}
      <Section 
        title="Appearance" 
        sectionKey="appearance"
        icon={<div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-red-600"></div>}
      >
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-2">Intensity</label>
            <select 
              className="w-full p-3 border rounded-lg bg-white"
              value={tastingNote.appearance.intensity}
              onChange={(e) => updateField('appearance', 'intensity', e.target.value)}
            >
              <option value="">Select intensity...</option>
              <option value="Pale">Pale</option>
              <option value="Medium">Medium</option>
              <option value="Deep">Deep</option>
            </select>
          </div>
          
          <div>
            <label className="block font-medium mb-2">Color</label>
            <input
              type="text"
              className="w-full p-3 border rounded-lg"
              placeholder="e.g., Ruby, Garnet, Purple..."
              value={tastingNote.appearance.color}
              onChange={(e) => updateField('appearance', 'color', e.target.value)}
            />
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block font-medium mb-2">Other Observations</label>
          <textarea
            className="w-full p-3 border rounded-lg resize-none"
            rows={2}
            placeholder="Clarity, sediment, gas, etc."
            value={tastingNote.appearance.otherObservations}
            onChange={(e) => updateField('appearance', 'otherObservations', e.target.value)}
          />
        </div>
      </Section>

      {/* Nose */}
      <Section 
        title="Nose" 
        sectionKey="nose"
        icon={<div className="text-2xl">👃</div>}
      >
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block font-medium mb-2">Condition</label>
            <select 
              className="w-full p-3 border rounded-lg"
              value={tastingNote.nose.condition}
              onChange={(e) => updateField('nose', 'condition', e.target.value)}
            >
              <option value="Clean">Clean</option>
              <option value="Unclean">Unclean</option>
            </select>
          </div>
          
          <div>
            <label className="block font-medium mb-2">Intensity</label>
            <select 
              className="w-full p-3 border rounded-lg"
              value={tastingNote.nose.intensity}
              onChange={(e) => updateField('nose', 'intensity', e.target.value)}
            >
              <option value="">Select intensity...</option>
              {intensityOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block font-medium mb-2">Development</label>
            <select 
              className="w-full p-3 border rounded-lg"
              value={tastingNote.nose.developmentLevel}
              onChange={(e) => updateField('nose', 'developmentLevel', e.target.value)}
            >
              <option value="Youthful">Youthful</option>
              <option value="Developing">Developing</option>
              <option value="Fully Developed">Fully Developed</option>
              <option value="Tired">Tired</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {['primaryAromas', 'secondaryAromas', 'tertiaryAromas'].map(aromaType => (
            <div key={aromaType}>
              <label className="block font-medium mb-2 capitalize">
                {aromaType.replace('Aromas', ' Aromas')}
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tastingNote.nose[aromaType as keyof typeof tastingNote.nose].map((aroma: string, index: number) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {aroma}
                    <button
                      onClick={() => removeAroma(aromaType as any, index)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                className="w-full p-3 border rounded-lg"
                placeholder="Add aroma and press Enter"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addAroma(aromaType as any, e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
          ))}
        </div>
      </Section>

      {/* Palate */}
      <Section 
        title="Palate" 
        sectionKey="palate"
        icon={<div className="text-2xl">👅</div>}
      >
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block font-medium mb-2">Sweetness</label>
            <select 
              className="w-full p-3 border rounded-lg"
              value={tastingNote.palate.sweetness}
              onChange={(e) => updateField('palate', 'sweetness', e.target.value)}
            >
              <option value="">Select sweetness...</option>
              {sweetnessOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block font-medium mb-2">Acidity</label>
            <select 
              className="w-full p-3 border rounded-lg"
              value={tastingNote.palate.acidity}
              onChange={(e) => updateField('palate', 'acidity', e.target.value)}
            >
              <option value="">Select acidity...</option>
              {acidityOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block font-medium mb-2">Tannin</label>
            <select 
              className="w-full p-3 border rounded-lg"
              value={tastingNote.palate.tannin}
              onChange={(e) => updateField('palate', 'tannin', e.target.value)}
            >
              <option value="">Select tannin...</option>
              {tanninOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block font-medium mb-2">Alcohol</label>
            <select 
              className="w-full p-3 border rounded-lg"
              value={tastingNote.palate.alcohol}
              onChange={(e) => updateField('palate', 'alcohol', e.target.value)}
            >
              <option value="">Select alcohol...</option>
              {alcoholOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block font-medium mb-2">Body</label>
            <select 
              className="w-full p-3 border rounded-lg"
              value={tastingNote.palate.body}
              onChange={(e) => updateField('palate', 'body', e.target.value)}
            >
              <option value="">Select body...</option>
              {bodyOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block font-medium mb-2">Finish</label>
            <select 
              className="w-full p-3 border rounded-lg"
              value={tastingNote.palate.finish}
              onChange={(e) => updateField('palate', 'finish', e.target.value)}
            >
              <option value="">Select finish...</option>
              {finishOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>
      </Section>

      {/* Conclusions */}
      <Section 
        title="Conclusions" 
        sectionKey="conclusions"
        icon={<Award className="w-6 h-6" />}
      >
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-2">Quality Level</label>
            <select 
              className="w-full p-3 border rounded-lg"
              value={tastingNote.conclusions.quality}
              onChange={(e) => updateField('conclusions', 'quality', e.target.value)}
            >
              {qualityOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block font-medium mb-2">Readiness for Drinking</label>
            <select 
              className="w-full p-3 border rounded-lg"
              value={tastingNote.conclusions.levelOfReadiness}
              onChange={(e) => updateField('conclusions', 'levelOfReadiness', e.target.value)}
            >
              {readinessOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block font-medium mb-2">Suitable For</label>
          <textarea
            className="w-full p-3 border rounded-lg resize-none"
            rows={2}
            placeholder="Food pairing suggestions, occasion, etc."
            value={tastingNote.conclusions.suitableFor}
            onChange={(e) => updateField('conclusions', 'suitableFor', e.target.value)}
          />
        </div>
      </Section>

      <motion.div 
        className="text-center pt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button
          onClick={() => onSave(tastingNote)}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full font-semibold shadow-lg mx-auto"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Star size={20} />
          Save Tasting Note
        </motion.button>
      </motion.div>
    </div>
  );
}