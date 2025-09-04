// components/ui/Navbar.jsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile menu when the route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Close the mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const navbar = document.querySelector('nav');
      if (isMenuOpen && navbar && !navbar.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <nav className="top-0 right-0 left-0 z-50 fixed bg-transparent shadow-sm backdrop-blur-sm">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex flex-shrink-0 items-center">
            <Link
              href="/"
              className="font-bold text-2xl transition-colors duration-200"
              style={{ color: "#1a6ea4" }}
            >
              HIGH TECH
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            <Link
              href="/"
              className="px-3 py-2 font-medium text-gray-700 hover:text-sky-800 text-sm transition-colors duration-200"
            >
              Home
            </Link>
            <Link
              href="/plans"
              className="px-3 py-2 font-medium text-gray-700 hover:text-sky-800 text-sm transition-colors duration-200"
            >
              Plans & Pricing
            </Link>
            <Link
              href="/coverage"
              className="px-3 py-2 font-medium text-gray-700 hover:text-sky-800 text-sm transition-colors duration-200"
            >
              Coverage Map
            </Link>
            <Link
              href="/about"
              className="px-3 py-2 font-medium text-gray-700 hover:text-sky-800 text-sm transition-colors duration-200"
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="px-3 py-2 font-medium text-gray-700 hover:text-sky-800 text-sm transition-colors duration-200"
            >
              Contact
            </Link>
          </div>

          {/* Desktop Get Started Button */}
          <div className="hidden md:flex items-center">
            <Link
              href="/order"
              className="bg-gradient-to-r from-[#2f83aa] hover:from-[#3da5d8] to-[#3f88cc] hover:to-[#56bde4] shadow-md hover:shadow-lg px-6 py-2 rounded-lg font-medium text-white text-sm transition-all duration-200"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="focus:outline-none text-gray-700 hover:text-blue-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-gray-200 border-t">
          <div className="space-y-1 px-2 pt-2 pb-3">
            <Link
              href="/"
              className="block hover:bg-gray-50 px-3 py-2 rounded-md font-medium text-gray-700 hover:text-blue-600 text-base"
            >
              Home
            </Link>
            <Link
              href="/plans"
              className="block hover:bg-gray-50 px-3 py-2 rounded-md font-medium text-gray-700 hover:text-blue-600 text-base"
            >
              Plans & Pricing
            </Link>
            <Link
              href="/coverage"
              className="block hover:bg-gray-50 px-3 py-2 rounded-md font-medium text-gray-700 hover:text-blue-600 text-base"
            >
              Coverage Map
            </Link>
            <Link
              href="/about"
              className="block hover:bg-gray-50 px-3 py-2 rounded-md font-medium text-gray-700 hover:text-blue-600 text-base"
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="block hover:bg-gray-50 px-3 py-2 rounded-md font-medium text-gray-700 hover:text-blue-600 text-base"
            >
              Contact
            </Link>
            <div className="flex justify-center align-middle">
            <Link
              href="/order"
              className="block bg-gradient-to-r from-[#2f83aa] hover:from-[#3da5d8] to-[#3f88cc] hover:to-[#56bde4] shadow-md hover:shadow-lg mt-2 px-3 py-2 rounded-md w-[70%] font-medium text-white text-base text-center transition-all duration-200"
            >
              Get Started
            </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}