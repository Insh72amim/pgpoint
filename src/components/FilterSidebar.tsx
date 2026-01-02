'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Actually, standard input ranges are easier for MVP without Shadcn/UI for now.
// Will use standard HTML inputs and custom styling for now to avoid dependency hell if Shadcn not installed.

export default function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [selectedGender, setSelectedGender] = useState<string>('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  useEffect(() => {
    // Sync local state with URL params
    const min = Number(searchParams.get('priceMin')) || 0;
    const max = Number(searchParams.get('priceMax')) || 50000;
    setPriceRange([min, max]);

    setSelectedGender(searchParams.get('gender') || '');
    
    const amenitiesParam = searchParams.get('amenities');
    if (amenitiesParam) {
        setSelectedAmenities(amenitiesParam.split(','));
    }
  }, [searchParams]);

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    params.set('priceMin', priceRange[0].toString());
    params.set('priceMax', priceRange[1].toString());

    if (selectedGender) {
        params.set('gender', selectedGender);
    } else {
        params.delete('gender');
    }

    if (selectedAmenities.length > 0) {
        params.set('amenities', selectedAmenities.join(','));
    } else {
        params.delete('amenities');
    }

    router.push(`/search?${params.toString()}`);
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
        prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit sticky top-24">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Filters</h3>

      {/* Price Range */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-4">Price Range (₹)</label>
        <div className="flex items-center gap-4 mb-4">
             <input 
                type="number" 
                value={priceRange[0]} 
                onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                placeholder="Min"
             />
             <span className="text-gray-400">-</span>
             <input 
                type="number" 
                value={priceRange[1]} 
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                placeholder="Max"
             />
        </div>
      </div>

      {/* Gender */}
      <div className="mb-8">
         <label className="block text-sm font-medium text-gray-700 mb-4">Gender</label>
         <div className="space-y-3">
            {['Boys', 'Girls', 'Co-ed'].map((g) => (
                <label key={g} className="flex items-center gap-3 cursor-pointer">
                    <input 
                        type="radio" 
                        name="gender" 
                        value={g}
                        checked={selectedGender === g}
                        onChange={(e) => setSelectedGender(e.target.value)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="text-gray-600 sm:text-sm">{g}</span>
                </label>
            ))}
            <label className="flex items-center gap-3 cursor-pointer">
                <input 
                    type="radio" 
                    name="gender" 
                    value=""
                    checked={selectedGender === ''}
                    onChange={() => setSelectedGender('')}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="text-gray-600 sm:text-sm">Any</span>
            </label>
         </div>
      </div>

      {/* Amenities */}
      <div className="mb-8">
         <label className="block text-sm font-medium text-gray-700 mb-4">Amenities</label>
         <div className="space-y-3">
            {[
                { id: 'wifi', label: 'Wi-Fi' },
                { id: 'ac', label: 'AC' },
                { id: 'food', label: 'Food' },
                { id: 'power', label: 'Power Backup' }
            ].map(({ id, label }) => (
                <label key={id} className="flex items-center gap-3 cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={selectedAmenities.includes(id)}
                        onChange={() => toggleAmenity(id)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-gray-600 sm:text-sm">{label}</span>
                </label>
            ))}
         </div>
      </div>

      {/* Apply Button */}
      <button 
        onClick={handleApply}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
      >
        Apply Filters
      </button>
    </div>
  );
}
