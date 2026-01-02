import { prisma } from '@/lib/prisma';
import LeadForm from '@/components/LeadForm';
import { notFound } from 'next/navigation';
import { MapPin, Wifi, Utensils, Shield, Wind } from 'lucide-react';
import Link from 'next/link';
import ImageGallery from '@/components/ImageGallery';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { slug: string };
}

// SEO Metadata
export async function generateMetadata({ params }: PageProps) {
  const pg = await prisma.pG.findFirst({
    where: { 
        OR: [
            { slug: params.slug },
            // UUID check if slug is actually an ID
            ...(params.slug.length === 36 ? [{ id: params.slug }] : [])
        ]
    },
    include: { Address: true }
  });

  if (!pg) return { title: 'PG Not Found' };

  return {
    title: `${pg.name} - PG in ${pg.Address?.city || 'India'} | PGPoint`,
    description: pg.public_description || `Affordable PG accommodation in ${pg.Address?.city}. Book your stay at ${pg.name} today.`,
  };
}

export default async function PGListingPage({ params }: PageProps) {
  const pg = await prisma.pG.findFirst({
    where: { 
        OR: [
            { slug: params.slug },
            ...(params.slug.length === 36 ? [{ id: params.slug }] : [])
        ]
    },
    include: {
      Address: true,
      Amenity: true,
      PGConfig: true,
      RoomType: true,
    }
  });

  if (!pg) {
    notFound();
  }

  // Parse Amenities
  const hasWifi = pg.Amenity?.internet;
  const hasFood = pg.Amenity?.food;
  const hasAC = pg.Amenity?.air_conditioned;

  // Prepare images for gallery
  let galleryImages: string[] = [];
  if (pg.cover_image) galleryImages.push(pg.cover_image);
  if (pg.images && Array.isArray(pg.images)) {
      galleryImages = [...galleryImages, ...(pg.images as string[])];
  }
  // Deduplicate
  galleryImages = Array.from(new Set(galleryImages));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar Placeholder */}
      <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
             <Link href="/" className="text-xl font-bold text-blue-900">PGPoint</Link>
             <Link href="/search" className="text-sm font-medium text-gray-500 hover:text-blue-600">Browse All</Link>
          </div>
       </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Content */}
            <div className="lg:col-span-2 space-y-8">
               {/* Hero Image Section */}
               <div className="relative">
                   <ImageGallery images={galleryImages} name={pg.name} />
                   <div className="absolute bottom-6 left-6 right-6">
                        <h1 className="text-3xl font-bold text-white drop-shadow-md">{pg.name}</h1>
                        <div className="flex items-center text-gray-100 mt-2 drop-shadow-sm">
                            <MapPin className="w-5 h-5 mr-1" />
                            <span>{pg.Address?.address_line1}, {pg.Address?.city}</span>
                        </div>
                   </div>
               </div>

               {/* About Section */}
               <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">About the Property</h2>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                      {pg.public_description || 'No description provided by owner.'}
                  </p>
               </div>
               
               {/* Room Types */}
               {pg.RoomType && pg.RoomType.length > 0 && (
                   <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                      <h2 className="text-xl font-bold text-gray-900 mb-6">Room Options</h2>
                      <div className="space-y-6">
                        {pg.RoomType.map((rt: any) => (
                            <div key={rt.id} className="flex flex-col md:flex-row gap-4 border border-gray-100 rounded-lg p-4 hover:border-blue-100 transition-colors">
                                {/* Room Image */}
                                <div className="md:w-48 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                                    {rt.images && Array.isArray(rt.images) && rt.images.length > 0 ? (
                                        <Image src={rt.images[0]} alt={rt.name} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <span>🛏️</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{rt.name}</h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {rt.is_air_conditioned ? 'AC Room' : 'Non-AC Room'} • {rt.amenities ? (rt.amenities as any[]).join(', ') : 'Standard Amenities'}
                                            </p>
                                        </div>
                                        {/* Price could go here if available */}
                                    </div>
                                    {/* Display more details if needed */}
                                </div>
                            </div>
                        ))}
                      </div>
                   </div>
               )}

               {/* Amenities */}
               <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                   <h2 className="text-xl font-bold text-gray-900 mb-6">Amenities</h2>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       {hasWifi && (
                           <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg text-blue-700">
                               <Wifi className="w-5 h-5" />
                               <span className="font-medium">Free WiFi</span>
                           </div>
                       )}
                       {hasFood && (
                           <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg text-orange-700">
                               <Utensils className="w-5 h-5" />
                               <span className="font-medium">Food Included</span>
                           </div>
                       )}
                       {hasAC && (
                           <div className="flex items-center gap-3 p-3 bg-cyan-50 rounded-lg text-cyan-700">
                               <Wind className="w-5 h-5" />
                               <span className="font-medium">Air Conditioning</span>
                           </div>
                       )}
                       <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg text-green-700">
                            <Shield className="w-5 h-5" />
                            <span className="font-medium">Secure Gate</span>
                       </div>
                   </div>
               </div>

               {/* Location (Static Map Placeholder) */}
               <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                   <h2 className="text-xl font-bold text-gray-900 mb-4">Location</h2>
                   <p className="text-gray-600 mb-4">{pg.Address?.address_line1}, {pg.Address?.city}, {pg.Address?.zipcode}</p>
                   {/* Google Maps Embed could go here */}
               </div>
            </div>

            {/* Right Sidebar (Lead Form) */}
            <div className="lg:col-span-1">
                <LeadForm pgId={pg.id} />
            </div>
         </div>
      </main>
    </div>
  );
}

// SEO Metadata
export async function generateMetadata({ params }: PageProps) {
  const pg = await prisma.pG.findFirst({
    where: { 
        OR: [
            { slug: params.slug },
            // UUID check if slug is actually an ID
            ...(params.slug.length === 36 ? [{ id: params.slug }] : [])
        ]
    },
    include: { Address: true }
  });

  if (!pg) return { title: 'PG Not Found' };

  return {
    title: `${pg.name} - PG in ${pg.Address?.city || 'India'} | PGPoint`,
    description: pg.public_description || `Affordable PG accommodation in ${pg.Address?.city}. Book your stay at ${pg.name} today.`,
  };
}

export default async function PGListingPage({ params }: PageProps) {
  const pg = await prisma.pG.findFirst({
    where: { 
        OR: [
            { slug: params.slug },
            ...(params.slug.length === 36 ? [{ id: params.slug }] : [])
        ]
    },
    include: {
      Address: true,
      Amenity: true,
      PGConfig: true,
      // Add relations needed
    }
  });

  if (!pg) {
    notFound();
  }

  // Parse Amenities
  const hasWifi = pg.Amenity?.internet;
  const hasFood = pg.Amenity?.food;
  const hasAC = pg.Amenity?.air_conditioned;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar Placeholder */}
      <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
             <Link href="/" className="text-xl font-bold text-blue-900">PGPoint</Link>
             <Link href="/search" className="text-sm font-medium text-gray-500 hover:text-blue-600">Browse All</Link>
          </div>
       </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Content */}
            <div className="lg:col-span-2 space-y-8">
               {/* Hero Image Section */}
               <div className="relative h-[400px] w-full bg-gray-200 rounded-2xl overflow-hidden">
                  {/* Placeholder for real images */}
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-300">
                     <span className="text-5xl">🏠</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                      <h1 className="text-3xl font-bold text-white">{pg.name}</h1>
                      <div className="flex items-center text-gray-200 mt-2">
                         <MapPin className="w-5 h-5 mr-1" />
                         <span>{pg.Address?.address_line1}, {pg.Address?.city}</span>
                      </div>
                  </div>
               </div>

               {/* About Section */}
               <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">About the Property</h2>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                      {pg.public_description || 'No description provided by owner.'}
                  </p>
               </div>

               {/* Amenities */}
               <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                   <h2 className="text-xl font-bold text-gray-900 mb-6">Amenities</h2>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       {hasWifi && (
                           <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg text-blue-700">
                               <Wifi className="w-5 h-5" />
                               <span className="font-medium">Free WiFi</span>
                           </div>
                       )}
                       {hasFood && (
                           <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg text-orange-700">
                               <Utensils className="w-5 h-5" />
                               <span className="font-medium">Food Included</span>
                           </div>
                       )}
                       {hasAC && (
                           <div className="flex items-center gap-3 p-3 bg-cyan-50 rounded-lg text-cyan-700">
                               <Wind className="w-5 h-5" />
                               <span className="font-medium">Air Conditioning</span>
                           </div>
                       )}
                       <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg text-green-700">
                            <Shield className="w-5 h-5" />
                            <span className="font-medium">Secure Gate</span>
                       </div>
                   </div>
               </div>

               {/* Location (Static Map Placeholder) */}
               <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                   <h2 className="text-xl font-bold text-gray-900 mb-4">Location</h2>
                   <p className="text-gray-600 mb-4">{pg.Address?.address_line1}, {pg.Address?.city}, {pg.Address?.zipcode}</p>
                   {/* Google Maps Embed could go here */}
               </div>
            </div>

            {/* Right Sidebar (Lead Form) */}
            <div className="lg:col-span-1">
                <LeadForm pgId={pg.id} />
            </div>
         </div>
      </main>
    </div>
  );
}
