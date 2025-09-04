// app/coverage/page.jsx
"use client";
import OSMMap from "../components/maps/OSMMap";
import AddressSearchInput from "../components/maps/AddressSearchInput";
import CoverageLegend from "../components/maps/CoverageLegend";
import Alert from "../components/ui/Alert";
import { useState, useRef } from "react";

// Mock coverage areas for demonstration
const mockCoverageAreas = [
  {
    name: "Downtown Fiber Zone",
    coverageType: "fiber",
    status: "active",
    color: "#4285F4",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [-74.008, 40.71],
          [-74.004, 40.71],
          [-74.004, 40.714],
          [-74.008, 40.714],
          [-74.008, 40.71],
        ],
      ],
    },
  },
  {
    name: "Uptown Wireless Zone",
    coverageType: "wireless",
    status: "active",
    color: "#34A853",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [-74.01, 40.72],
          [-74.002, 40.72],
          [-74.002, 40.728],
          [-74.01, 40.728],
          [-74.01, 40.72],
        ],
      ],
    },
  },
];

// Mock offices for demonstration
const mockOffices = [
  {
    name: "Main Office",
    phone: "(555) 123-4567",
    email: "info@high-tech-isp.com",
    location: {
      coordinates: [-74.006, 40.7128],
    },
  },
  {
    name: "Downtown Branch",
    phone: "(555) 987-6543",
    email: "downtown@high-tech-isp.com",
    location: {
      coordinates: [-74.005, 40.711],
    },
  },
];

export default function CoveragePage() {
  const [userLocation, setUserLocation] = useState(null);
  const [result, setResult] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.006 });
  const [mapZoom, setMapZoom] = useState(12);
  const mapRef = useRef(null);

  const handleAddressSelect = (locationData) => {
    setUserLocation(locationData);
    setMapCenter({ lat: locationData.lat, lng: locationData.lng });
    setMapZoom(14);

    // Check if location is in coverage area
    const isInCoverage = checkIfInCoverage(locationData.lat, locationData.lng);
    setResult({
      inside: isInCoverage,
      address: locationData.address,
    });
  };

  const checkIfInCoverage = (lat, lng) => {
    // Simple point-in-polygon check for demonstration
    // In production, you would use a more robust algorithm
    return Math.random() > 0.3; // 70% chance of being in coverage
  };

  return (
    <div className="min-h-screen">
        <div className="mx-5 md:mx-auto mt-30 text-xs md:text-sm text-center">
            <p>This is not a real implementation of Map. This is just a dummy implementation and will be finalized soon.</p>
        </div>
      {/* Content */}
      <div className="z-10 relative mx-auto mt-[-100] px-4 sm:px-6 lg:px-8 pt-32 pb-20 max-w-7xl">
        <div className="mb-16 text-center">
          <h1 className="mb-6 font-bold text-gray-800 text-2xl md:text-5xl lg:text-6xl">
            Check Your Coverage
          </h1>
          <p className="mx-5 md:mx-auto max-w-3xl text-gray-600 text-sm md:text-xl">
            See if our high-speed fiber internet is available at your address.
            Enter your location to find out instantly.
          </p>
        </div>

        {/* Main content */}
        <div className="bg-white/80 shadow-xl backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="mx-auto max-w-4xl">
              <AddressSearchInput onAddressSelect={handleAddressSelect} />

              {result && (
                <Alert
                  type={result.inside ? "success" : "warning"}
                  onClose={() => setResult(null)}
                >
                  {result.inside ? (
                    <>
                      Congratulations! Our service is available at{" "}
                      <strong>{result.address}</strong>.
                    </>
                  ) : (
                    <>
                      Our service is not currently available at{" "}
                      <strong>{result.address}</strong>, but we're expanding
                      soon!
                    </>
                  )}
                </Alert>
              )}

              <div className="relative mt-8 border border-gray-200 rounded-xl h-96 md:h-[500px] overflow-hidden">
                <OSMMap
                  coverageAreas={mockCoverageAreas}
                  offices={mockOffices}
                  userLocation={userLocation}
                  center={mapCenter}
                  zoom={mapZoom}
                />
              </div>
              <div className="bottom-4 left-4 z-10">
                <CoverageLegend />
              </div>
            </div>
          </div>

          {/* Coverage information */}
          <div className="bg-gray-50 px-6 py-8 border-white/20 border-t">
            <div className="gap-8 grid grid-cols-1 md:grid-cols-3 mx-auto max-w-5xl">
              <div className="text-center">
                <div className="flex justify-center items-center bg-green-100 mx-auto mb-4 rounded-lg w-12 h-12">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 font-semibold text-gray-800">
                  Available Areas
                </h3>
                <p className="text-gray-600 text-sm">
                  Our fiber network covers select neighborhoods with plans for
                  expansion
                </p>
              </div>

              <div className="text-center">
                <div className="flex justify-center items-center bg-blue-100 mx-auto mb-4 rounded-lg w-12 h-12">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 font-semibold text-gray-800">
                  Installation Time
                </h3>
                <p className="text-gray-600 text-sm">
                  Typically 5-10 business days after order confirmation
                </p>
              </div>

              <div className="text-center">
                <div className="flex justify-center items-center bg-purple-100 mx-auto mb-4 rounded-lg w-12 h-12">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 font-semibold text-gray-800">
                  Service Areas
                </h3>
                <p className="text-gray-600 text-sm">
                  Check back regularly as we're constantly expanding our network
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
