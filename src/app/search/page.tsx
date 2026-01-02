import { prisma } from '@/lib/prisma';
import PGCard from '@/components/PGCard';
import SearchBar from '@/components/SearchBar';
import Link from 'next/link';
import FilterSidebar from '@/components/FilterSidebar';
import { Suspense } from 'react';

// Force dynamic rendering as search results depend on query params
export const dynamic = 'force-dynamic';

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage(props: SearchPageProps) {
  try {
    const searchParams = await props.searchParams;
    const city = typeof searchParams.city === 'string' ? searchParams.city : '';
    const priceMin = Number(searchParams.priceMin) || 0;
    const priceMax = Number(searchParams.priceMax) || 100000;
    const gender = typeof searchParams.gender === 'string' ? searchParams.gender : undefined;
    const amenitiesStr = typeof searchParams.amenities === 'string' ? searchParams.amenities : '';
    const amenities = amenitiesStr ? amenitiesStr.split(',') : [];

    // Construct Prisma Where Clause
    const whereClause: any = {
        is_public_listed: true,
        Address: {
          is: {
              OR: [
                  { city: { contains: city, mode: 'insensitive' } },
                  { address_line1: { contains: city, mode: 'insensitive' } },
                  { address_line2: { contains: city, mode: 'insensitive' } },
              ]
          }
        },
        // Price Filter
        AND: [
            {
                OR: [
                    { min_rent: { gte: priceMin, lte: priceMax } },
                    { min_rent: null } 
                ]
            }
        ]
    };

    // Gender Filter 
    if (gender) {
        whereClause.Floor = {
            some: {
                gender_allowed: { equals: gender, mode: 'insensitive' }
            }
        };
    }

    // Amenities Filter
    if (amenities.length > 0) {
        if (!whereClause.Amenity) whereClause.Amenity = {};
        
        if (amenities.includes('wifi')) whereClause.Amenity.internet = true;
        if (amenities.includes('food')) whereClause.Amenity.food = true;
        if (amenities.includes('ac')) whereClause.Amenity.air_conditioned = true;
    }

    // Fetch PGs
    const pgs = await prisma.pG.findMany({
      where: whereClause,
      include: {
        Address: true,
        Amenity: true,
        RoomType: true,
        PGConfig: true,
        Floor: true 
      }
    });


    // Post-process to format for PGCard
    const formattedPGs = pgs.map((pg: any) => {
        // Calculate min rent
        let minRent = pg.min_rent || 0;
        
        // Fallback to pricing rules if min_rent is not yet populated
        if (minRent === 0 && pg.PGConfig?.pricing_rules) {
            try {
              const rules = pg.PGConfig.pricing_rules as Record<string, any>;
              if (Array.isArray(rules)) {
                  const rents = rules.map((r: any) => r.rent);
                  if (rents.length > 0) minRent = Math.min(...rents);
              } else {
                  const prices = Object.values(rules).flatMap(r => Object.values(r as Record<string, number>));
                  if (prices.length > 0) minRent = Math.min(...prices as number[]);
              }
            } catch (e) { console.error('Error parsing pricing rules', e); }
        }
        
        // Determine Image URL
        let imageUrl = pg.cover_image;
        if (!imageUrl && pg.images && Array.isArray(pg.images) && pg.images.length > 0) {
            imageUrl = pg.images[0];
        }

        return {
            id: pg.id,
            name: pg.name,
            slug: pg.slug || pg.id, 
            address: `${pg.Address?.address_line1}, ${pg.Address?.city}`,
            minRent,
            amenities: {
              wifi: pg.Amenity?.internet || false,
              food: pg.Amenity?.food || false,
              powerBackup: false, 
            },
            genderType: pg.Floor?.length > 0 ? (pg.Floor[0].gender_allowed || 'Co-ed') : 'Co-ed',
            imageUrl,
        };
    }).filter(Boolean); // Filter out nulls if any

    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm sticky top-0 z-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
              <Link href="/" className="text-xl font-bold text-blue-900">PGPoint</Link>
              <div className="hidden md:block w-96">
                  <SearchBar />
              </div>
              {/* Mobile Filter Toggle (Could be implemented later) */}
            </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar Filters - Desktop */}
              <div className="hidden lg:block w-64 flex-shrink-0">
                  <Suspense fallback={<div className="h-64 bg-gray-100 rounded-xl animate-pulse" />}>
                      <FilterSidebar />
                  </Suspense>
              </div>

              {/* Results Area */}
              <div className="flex-1">
                  <div className="mb-6">
                      <h1 className="text-2xl font-bold text-gray-900">
                          {city ? `PGs in "${city}"` : 'All PG Listings'}
                      </h1>
                      <p className="text-gray-500 mt-1">{formattedPGs.length} results found</p>
                  </div>

                  {formattedPGs.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                          {formattedPGs.map((pg: any) => (
                              <PGCard key={pg.id} {...pg} />
                          ))}
                      </div>
                  ) : (
                      <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
                          <p className="text-xl text-gray-500">No PGs match your filters.</p>
                          <Link href="/search" className="text-blue-600 hover:underline mt-4 inline-block">Clear Filters</Link>
                      </div>
                  )}
              </div>
            </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("SEARCH_PAGE_FATAL_ERROR:", error);
    return <div className="p-10 text-red-600">Fatal Error: {String(error)}</div>;
  }
}


