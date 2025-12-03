
import React, { useState } from 'react';
import { X, Calendar, MapPin, Trophy, Timer, Ruler } from 'lucide-react';
import { RawRaceData, RaceCategory } from '../types';

interface AddRaceFormProps {
  onClose: () => void;
  onAdd: (race: RawRaceData) => void;
}

const AddRaceForm: React.FC<AddRaceFormProps> = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState<Partial<RawRaceData>>({
    year: new Date().getFullYear(),
    event: '',
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }),
    location: '',
    time: '',
    pace: '',
    overall: '',
    gender: '',
    division: '',
    distanceType: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.event && formData.date && formData.time) {
      onAdd(formData as RawRaceData);
      onClose();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Log New Race</h3>
            <p className="text-sm text-slate-500">Enter the details from your event</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Scrollable Form Body */}
        <div className="overflow-y-auto custom-scrollbar p-6">
          <form id="race-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Section: Event Details */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-sm font-semibold text-blue-600 uppercase tracking-wide">
                <Calendar className="w-4 h-4" />
                <span>Event Details</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Year</label>
                  <input 
                    type="number" 
                    name="year" 
                    value={formData.year} 
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Date</label>
                  <input 
                    type="text" 
                    name="date" 
                    value={formData.date} 
                    onChange={handleChange}
                    placeholder="e.g. March 20, 2025"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Event Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="event" 
                  value={formData.event} 
                  onChange={handleChange}
                  placeholder="e.g. Boston Marathon"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium" 
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      name="location" 
                      value={formData.location} 
                      onChange={handleChange}
                      placeholder="City, State"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                    />
                  </div>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1.5">Distance (Optional)</label>
                   <div className="relative">
                    <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      name="distanceType"
                      value={formData.distanceType}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                    >
                      <option value="">Auto Detect</option>
                      {Object.values(RaceCategory).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                   </div>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Section: Performance */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-sm font-semibold text-blue-600 uppercase tracking-wide">
                <Timer className="w-4 h-4" />
                <span>Performance</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Finish Time <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="time" 
                    value={formData.time} 
                    onChange={handleChange}
                    placeholder="HH:MM:SS"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Pace</label>
                  <input 
                    type="text" 
                    name="pace" 
                    value={formData.pace} 
                    onChange={handleChange}
                    placeholder="MM:SS"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono" 
                  />
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  <Trophy className="w-3 h-3" />
                  <span>Placements (Optional)</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Overall</label>
                    <input 
                      type="text" 
                      name="overall" 
                      value={formData.overall} 
                      onChange={handleChange}
                      placeholder="e.g. 10/500"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Gender</label>
                    <input 
                      type="text" 
                      name="gender" 
                      value={formData.gender} 
                      onChange={handleChange}
                      placeholder="e.g. 5/200"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Division</label>
                    <input 
                      type="text" 
                      name="division" 
                      value={formData.division} 
                      onChange={handleChange}
                      placeholder="e.g. 1/50"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 flex items-center justify-end space-x-3">
          <button 
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="race-form"
            className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm transition-all focus:ring-4 focus:ring-blue-200"
          >
            Save Race Log
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddRaceForm;