import Link from 'next/link';
import { MapPin, Wifi, BatteryCharging, Utensils } from 'lucide-react';
import Image from 'next/image';

interface PGCardProps {
  id: string;
  name: string;
  slug: string;
  address: string;
  minRent: number;
  imageUrl?: string;
  amenities: {
    wifi: boolean;
    food: boolean;
    powerBackup: boolean;
  };
  genderType: string;
}

export default function PGCard({ id, name, slug, address, minRent, imageUrl, amenities, genderType }: PGCardProps) {
  return (
    <Link href={`/pg/${slug}`} className="group block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 overflow-hidden">
      <div className="relative h-48 w-full bg-gray-200">
        {imageUrl ? (
            <Image 
                src={imageUrl} 
                alt={name} 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-300" 
            />
        ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
                <span className="text-4xl">🏠</span>
            </div>
        )}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-gray-800 shadow-sm">
            {genderType || 'Unisex'}
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{name}</h3>
                <div className="flex items-center mt-1 text-gray-500 text-sm">
                    <MapPin className="w-4 h-4 mr-1 shrink-0" />
                    <span className="line-clamp-1">{address}</span>
                </div>
            </div>
        </div>

        <div className="mt-4 flex gap-3 text-gray-600">
            {amenities.wifi && (
                <div title="WiFi" className="bg-blue-50 p-1.5 rounded-md text-blue-600">
                    <Wifi className="w-4 h-4" />
                </div>
            )}
            {amenities.food && (
                <div title="Food Available" className="bg-green-50 p-1.5 rounded-md text-green-600">
                    <Utensils className="w-4 h-4" />
                </div>
            )}
            {/* Note: Power Backup isn't in Amenity schema yet, using as placeholder or need to check schema */}
        </div>
        
        <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center">
            <div>
                <p className="text-xs text-gray-500 font-medium">Starts from</p>
                <p className="text-lg font-bold text-gray-900">₹{minRent.toLocaleString()}<span className="text-gray-400 text-sm font-normal">/mo</span></p>
            </div>
            <span className="text-blue-600 text-sm font-semibold group-hover:underline">View Details</span>
        </div>
      </div>
    </Link>
  );
}
