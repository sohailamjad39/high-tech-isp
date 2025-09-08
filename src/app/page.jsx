// app/page.jsx
"use client"
import Image from "next/image";
import Link from "next/link";
import WhyChooseUsCard from "./components/ui/WhyChooseUsCard";
import { useQuery } from '@tanstack/react-query';

// Fetch hero image metadata
const fetchHeroImage = async () => {
  // In production, you might fetch image metadata from an API
  // For now, return static data
  return {
    src: "/city.png",
    alt: "City skyline with fiber optic cables",
    width: 1920,
    height: 1080
  };
};

// Fetch why choose us data
const fetchWhyChooseUsData = async () => {
  return [
    {
      icon: '/why-us-card-icons/1.svg',
      heading: "Blazing Fast Speeds",
      subheading: "Fiber-powered internet up to 1Gbps",
    },
    {
      icon: '/why-us-card-icons/2.svg',
      heading: "Reliable & Secure",
      subheading: "99.9% uptime with advanced protection",
    },
    {
      icon: '/why-us-card-icons/3.svg',
      heading: "24/7 Support",
      subheading: "Always here when you need us",
    },
    {
      icon: '/why-us-card-icons/4.svg',
      heading: "Affordable Packages",
      subheading: "Plans for every budget",
    },
  ];
};

export default function LandingPage() {
  // Use React Query for caching
  const { data: heroImage } = useQuery({
    queryKey: ['hero-image'],
    queryFn: fetchHeroImage,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    cacheTime: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  const { data: whyChooseUsCards } = useQuery({
    queryKey: ['why-choose-us'],
    queryFn: fetchWhyChooseUsData,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    cacheTime: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  if (!whyChooseUsCards) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="border-t-2 border-b-2 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ height: '100vh' }}>
        {/* Background Image with gradient overlay and fade effects */}
        <div className="absolute inset-0">
          {/* Background image container with fade effects */}
          <div className="relative mt-45 w-full h-[70%] overflow-hidden">
            {/* Background Image */}
            {heroImage && (
              <Image
                src={heroImage.src}
                alt={heroImage.alt}
                fill
                sizes="100vw"
                style={{ objectFit: "cover", opacity: '70%' }}
                priority
                quality={80}
              />
            )}

            {/* Fade Top (0 -> 100% opacity) */}
            <div className="top-0 left-0 absolute bg-gradient-to-b from-white to-transparent w-full h-[25%]"></div>

            {/* Fade Bottom (100% -> 0 opacity) */}
            <div className="bottom-0 left-0 absolute bg-gradient-to-t from-white to-transparent w-full h-[25%]"></div>
          </div>
        </div>

        {/* Content */}
        <div className="z-10 relative flex items-center mx-auto md:ml-25 px-4 sm:px-6 lg:px-8 py-24 md:py-32 max-w-[80vw] md:max-w-[55vw] h-full">
          <div className="flex md:flex-row flex-col justify-between items-center w-full">
            {/* Left Content */}
            <div className="mb-12 md:mb-0 md:text-left text-center">
              <h1 className="mb-6 font-bold text-gray-800 text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight">
                Connecting You to the Future with Ultra-Fast Internet
              </h1>
              <p className="mx-auto md:mx-0 mb-8 text-gray-700 text-base sm:text-lg md:text-xl">
                Reliable, Affordable, and Lightning-Fast Internet for Home & Business.
              </p>
              <div className="flex sm:flex-row flex-col justify-center md:justify-start gap-4">
                <Link
                  href="/plans"
                  className="bg-gradient-to-r from-[#2f83aa] hover:from-[#3da5d8] to-[#3f88cc] hover:to-[#56bde4] shadow-md hover:shadow-lg px-6 py-3 rounded-lg w-full sm:w-auto font-medium text-white text-base sm:text-lg transition-all duration-200"
                >
                  View Plans
                </Link>
                <Link
                  href="/coverage"
                  className="bg-gradient-to-r from-[#2f83aa] hover:from-[#3da5d8] to-[#3f88cc] hover:to-[#56bde4] shadow-md hover:shadow-lg px-6 py-3 rounded-lg w-full sm:w-auto font-medium text-white text-base sm:text-lg transition-all duration-200"
                >
                  Check Coverage
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="z-10 relative mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 max-w-7xl">
        <h2 className="mb-8 sm:mb-12 font-bold text-gray-800 text-2xl sm:text-3xl text-center">
          Why Choose Us
        </h2>

        <div className="gap-6 sm:gap-8 grid grid-cols-1 md:grid-cols-2 px-5 md:px-15">
          {whyChooseUsCards.map((card, index) => (
            <WhyChooseUsCard
              key={index}
              icon={<img src={card.icon} className="w-full h-full" alt={card.heading} />}
              heading={card.heading}
              subheading={card.subheading}
            />
          ))}
        </div>
      </section>
    </div>
  );
}