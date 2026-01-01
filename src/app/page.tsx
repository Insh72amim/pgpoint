import SearchBar from '@/components/SearchBar';
import Link from 'next/link';

export default function Home() {
  const popularCities = ['Bangalore', 'Hyderabad', 'Pune', 'Mumbai', 'Delhi'];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-blue-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-purple-900 opacity-90"></div>
          {/* Optional: Add background image here */}
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
              Find your perfect <span className="text-blue-200">PG Stay</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Discover comfortable, affordable, and verified paying guest accommodations near you.
            </p>
            
            <div className="mt-10">
              <SearchBar />
            </div>

            <p className="mt-8 text-sm text-gray-300">
              Popular Cities: {' '}
              {popularCities.map((city, index) => (
                 <span key={city}>
                    <Link href={`/search?city=${city}`} className="text-white underline hover:text-blue-200 cursor-pointer">
                      {city}
                    </Link>
                    {index < popularCities.length - 1 && ', '}
                 </span>
              ))}
            </p>
          </div>
        </div>
      </div>

      {/* Benefits Section (Static for MVP) */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="text-center p-6">
                 <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    🛡️
                 </div>
                 <h3 className="text-lg font-medium text-gray-900">Verified Listings</h3>
                 <p className="mt-2 text-gray-500">Every PG is physically verified by our team.</p>
              </div>
              <div className="text-center p-6">
                 <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    💰
                 </div>
                 <h3 className="text-lg font-medium text-gray-900">Zero Brokerage</h3>
                 <p className="mt-2 text-gray-500">Connect directly with owners. No hidden fees.</p>
              </div>
               <div className="text-center p-6">
                 <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    ⚡
                 </div>
                 <h3 className="text-lg font-medium text-gray-900">Instant Booking</h3>
                 <p className="mt-2 text-gray-500">Reserve your bed online in minutes.</p>
              </div>
           </div>
        </div>
      </div>
    </main>
  );
}
