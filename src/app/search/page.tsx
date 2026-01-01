import { prisma } from '@/lib/prisma';
import PGCard from '@/components/PGCard';
import SearchBar from '@/components/SearchBar';
import Link from 'next/link';

// Force dynamic rendering as search results depend on query params
export const dynamic = 'force-dynamic';

interface SearchPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const city = typeof searchParams.city === 'string' ? searchParams.city : '';

  // Fetch PGs based on city filter
  // We use contains (insensitive) for loose matching
  const pgs = await prisma.pG.findMany({
    where: {
      is_public_listed: true,
      Address: {
        is: {
             OR: [
                 { city: { contains: city, mode: 'insensitive' } },
                 { address_line1: { contains: city, mode: 'insensitive' } },
                 { address_line2: { contains: city, mode: 'insensitive' } },
                 // Check name too
             ]
        }
      }
    },
    include: {
      Address: true,
      Amenity: true,
      RoomType: {
         include: {
             // to find min price calculate from pricing rules or just raw logic?
             // schema has pricing_rules in PGConfig, not here directly?
             // Wait, schema has PGConfig with pricing_rules (JSON).
             // or we can estimate from somewhere else?
             // Actually, schema.prisma check: RoomType doesn't have price. PGConfig has pricing_rules.
             // But Stay has rent_per_month.
             // For listing, we usually need a "starting from" price.
             // If pricing_rules is JSON, we can't easily sort/filter by it in SQL/Prisma easily without raw query or extracting.
             // For MVP, if price is hard to get, we show 'Contact for Price' or parse JSON in JS.
         }
      },
      PGConfig: true
    }
  });


  // Post-process to format for PGCard
  const formattedPGs = pgs.map((pg: any) => {
      // Calculate min rent
      let minRent = 0;
      if (pg.PGConfig?.pricing_rules) {
          try {
             const rules = pg.PGConfig.pricing_rules as Record<string, any>;
             // Assuming structure: { roomTypeId: { sharingCount: price } }
             const prices = Object.values(rules).flatMap(r => Object.values(r as Record<string, number>));
             if (prices.length > 0) minRent = Math.min(...prices as number[]);
          } catch (e) { console.error('Error parsing pricing rules', e); }
      }

      return {
          id: pg.id,
          name: pg.name,
          slug: pg.slug || pg.id, // Fallback to ID if no slug
          address: `${pg.Address?.address_line1}, ${pg.Address?.city}`,
          minRent,
          amenities: {
            wifi: pg.Amenity?.internet || false,
            food: pg.Amenity?.food || false,
            powerBackup: false, // Schema doesn't have it explicitly
          },
          genderType: 'Co-ed', // Need to derive from Floor/Room logic or add to PG entity. For now Mock.
          imageUrl: undefined // No image in schema yet for PG main image? Schema check needed.
      };
  });

  return (
    <div className="min-h-screen bg-gray-50">
       <nav className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
             <Link href="/" className="text-xl font-bold text-blue-900">PGPoint</Link>
             <div className="hidden md:block w-96">
                <SearchBar />
             </div>
          </div>
       </nav>

       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
             <h1 className="text-2xl font-bold text-gray-900">
                {city ? `PGs in "${city}"` : 'All PG Listings'}
             </h1>
             <p className="text-gray-500 mt-1">{formattedPGs.length} results found</p>
          </div>

          {formattedPGs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {formattedPGs.map(pg => (
                    <PGCard key={pg.id} {...pg} />
                ))}
              </div>
          ) : (
              <div className="text-center py-20">
                  <p className="text-xl text-gray-500">No PGs found in this location.</p>
                  <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">Go back home</Link>
              </div>
          )}
       </div>
    </div>
  );
}
