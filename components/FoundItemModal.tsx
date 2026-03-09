import React, { useState } from 'react';
import { X, Upload, Sparkles, Loader2 } from 'lucide-react';
import { FoundItem, ItemCategory } from '../types';
import { CATEGORIES } from '../constants';
import { generateItemDescription } from '../services/geminiService';

interface FoundItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: Omit<FoundItem, 'id' | 'userId'>) => void;
}

export const FoundItemModal: React.FC<FoundItemModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    dateFound: new Date().toISOString().split('T')[0],
    category: ItemCategory.OTHER,
    contactInfo: '',
    finderName: '',
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAiGenerate = async () => {
    if (!formData.title || !formData.location) return;
    setAiGenerating(true);
    const desc = await generateItemDescription(formData.title, formData.location);
    if (desc) {
      setFormData(prev => ({ ...prev, description: desc }));
    }
    setAiGenerating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate upload delay
    setTimeout(() => {
      onSubmit({
        ...formData,
        type: 'FOUND',
        imageUrl: `https://picsum.photos/seed/${Math.random()}/400/300`, // Mock image
        dateFound: new Date(formData.dateFound).toISOString(),
        status: 'PENDING'
      });
      setLoading(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-brand-900 border border-brand-700 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-brand-800">
          <h2 className="text-xl font-bold text-white">Report Found Item</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="overflow-y-auto p-6 space-y-4 custom-scrollbar">
          <form id="found-form" onSubmit={handleSubmit} className="space-y-4">
            
            {/* Image Placeholder */}
            <div className="border-2 border-dashed border-brand-700 rounded-xl p-8 flex flex-col items-center justify-center text-gray-400 hover:border-brand-500 hover:text-brand-500 transition cursor-pointer bg-brand-800/50">
              <Upload className="w-8 h-8 mb-2" />
              <span className="text-sm">Upload Photo</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Item Title</label>
              <input 
                required
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Red Hydro Flask"
                className="w-full bg-brand-950 border border-brand-700 rounded-lg p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-brand-600 focus:border-transparent outline-none transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                <select 
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-brand-950 border border-brand-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-600 outline-none"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Date Found</label>
                <input 
                  type="date"
                  name="dateFound"
                  value={formData.dateFound}
                  onChange={handleChange}
                  className="w-full bg-brand-950 border border-brand-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-600 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Location Found</label>
              <input 
                required
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Library, Table 4"
                className="w-full bg-brand-950 border border-brand-700 rounded-lg p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-brand-600 outline-none transition"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-300">Description</label>
                <button 
                  type="button"
                  onClick={handleAiGenerate}
                  disabled={!formData.title || !formData.location || aiGenerating}
                  className="text-xs flex items-center gap-1 text-brand-accent hover:text-cyan-300 disabled:opacity-50"
                >
                   {aiGenerating ? <Loader2 className="w-3 h-3 animate-spin"/> : <Sparkles className="w-3 h-3" />}
                   Auto-write with AI
                </button>
              </div>
              <textarea 
                required
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Describe the item..."
                className="w-full bg-brand-950 border border-brand-700 rounded-lg p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-brand-600 outline-none transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Finder Name</label>
                 <input 
                  required
                  name="finderName"
                  value={formData.finderName}
                  onChange={handleChange}
                  placeholder="Your Name"
                  className="w-full bg-brand-950 border border-brand-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Contact/Email</label>
                <input 
                  required
                  name="contactInfo"
                  value={formData.contactInfo}
                  onChange={handleChange}
                  placeholder="email@uni.edu"
                  className="w-full bg-brand-950 border border-brand-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-600 outline-none"
                />
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-brand-800 bg-brand-900/50 rounded-b-2xl">
          <button 
            type="submit" 
            form="found-form"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Publishing...
              </>
            ) : (
              'Post Item'
            )}
          </button>
        </div>

      </div>
    </div>
  );
};