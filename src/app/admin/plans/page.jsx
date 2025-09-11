// app/admin/plans/page.jsx
"use client";

import { useState, useEffect } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Components
import Sidebar from "@/app/components/admin/dashboard/Sidebar";
import DataTable from "@/app/components/admin/DataTable";
import SearchBar from "@/app/components/admin/SearchBar";
import FilterDropdown from "@/app/components/admin/FilterDropdown";
import Pagination from "@/app/components/admin/Pagination";
import SkeletonTable from "@/app/components/admin/SkeletonTable";

// Cache utilities
const PLANS_CACHE_KEY = "admin_plans_data";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Get data from localStorage cache
const getCache = () => {
  if (typeof window === "undefined") return null;

  try {
    const cached = localStorage.getItem(PLANS_CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);

    // Check if cache is still valid
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    } else {
      // Cache expired
      localStorage.removeItem(PLANS_CACHE_KEY);
      return null;
    }
  } catch (e) {
    console.error("Cache error:", e);
    return null;
  }
};

// Set data to localStorage cache
const setCache = (data) => {
  if (typeof window === "undefined") return;

  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(PLANS_CACHE_KEY, JSON.stringify(cacheData));
  } catch (e) {
    console.error("Failed to set cache:", e);
  }
};

// Fetch plans data function
const fetchPlansData = async (
  searchTerm = "",
  activeFilter = "all",
  tagsFilter = "all",
  minSpeed = "",
  maxSpeed = "",
  minPrice = "",
  maxPrice = "",
  currencyFilter = "all"
) => {
  const params = new URLSearchParams();

  if (searchTerm) params.append("search", searchTerm);
  if (activeFilter !== "all") params.append("active", activeFilter);
  if (tagsFilter !== "all") params.append("tags", tagsFilter);
  if (minSpeed) params.append("minSpeed", minSpeed);
  if (maxSpeed) params.append("maxSpeed", maxSpeed);
  if (minPrice) params.append("minPrice", minPrice);
  if (maxPrice) params.append("maxPrice", maxPrice);
  if (currencyFilter !== "all") params.append("currency", currencyFilter);
  params.append("page", "1");
  params.append("limit", "20");

  const response = await fetch(`/api/admin/plans?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch admin plans data");
  }

  const data = await response.json();

  // Update cache with fresh data
  setCache(data);

  return data;
};

// View Plan Modal Component
function ViewPlanModal({ plan, isOpen, onClose }) {
  if (!isOpen || !plan) return null;

  // Status badge component
  const StatusBadge = ({ active }) => {
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}
      >
        {active ? "Active" : "Inactive"}
      </span>
    );
  };

  // Tags badges
  const TagsBadges = ({ tags }) => {
    const tagColors = {
      popular: "bg-blue-100 text-blue-800",
      "best-value": "bg-green-100 text-green-800",
      premium: "bg-purple-100 text-purple-800",
      basic: "bg-gray-100 text-gray-800",
      business: "bg-indigo-100 text-indigo-800",
      enterprise: "bg-orange-100 text-orange-800",
      featured: "bg-pink-100 text-pink-800",
    };

    if (!tags || tags.length === 0) {
      return <span className="text-gray-500">No tags</span>;
    }

    return (
      <div className="flex flex-wrap gap-1">
        {tags.map((tag, index) => (
          <span
            key={index}
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              tagColors[tag] || "bg-gray-100 text-gray-800"
            }`}
          >
            {tag
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="z-50 fixed inset-0 overflow-y-auto">
      <div className="sm:block flex justify-center items-center sm:p-0 px-4 pt-4 pb-20 min-h-screen text-center">
        <span
          className="hidden sm:inline-block sm:h-screen sm:align-middle"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div className="inline-block bg-white shadow-xl sm:my-8 rounded-lg sm:w-full sm:max-w-4xl overflow-hidden text-left sm:align-middle align-bottom transition-all transform">
          <div className="bg-white sm:p-6 px-4 pt-5 pb-4 sm:pb-4">
            <h3 className="mb-6 font-medium text-gray-900 text-lg leading-6">
              Plan Details: {plan.name}
            </h3>

            <div className="space-y-8">
              {/* Plan Overview */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="mb-4 font-medium text-gray-900">
                  Plan Overview
                </h4>
                <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                  <div>
                    <label className="block font-medium text-gray-500 text-sm">
                      Name
                    </label>
                    <p className="mt-1 text-gray-900">{plan.name}</p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-500 text-sm">
                      Slug
                    </label>
                    <p className="mt-1 text-gray-900">{plan.slug}</p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-500 text-sm">
                      Status
                    </label>
                    <div className="mt-1">
                      <StatusBadge active={plan.active} />
                    </div>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-500 text-sm">
                      Priority
                    </label>
                    <p className="mt-1 text-gray-900">{plan.priority}</p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-500 text-sm">
                      Created At
                    </label>
                    <p className="mt-1 text-gray-900">
                      {new Date(plan.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-500 text-sm">
                      Updated At
                    </label>
                    <p className="mt-1 text-gray-900">
                      {new Date(plan.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Speed and Pricing */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="mb-4 font-medium text-gray-900">
                  Speed & Pricing
                </h4>
                <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                  <div>
                    <label className="block font-medium text-gray-500 text-sm">
                      Download Speed
                    </label>
                    <p className="mt-1 text-gray-900">
                      {plan.speedMbps.download} Mbps
                    </p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-500 text-sm">
                      Upload Speed
                    </label>
                    <p className="mt-1 text-gray-900">
                      {plan.speedMbps.upload} Mbps
                    </p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-500 text-sm">
                      Monthly Price
                    </label>
                    <p className="mt-1 text-gray-900">
                      {plan.currency} {plan.priceMonthly.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-500 text-sm">
                      Yearly Price
                    </label>
                    <p className="mt-1 text-gray-900">
                      {plan.currency} {plan.priceYearly.toFixed(2)} (
                      {(
                        ((plan.priceMonthly * 12 - plan.priceYearly) /
                          (plan.priceMonthly * 12)) *
                        100
                      ).toFixed(1)}
                      % savings)
                    </p>
                  </div>
                  {plan.contractMonths > 0 && (
                    <div>
                      <label className="block font-medium text-gray-500 text-sm">
                        Contract Length
                      </label>
                      <p className="mt-1 text-gray-900">
                        {plan.contractMonths} months
                      </p>
                    </div>
                  )}
                  {plan.trialDays > 0 && (
                    <div>
                      <label className="block font-medium text-gray-500 text-sm">
                        Trial Period
                      </label>
                      <p className="mt-1 text-gray-900">
                        {plan.trialDays} days
                      </p>
                    </div>
                  )}
                  {plan.setupFee > 0 && (
                    <div>
                      <label className="block font-medium text-gray-500 text-sm">
                        Setup Fee
                      </label>
                      <p className="mt-1 text-gray-900">
                        {plan.currency} {plan.setupFee.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Features and Details */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="mb-4 font-medium text-gray-900">
                  Features & Details
                </h4>
                <div className="gap-6 grid grid-cols-1">
                  <div>
                    <label className="block font-medium text-gray-500 text-sm">
                      Description
                    </label>
                    <p className="mt-1 text-gray-900">
                      {plan.description || "No description provided"}
                    </p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-500 text-sm">
                      Tags
                    </label>
                    <div className="mt-1">
                      <TagsBadges tags={plan.tags} />
                    </div>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-500 text-sm">
                      Features
                    </label>
                    {plan.features && plan.features.length > 0 ? (
                      <ul className="space-y-1 mt-1">
                        {plan.features.map((feature, idx) => (
                          <li
                            key={idx}
                            className="flex items-center text-gray-900"
                          >
                            <svg
                              className="mr-2 w-4 h-4 text-green-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              ></path>
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">No features listed</p>
                    )}
                  </div>
                  <div>
                    <label className="block font-medium text-gray-500 text-sm">
                      Equipment Included
                    </label>
                    <p className="mt-1 text-gray-900">
                      {plan.equipmentIncluded ? "Yes" : "No"}
                    </p>
                  </div>
                  {plan.dataCapGB !== null && (
                    <div>
                      <label className="block font-medium text-gray-500 text-sm">
                        Data Cap
                      </label>
                      <p className="mt-1 text-gray-900">
                        {plan.dataCapGB} GB per month
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Gateway IDs */}
              {plan.gatewayPriceIds?.stripe?.monthly ||
              plan.gatewayPriceIds?.stripe?.yearly ? (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="mb-4 font-medium text-gray-900">
                    Gateway Price IDs
                  </h4>
                  <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                    {plan.gatewayPriceIds?.stripe?.monthly && (
                      <div>
                        <label className="block font-medium text-gray-500 text-sm">
                          Stripe Monthly
                        </label>
                        <p className="mt-1 font-mono text-gray-900 text-sm">
                          {plan.gatewayPriceIds.stripe.monthly}
                        </p>
                      </div>
                    )}
                    {plan.gatewayPriceIds?.stripe?.yearly && (
                      <div>
                        <label className="block font-medium text-gray-500 text-sm">
                          Stripe Yearly
                        </label>
                        <p className="mt-1 font-mono text-gray-900 text-sm">
                          {plan.gatewayPriceIds.stripe.yearly}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="bg-gray-50 px-4 sm:px-6 py-3">
            <button
              type="button"
              className="inline-flex justify-center bg-blue-600 hover:bg-blue-700 shadow-sm px-4 py-2 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full sm:w-auto font-medium text-white text-base cursor-pointer"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main content component that uses useSession
function PlansContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  // State for immediate display from cache
  const [cachedData, setCachedData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Add state for search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [tagsFilter, setTagsFilter] = useState("all");
  const [minSpeed, setMinSpeed] = useState("");
  const [maxSpeed, setMaxSpeed] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [currencyFilter, setCurrencyFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Use React Query for caching with background refresh
  const {
    data,
    isLoading: isQueryLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: [
      "adminPlans",
      searchTerm,
      activeFilter,
      tagsFilter,
      minSpeed,
      maxSpeed,
      minPrice,
      maxPrice,
      currencyFilter,
    ],
    queryFn: () =>
      fetchPlansData(
        searchTerm,
        activeFilter,
        tagsFilter,
        minSpeed,
        maxSpeed,
        minPrice,
        maxPrice,
        currencyFilter
      ),
    enabled: status === "authenticated" && session?.user?.role === "admin",
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 1,
  });

  // Load from cache immediately on mount
  useEffect(() => {
    const cache = getCache();
    if (cache) {
      setCachedData(cache);
    }

    // Only fetch fresh data if authenticated
    if (status === "authenticated" && session?.user?.role === "admin") {
      // If we have cache, show it immediately and refresh in background
      if (cache) {
        setIsLoading(false);
      }

      // Always fetch fresh data
      fetchPlansData(
        searchTerm,
        activeFilter,
        tagsFilter,
        minSpeed,
        maxSpeed,
        minPrice,
        maxPrice,
        currencyFilter
      )
        .then((freshData) => {
          setCachedData(freshData);
          setIsLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setIsLoading(false);

          // If we have cache but fetch failed, keep using cache
          if (!cachedData && cache) {
            setCachedData(cache);
          }
        });
    }
  }, [
    status,
    session,
    searchTerm,
    activeFilter,
    tagsFilter,
    minSpeed,
    maxSpeed,
    minPrice,
    maxPrice,
    currencyFilter,
  ]);

  // Handle visibility change for background refresh
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        status === "authenticated" &&
        session?.user?.role === "admin"
      ) {
        // Refresh data when tab becomes visible
        refetch();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [status, session, refetch]);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (
      status === "authenticated" &&
      !["admin", "ops"].includes(session?.user?.role)
    ) {
      // Redirect non-admin users to their appropriate dashboards
      if (session?.user?.role === "customer") {
        router.push("/dashboard");
      } else if (session?.user?.role === "support") {
        router.push("/support");
      } else {
        router.push("/");
      }
    }
  }, [status, session, router]);

  // Handle opening the modal
  const openPlanDetails = (plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  // Handle closing the modal
  const closePlanDetails = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
  };

  // Status badge component
  const StatusBadge = ({ active }) => {
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}
      >
        {active ? "Active" : "Inactive"}
      </span>
    );
  };

  // Don't show anything until we determine what to display
  if (status === "loading" || isLoading) {
    return (
      <div className="flex mt-15">
        <Sidebar />
        <div className="mx-auto px-2 sm:px-2 md:px-3 py-8 w-full max-w-auto">
          <div className="mb-8">
            <h1 className="font-semibold text-gray-900 text-2xl">
              Service Plans
            </h1>
            <p className="mt-1 text-gray-500 text-sm">
              Manage internet service plans and pricing
            </p>
          </div>

          <SkeletonTable columns={7} rows={10} />
        </div>
      </div>
    );
  }

  if (queryError && !cachedData) {
    return (
      <div className="flex mt-15">
        <Sidebar />
        <div className="mx-auto px-2 sm:px-2 md:px-3 py-8 w-full max-w-auto">
          <div className="mb-8">
            <h1 className="font-semibold text-gray-900 text-2xl">
              Service Plans
            </h1>
            <p className="mt-1 text-gray-500 text-sm">
              Manage internet service plans and pricing
            </p>
          </div>

          <div className="bg-red-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="w-5 h-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 10-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-red-800">
                  Error loading plans
                </h3>
                <div className="mt-2 text-red-700">
                  <p>{queryError.message}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => refetch()}
                    className="bg-red-50 hover:bg-red-100 px-3 py-2 rounded-md font-medium text-red-600"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cachedData) {
    return (
      <div className="flex mt-15">
        <Sidebar />
        <div className="mx-auto px-2 sm:px-2 md:px-3 py-8 w-full max-w-auto">
          <div className="mb-8">
            <h1 className="font-semibold text-gray-900 text-2xl">
              Service Plans
            </h1>
            <p className="mt-1 text-gray-500 text-sm">
              Manage internet service plans and pricing
            </p>
          </div>

          <div className="bg-white shadow mb-6 rounded-lg">
            <div className="px-6 py-4 border-gray-200 border-b">
              <div className="flex md:flex-row flex-col md:justify-between md:items-center space-y-4 md:space-y-0">
                {/* Search Bar */}
                <div className="flex-1 max-w-lg">
                  <SearchBar
                    placeholder="Search by plan name, description, or slug..."
                    onSearch={setSearchTerm}
                    initialValue={searchTerm}
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4">
                  <FilterDropdown
                    label="Status"
                    options={[
                      { value: "all", label: "All Statuses" },
                      { value: "true", label: "Active" },
                      { value: "false", label: "Inactive" },
                    ]}
                    value={activeFilter}
                    onChange={setActiveFilter}
                  />

                  <FilterDropdown
                    label="Tags"
                    options={[
                      { value: "all", label: "All Tags" },
                      { value: "popular", label: "Popular" },
                      { value: "best-value", label: "Best Value" },
                      { value: "premium", label: "Premium" },
                      { value: "basic", label: "Basic" },
                      { value: "business", label: "Business" },
                      { value: "enterprise", label: "Enterprise" },
                      { value: "featured", label: "Featured" },
                    ]}
                    value={tagsFilter}
                    onChange={setTagsFilter}
                  />

                  <FilterDropdown
                    label="Currency"
                    options={[
                      { value: "all", label: "All Currencies" },
                      { value: "USD", label: "USD" },
                      { value: "EUR", label: "EUR" },
                      { value: "GBP", label: "GBP" },
                      { value: "CAD", label: "CAD" },
                      { value: "AUD", label: "AUD" },
                    ]}
                    value={currencyFilter}
                    onChange={setCurrencyFilter}
                  />
                </div>
              </div>

              {/* Advanced Filters */}
              <div className="mt-4 pt-4 border-gray-200 border-t">
                <div className="gap-4 grid grid-cols-1 md:grid-cols-4">
                  <div>
                    <label
                      htmlFor="minSpeed"
                      className="block font-medium text-gray-700 text-sm"
                    >
                      Min Speed (Mbps)
                    </label>
                    <input
                      type="number"
                      id="minSpeed"
                      value={minSpeed}
                      onChange={(e) => setMinSpeed(e.target.value)}
                      className="block shadow-sm mt-1 border-gray-300 focus:border-blue-500 rounded-md focus:ring-blue-500 w-full sm:text-sm"
                      placeholder="e.g., 100"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="maxSpeed"
                      className="block font-medium text-gray-700 text-sm"
                    >
                      Max Speed (Mbps)
                    </label>
                    <input
                      type="number"
                      id="maxSpeed"
                      value={maxSpeed}
                      onChange={(e) => setMaxSpeed(e.target.value)}
                      className="block shadow-sm mt-1 border-gray-300 focus:border-blue-500 rounded-md focus:ring-blue-500 w-full sm:text-sm"
                      placeholder="e.g., 1000"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="minPrice"
                      className="block font-medium text-gray-700 text-sm"
                    >
                      Min Monthly Price
                    </label>
                    <input
                      type="number"
                      id="minPrice"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="block shadow-sm mt-1 border-gray-300 focus:border-blue-500 rounded-md focus:ring-blue-500 w-full sm:text-sm"
                      placeholder="e.g., 29.99"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="maxPrice"
                      className="block font-medium text-gray-700 text-sm"
                    >
                      Max Monthly Price
                    </label>
                    <input
                      type="number"
                      id="maxPrice"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="block shadow-sm mt-1 border-gray-300 focus:border-blue-500 rounded-md focus:ring-blue-500 w-full sm:text-sm"
                      placeholder="e.g., 99.99"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <DataTable
                headers={[
                  "Name",
                  "Speed",
                  "Price",
                  "Status",
                  "Tags",
                  "Priority",
                  "Actions",
                ]}
              >
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-4 text-gray-500 text-center"
                  >
                    No plans found matching your criteria.
                  </td>
                </tr>
              </DataTable>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex mt-15">
      <Sidebar />
      <div className="mx-auto px-2 sm:px-2 md:px-3 py-8 w-full max-w-auto">
        <div className="mb-8">
          <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center">
            <div>
              <h1 className="font-semibold text-gray-900 text-2xl">
                Service Plans
              </h1>
              <p className="mt-1 text-gray-500 text-sm">
                Manage internet service plans and pricing
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/admin/plan/add")}
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 shadow-sm px-4 py-2 border border-transparent rounded-md font-medium text-white text-sm cursor-pointer"
            >
              <svg
                className="mr-2 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add New Plan
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white shadow mb-6 rounded-lg">
          <div className="px-6 py-4 border-gray-200 border-b">
            <div className="flex md:flex-row flex-col md:justify-between md:items-center space-y-4 md:space-y-0">
              {/* Search Bar */}
              <div className="flex-1 max-w-lg">
                <SearchBar
                  placeholder="Search by plan name, description, or slug..."
                  onSearch={setSearchTerm}
                  initialValue={searchTerm}
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-4">
                <FilterDropdown
                  label="Status"
                  options={[
                    { value: "all", label: "All Statuses" },
                    { value: "true", label: "Active" },
                    { value: "false", label: "Inactive" },
                  ]}
                  value={activeFilter}
                  onChange={setActiveFilter}
                />

                <FilterDropdown
                  label="Tags"
                  options={[
                    { value: "all", label: "All Tags" },
                    { value: "popular", label: "Popular" },
                    { value: "best-value", label: "Best Value" },
                    { value: "premium", label: "Premium" },
                    { value: "basic", label: "Basic" },
                    { value: "business", label: "Business" },
                    { value: "enterprise", label: "Enterprise" },
                    { value: "featured", label: "Featured" },
                  ]}
                  value={tagsFilter}
                  onChange={setTagsFilter}
                />

                <FilterDropdown
                  label="Currency"
                  options={[
                    { value: "all", label: "All Currencies" },
                    { value: "USD", label: "USD" },
                    { value: "EUR", label: "EUR" },
                    { value: "GBP", label: "GBP" },
                    { value: "CAD", label: "CAD" },
                    { value: "AUD", label: "AUD" },
                  ]}
                  value={currencyFilter}
                  onChange={setCurrencyFilter}
                />
              </div>
            </div>

            {/* Advanced Filters */}
            <div className="mt-4 pt-4 border-gray-200 border-t">
              <div className="gap-4 grid grid-cols-1 md:grid-cols-4">
                <div>
                  <label
                    htmlFor="minSpeed"
                    className="block font-medium text-gray-700 text-sm"
                  >
                    Min Speed (Mbps)
                  </label>
                  <input
                    type="number"
                    id="minSpeed"
                    value={minSpeed}
                    onChange={(e) => setMinSpeed(e.target.value)}
                    className="block shadow-sm mt-1 border-gray-300 focus:border-blue-500 rounded-md focus:ring-blue-500 w-full sm:text-sm"
                    placeholder="e.g., 100"
                  />
                </div>
                <div>
                  <label
                    htmlFor="maxSpeed"
                    className="block font-medium text-gray-700 text-sm"
                  >
                    Max Speed (Mbps)
                  </label>
                  <input
                    type="number"
                    id="maxSpeed"
                    value={maxSpeed}
                    onChange={(e) => setMaxSpeed(e.target.value)}
                    className="block shadow-sm mt-1 border-gray-300 focus:border-blue-500 rounded-md focus:ring-blue-500 w-full sm:text-sm"
                    placeholder="e.g., 1000"
                  />
                </div>
                <div>
                  <label
                    htmlFor="minPrice"
                    className="block font-medium text-gray-700 text-sm"
                  >
                    Min Monthly Price
                  </label>
                  <input
                    type="number"
                    id="minPrice"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="block shadow-sm mt-1 border-gray-300 focus:border-blue-500 rounded-md focus:ring-blue-500 w-full sm:text-sm"
                    placeholder="e.g., 29.99"
                  />
                </div>
                <div>
                  <label
                    htmlFor="maxPrice"
                    className="block font-medium text-gray-700 text-sm"
                  >
                    Max Monthly Price
                  </label>
                  <input
                    type="number"
                    id="maxPrice"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="block shadow-sm mt-1 border-gray-300 focus:border-blue-500 rounded-md focus:ring-blue-500 w-full sm:text-sm"
                    placeholder="e.g., 99.99"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Plans Table */}
          <div className="overflow-x-auto">
            <DataTable
              headers={[
                "Name",
                "Speed",
                "Price",
                "Status",
                "Tags",
                "Priority",
                "Actions",
              ]}
            >
              {cachedData?.plans?.length > 0 ? (
                cachedData.plans.map((plan) => (
                  <tr key={plan._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {plan.name}
                      </div>
                      <div className="text-gray-500 text-sm">{plan.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">
                        {plan.speedMbps.download} Mbps ↓
                      </div>
                      <div className="text-gray-500 text-sm">
                        {plan.speedMbps.upload} Mbps ↑
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {plan.currency} {plan.priceMonthly.toFixed(2)}/mo
                      </div>
                      <div className="text-gray-500 text-sm">
                        {plan.currency} {plan.priceYearly.toFixed(2)}/yr
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge active={plan.active} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {plan.tags && plan.tags.length > 0 ? (
                          plan.tags.map((tag, index) => (
                            <span
                              key={index}
                              className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                tag === "popular"
                                  ? "bg-blue-100 text-blue-800"
                                  : tag === "best-value"
                                  ? "bg-green-100 text-green-800"
                                  : tag === "premium"
                                  ? "bg-purple-100 text-purple-800"
                                  : tag === "basic"
                                  ? "bg-gray-100 text-gray-800"
                                  : tag === "business"
                                  ? "bg-indigo-100 text-indigo-800"
                                  : tag === "enterprise"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-pink-100 text-pink-800"
                              }`}
                            >
                              {tag
                                .split("-")
                                .map(
                                  (word) =>
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                )
                                .join(" ")}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500">No tags</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900 whitespace-nowrap">
                      {plan.priority}
                    </td>
                    <td className="px-6 py-4 font-medium text-sm text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openPlanDetails(plan)}
                        className="mr-4 text-blue-600 hover:text-blue-900 cursor-pointer"
                      >
                        View Details
                      </button>
                      <div className="flex space-x-2 ml-2">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(`/admin/plan/${plan._id}/edit`)
                          }
                          className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            router.push(`/admin/plan/${plan._id}/delete`)
                          }
                          className="text-red-600 hover:text-red-900 cursor-pointer"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-4 text-gray-500 text-center"
                  >
                    No plans found matching your criteria.
                  </td>
                </tr>
              )}
            </DataTable>
          </div>

          {/* Pagination */}
          {cachedData?.pagination && (
            <div className="px-6 py-4 border-gray-200 border-t">
              <Pagination
                currentPage={currentPage}
                totalPages={cachedData.pagination.totalPages}
                totalItems={cachedData.pagination.totalItems}
                itemsPerPage={cachedData.pagination.itemsPerPage}
                onPageChange={() => {}}
              />
            </div>
          )}
        </div>

        {/* Modal will be rendered here */}
        <ViewPlanModal
          plan={selectedPlan}
          isOpen={isModalOpen}
          onClose={closePlanDetails}
        />
      </div>
    </div>
  );
}

// Wrap the entire page with SessionProvider
export default function PlansPage() {
  return (
    <SessionProvider>
      <PlansContent />
    </SessionProvider>
  );
}
