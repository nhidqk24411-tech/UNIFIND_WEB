
import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Sparkles, Loader2, Camera, RefreshCw, AlertTriangle, Lock, MapPin, Crosshair, Map as MapIcon, CheckCircle2 } from 'lucide-react';
import { FoundItem, ItemCategory, ItemType } from '../types';
import { CATEGORIES } from '../constants';
import { generateItemDescription, validatePostContent, validateImageContent, reverseGeocode } from '../services/geminiService';
import { CameraModal } from './CameraModal';
import { useLanguage } from '../contexts/LanguageContext';

declare const L: any;

interface ReportItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: Omit<FoundItem, 'id' | 'userId'>) => void;
  initialType: ItemType;
}

export const ReportItemModal: React.FC<ReportItemModalProps> = ({ isOpen, onClose, onSubmit, initialType }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [validatingText, setValidatingText] = useState(false);
  const [validatingImage, setValidatingImage] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  
  // Validation State
  const [isTextValid, setIsTextValid] = useState(false);
  const [validationError, setValidationError] = useState<{ field: string; message: string } | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  
  const [type, setType] = useState<ItemType>(initialType);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Camera State
  const [showCamera, setShowCamera] = useState(false);

  // Map State
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [mapCoords, setMapCoords] = useState<{lat: number, lng: number} | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    dateFound: new Date().toISOString().split('T')[0],
    category: ItemCategory.OTHER,
    contactInfo: '',
    finderName: '',
  });

  // --- Automatic Text Validation (Debounced) ---
  useEffect(() => {
    // Reset validity when core fields are empty
    if (!formData.title || !formData.location || !formData.contactInfo) {
        setIsTextValid(false);
        setValidationError(null);
        return;
    }

    const timer = setTimeout(async () => {
        setValidatingText(true);
        const result = await validatePostContent(
            formData.title,
            formData.description,
            formData.category,
            null 
        );
        setValidatingText(false);

        if (result.isValid) {
            setIsTextValid(true);
            setValidationError(null);
        } else {
            setIsTextValid(false);
            setValidationError({ 
                field: result.errorField || 'general', 
                message: result.reason 
            });
        }
    }, 1500); // 1.5s debounce delay

    return () => clearTimeout(timer);
  }, [formData.title, formData.description, formData.location, formData.category, formData.contactInfo]);

  const handleImageValidation = async (base64Data: string) => {
    setValidatingImage(true);
    setImageError(null); 
    
    // SFW Check only
    const result = await validateImageContent(base64Data, formData.category, formData.title);
    setValidatingImage(false);

    if (result.isValid) {
        setImagePreview(base64Data);
        setImageError(null);
        return true;
    } else {
        setImageError(result.reason || "Image contains inappropriate content.");
        return false;
    }
  };

  useEffect(() => {
    if (isOpen) {
        setType(initialType);
        setImagePreview(null);
        setIsTextValid(false);
        setValidationError(null);
        setImageError(null);
        setFormData(prev => ({ ...prev, title: '', description: '', location: '', contactInfo: '', finderName: '' }));
        setMapCoords(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [initialType, isOpen]); 

  // --- Location & Map Logic ---
  useEffect(() => {
      if (isMapOpen && !mapRef.current) {
          const initialLat = mapCoords?.lat || 10.8700;
          const initialLng = mapCoords?.lng || 106.7782;

          setTimeout(() => {
            if (document.getElementById('leaflet-map')) {
                const map = L.map('leaflet-map').setView([initialLat, initialLng], 15);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; OpenStreetMap contributors'
                }).addTo(map);
                const marker = L.marker([initialLat, initialLng], { draggable: true }).addTo(map);
                marker.on('dragend', async function(e: any) {
                    const { lat, lng } = e.target.getLatLng();
                    setMapCoords({ lat, lng });
                });
                mapRef.current = map;
                markerRef.current = marker;
            }
          }, 100); 
      }
      if (isMapOpen && mapRef.current && mapCoords) {
          mapRef.current.setView([mapCoords.lat, mapCoords.lng], 16);
          if (markerRef.current) {
              markerRef.current.setLatLng([mapCoords.lat, mapCoords.lng]);
          }
      }
  }, [isMapOpen]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            setMapCoords({ lat: latitude, lng: longitude });
            setFormData(prev => ({ ...prev, location: `Fetching address...` }));
            const address = await reverseGeocode(latitude, longitude);
            setFormData(prev => ({ ...prev, location: address }));
            setGettingLocation(false);
        },
        (error) => {
            alert("Location error.");
            setGettingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const confirmMapLocation = async () => {
      if (mapCoords) {
          setGettingLocation(true);
          const address = await reverseGeocode(mapCoords.lat, mapCoords.lng);
          setFormData(prev => ({ ...prev, location: address }));
          setGettingLocation(false);
          setIsMapOpen(false);
          if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
      } else {
          setIsMapOpen(false);
      }
  };

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (validationError?.field === e.target.name) {
        setValidationError(null);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        await handleImageValidation(base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    if (isTextValid) fileInputRef.current?.click();
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    e.preventDefault();
    setImagePreview(null);
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAiGenerate = async () => {
    if (!formData.title || !formData.location) return;
    setAiGenerating(true);
    const contextTitle = `${type === 'LOST' ? 'Lost Item:' : 'Found Item:'} ${formData.title}`;
    const desc = await generateItemDescription(contextTitle, formData.location);
    if (desc) {
      setFormData(prev => ({ ...prev, description: desc }));
    }
    setAiGenerating(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isTextValid || validationError || imageError) return;
    setLoading(true);
    setTimeout(() => {
      onSubmit({
        ...formData,
        type: type,
        imageUrl: imagePreview || `https://picsum.photos/seed/${Math.random().toString(36)}/400/300`, 
        dateFound: new Date(formData.dateFound).toISOString(),
        status: 'PENDING'
      });
      setLoading(false);
      onClose();
    }, 1000);
  };

  const isLost = type === 'LOST';

  return (
    <>
    <CameraModal 
        isOpen={showCamera} 
        onClose={() => setShowCamera(false)} 
        onCapture={(base64) => handleImageValidation(base64)}
    />
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Interactive Map Modal Overlay */}
      {isMapOpen && (
          <div className="absolute inset-0 z-[120] flex items-center justify-center p-4 bg-black/80">
              <div className="bg-brand-900 rounded-xl border border-brand-700 w-full max-w-3xl h-[80vh] flex flex-col shadow-2xl overflow-hidden">
                  <div className="p-4 border-b border-brand-700 flex justify-between items-center bg-brand-800">
                      <div>
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <MapPin className="text-brand-500 w-5 h-5"/> 
                            Adjust Location
                        </h3>
                        <p className="text-xs text-gray-400">Drag the blue marker to the exact spot.</p>
                      </div>
                      <button onClick={() => {
                          setIsMapOpen(false);
                          if(mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
                      }} className="text-gray-400 hover:text-white">
                          <X className="w-6 h-6"/>
                      </button>
                  </div>
                  
                  <div className="flex-1 bg-slate-100 relative">
                       <div id="leaflet-map" className="w-full h-full"></div>
                       <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[400] flex gap-2">
                           <button 
                             onClick={() => {
                                 navigator.geolocation.getCurrentPosition(pos => {
                                     const { latitude, longitude } = pos.coords;
                                     setMapCoords({ lat: latitude, lng: longitude });
                                 });
                             }}
                             className="bg-white text-brand-600 px-4 py-2 rounded-full shadow-lg font-medium flex items-center gap-2 hover:bg-gray-100"
                           >
                               <Crosshair className="w-4 h-4"/> My Loc
                           </button>
                           <button 
                             onClick={confirmMapLocation}
                             className="bg-brand-600 text-white px-6 py-2 rounded-full shadow-lg font-bold flex items-center gap-2 hover:bg-brand-500"
                           >
                               <CheckCircle2 className="w-4 h-4"/> Confirm Location
                           </button>
                       </div>
                  </div>
              </div>
          </div>
      )}

      <div className="relative bg-brand-900 border border-brand-700 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
         {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-brand-800">
          <div className="flex items-center gap-4">
             <h2 className="text-xl font-bold text-white">{t.report.title}</h2>
             <div className="flex bg-slate-950 rounded-lg p-1 border border-brand-800">
                <button 
                    type="button"
                    onClick={() => { setType('LOST'); }}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${type === 'LOST' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                    {t.report.iLost}
                </button>
                <button 
                    type="button"
                    onClick={() => { setType('FOUND'); }}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${type === 'FOUND' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                    {t.report.iFound}
                </button>
             </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="overflow-y-auto p-6 space-y-4 custom-scrollbar">
          <form id="report-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Text Inputs */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">{t.report.itemTitle} <span className="text-red-500">*</span></label>
              <input 
                required
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder={isLost ? "e.g. Silver MacBook Pro" : "e.g. Red Hydro Flask"}
                className={`w-full bg-white border ${validationError?.field === 'title' ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-brand-600'} rounded-lg p-3 text-gray-900 placeholder-gray-500 focus:ring-2 outline-none transition`}
              />
               {validationError?.field === 'title' && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> {validationError.message}
                  </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">{t.report.category} <span className="text-red-500">*</span></label>
                <select 
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-brand-600 outline-none"
                >
                  {(CATEGORIES || []).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">{isLost ? t.report.dateLost : t.report.dateFound}</label>
                <input 
                  type="date"
                  name="dateFound"
                  value={formData.dateFound}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-brand-600 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">{isLost ? t.report.locationLost : t.report.locationFound} <span className="text-red-500">*</span></label>
              <div className="relative">
                  <input 
                    required
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Library, Table 4"
                    className="w-full bg-white border border-gray-300 rounded-lg p-3 pr-24 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-brand-600 outline-none transition"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <button type="button" onClick={() => setIsMapOpen(true)} className="p-1.5 text-brand-500 hover:bg-brand-100 rounded-lg transition" title="Pick on Map">
                          <MapIcon className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={handleGetCurrentLocation} disabled={gettingLocation} className={`p-1.5 rounded-lg transition flex items-center gap-1 ${gettingLocation ? 'text-brand-accent animate-pulse' : 'text-gray-400 hover:text-brand-600 hover:bg-brand-100'}`} title="Get Current Location">
                         {gettingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crosshair className="w-4 h-4" />}
                      </button>
                  </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">{isLost ? t.report.yourName : t.report.finderName}</label>
                 <input 
                  required
                  name="finderName"
                  value={formData.finderName}
                  onChange={handleChange}
                  placeholder={t.report.yourName}
                  className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-brand-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">{t.report.contact} <span className="text-red-500">*</span></label>
                <input 
                  required
                  name="contactInfo"
                  value={formData.contactInfo}
                  onChange={handleChange}
                  placeholder="email@uni.edu"
                  className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-brand-600 outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-300">{t.report.description}</label>
                <button 
                  type="button"
                  onClick={handleAiGenerate}
                  disabled={!formData.title || !formData.location || aiGenerating}
                  className="text-xs flex items-center gap-1 text-brand-accent hover:text-cyan-300 disabled:opacity-50"
                >
                   {aiGenerating ? <Loader2 className="w-3 h-3 animate-spin"/> : <Sparkles className="w-3 h-3" />}
                   {t.report.autoWrite}
                </button>
              </div>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder={isLost ? t.report.descriptionPlaceholderLost : t.report.descriptionPlaceholderFound}
                className={`w-full bg-white border ${validationError?.field === 'description' ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-brand-600'} rounded-lg p-3 text-gray-900 placeholder-gray-500 focus:ring-2 outline-none transition`}
              />
               {validationError?.field === 'description' && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> {validationError.message}
                  </p>
              )}
            </div>

            {/* --- IMAGE SECTION --- */}
            <div className={`transition-all duration-300 ${!isTextValid ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
               <div className="flex items-center justify-between mb-2">
                   <label className="block text-sm font-medium text-gray-300">{t.report.photoEvidence}</label>
                   {!isTextValid && (
                       <span className="text-xs text-amber-500 flex items-center gap-1">
                           {validatingText ? <RefreshCw className="w-3 h-3 animate-spin"/> : <Lock className="w-3 h-3"/>} 
                           {validatingText ? "AI Checking details..." : t.report.fillToUnlock}
                       </span>
                   )}
               </div>

               <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
               
               {imagePreview ? (
                 <div className={`relative rounded-xl overflow-hidden h-64 border ${imageError ? 'border-red-500' : 'border-brand-700'} group bg-slate-950`}>
                   <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                   <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button type="button" onClick={handleRemoveImage} className="bg-red-500/90 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 backdrop-blur-sm transition transform hover:scale-105 z-20 cursor-pointer">
                        <X className="w-4 h-4" /> {t.report.removePhoto}
                      </button>
                   </div>
                 </div>
               ) : (
                 <div className="flex gap-3 relative">
                     {validatingImage && (
                         <div className="absolute inset-0 z-20 bg-black/50 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center text-white">
                             <Loader2 className="w-8 h-8 animate-spin mb-2 text-brand-accent" />
                             <span className="text-sm font-medium">{t.report.analyzing}</span>
                         </div>
                     )}
                     <div onClick={!validatingImage && isTextValid ? triggerFileInput : undefined} className={`flex-1 border-2 border-dashed ${isLost ? 'border-amber-900/50 hover:border-amber-500 text-amber-700 hover:bg-amber-900/10' : 'border-brand-700 hover:border-brand-500 text-brand-700 hover:bg-brand-900/40'} rounded-xl h-32 flex flex-col items-center justify-center transition cursor-pointer bg-brand-800/30 group`}>
                        <Upload className="w-6 h-6 mb-2 opacity-70 group-hover:opacity-100" />
                        <span className="text-sm font-medium">{t.report.upload}</span>
                     </div>
                     <div onClick={!validatingImage && isTextValid ? () => setShowCamera(true) : undefined} className={`flex-1 border-2 border-dashed ${isLost ? 'border-amber-900/50 hover:border-amber-500 text-amber-700 hover:bg-amber-900/10' : 'border-brand-700 hover:border-brand-500 text-brand-700 hover:bg-brand-900/40'} rounded-xl h-32 flex flex-col items-center justify-center transition cursor-pointer bg-brand-800/30 group`}>
                        <Camera className="w-6 h-6 mb-2 opacity-70 group-hover:opacity-100" />
                        <span className="text-sm font-medium">{t.report.takePhoto}</span>
                     </div>
                 </div>
               )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-brand-800 bg-brand-900/50 rounded-b-2xl animate-fade-in">
        <button 
            type="submit" 
            form="report-form"
            disabled={loading || validatingText || validatingImage || !isTextValid || !!validationError || !!imageError}
            className={`w-full text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 ${isLost ? 'bg-amber-600 hover:bg-amber-500' : 'bg-brand-600 hover:bg-brand-500'}`}
        >
            {loading ? (<><Loader2 className="w-5 h-5 animate-spin" /> {t.report.publishing}</>) : (isLost ? t.report.submitLost : t.report.submitFound)}
        </button>
        </div>
      </div>
    </div>
    </>
  );
};
