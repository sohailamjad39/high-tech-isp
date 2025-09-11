// app/admin/customers/page.jsx
"use client";

import { useState, useEffect } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

// Components (using relative paths instead of absolute)
import DataTable from "@/app/components/admin/DataTable";
import SearchBar from "@/app/components/admin/SearchBar";
import FilterDropdown from "@/app/components/admin/FilterDropdown";
import Pagination from "@/app/components/admin/Pagination";
import SkeletonTable from "@/app/components/admin/SkeletonTable";
import Sidebar from "@/app/components/admin/dashboard/Sidebar";

// Main content component that uses useSession
function CustomersContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  // State for filters and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch customers data
  const fetchCustomers = async () => {
    const params = new URLSearchParams();

    if (searchTerm) params.append("search", searchTerm);
    if (statusFilter !== "all") params.append("status", statusFilter);
    if (roleFilter !== "all") params.append("role", roleFilter);
    params.append("page", currentPage);
    params.append("limit", itemsPerPage);

    const response = await fetch(`/api/admin/customers?${params.toString()}`);

    if (!response.ok) {
      throw new Error("Failed to fetch customers");
    }

    return response.json();
  };

  const {
    data: customersData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["customers", searchTerm, statusFilter, roleFilter, currentPage],
    queryFn: fetchCustomers,
    enabled: status === "authenticated" && session?.user?.role === "admin",
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    cacheTime: 5 * 60 * 1000, // Keep in cache for 5 minutes,
    refetchOnWindowFocus: false,
  });

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/");
    }
  }, [status, session, router]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, roleFilter]);

  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // Handle filter changes
  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
  };

  const handleRoleFilterChange = (value) => {
    setRoleFilter(value);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      suspended: "bg-red-100 text-red-800",
      invited: "bg-yellow-100 text-yellow-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          colors[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Role badge component
  const RoleBadge = ({ role }) => {
    const colors = {
      customer: "bg-blue-100 text-blue-800",
      tech: "bg-purple-100 text-purple-800",
      support: "bg-indigo-100 text-indigo-800",
      ops: "bg-orange-100 text-orange-800",
      admin: "bg-red-100 text-red-800",
      visitor: "bg-gray-100 text-gray-800"
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          colors[role] || "bg-gray-100 text-gray-800"
        }`}
      >
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex mt-15">
        <Sidebar />
        <div className="mx-auto px-2 sm:px-2 md:px-3 py-8 max-w-auto">
          <div className="mb-8">
            <h1 className="font-semibold text-gray-900 text-2xl">Customers</h1>
            <p className="mt-1 text-gray-500 text-sm">
              Manage your customer base
            </p>
          </div>

          <SkeletonTable columns={6} rows={10} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex mt-15">
        <Sidebar />
        <div className="mx-auto px-2 sm:px-2 md:px-3 py-8 max-w-auto">
          <div className="mb-8">
            <h1 className="font-semibold text-gray-900 text-2xl">Customers</h1>
            <p className="mt-1 text-gray-500 text-sm">
              Manage your customer base
            </p>
          </div>

          <div className="bg-red-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="w-5 h-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 10-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-red-800 text-sm">
                  Error loading customers
                </h3>
                <div className="mt-2 text-red-700 text-sm">
                  <p>{error.message}</p>
                </div>
                <div className="mt-4">
                  <div className="flex -mx-2 -my-1.5">
                    <button
                      onClick={() => refetch()}
                      className="bg-red-50 hover:bg-red-100 px-2 py-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 font-medium text-red-600 text-sm"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex mt-15">
      <Sidebar />
      <div className="mx-auto px-2 sm:px-2 md:px-3 py-8 max-w-auto">
        <div className="mb-8">
          <h1 className="font-semibold text-gray-900 text-2xl">Customers</h1>
          <p className="mt-1 text-gray-500 text-sm">
            Manage your customer base including visitors
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white shadow mb-6 rounded-lg">
          <div className="px-6 py-4 border-gray-200 border-b">
            <div className="flex md:flex-row flex-col md:justify-between md:items-center space-y-4 md:space-y-0">
              {/* Search Bar */}
              <div className="flex-1 max-w-lg">
                <SearchBar
                  placeholder="Search by name, email, phone..."
                  onSearch={handleSearch}
                  initialValue={searchTerm}
                />
              </div>

              {/* Filters */}
              <div className="flex space-x-4">
                <FilterDropdown
                  label="Status"
                  options={[
                    { value: "all", label: "All Statuses" },
                    { value: "active", label: "Active" },
                    { value: "suspended", label: "Suspended" },
                    { value: "invited", label: "Invited" },
                  ]}
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                />

                <FilterDropdown
                  label="Role"
                  options={[
                    { value: "all", label: "All Roles" },
                    { value: "customer", label: "Customer" },
                    { value: "tech", label: "Technician" },
                    { value: "support", label: "Support" },
                    { value: "ops", label: "Operations" },
                    { value: "admin", label: "Admin" },
                    { value: "visitor", label: "Visitor" }
                  ]}
                  value={roleFilter}
                  onChange={handleRoleFilterChange}
                />
              </div>
            </div>
          </div>

          {/* Customer Table */}
          <div className="overflow-x-auto">
            <DataTable
              headers={[
                "Name",
                "Email",
                "Phone",
                "Role",
                "Status",
                "Created"
              ]}
            >
              {customersData?.customers?.length > 0 ? (
                customersData.customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10">
                          <div className="flex justify-center items-center bg-gradient-to-r from-blue-500 to-purple-600 rounded-full w-10 h-10 font-medium text-white">
                            {customer.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900 text-sm">
                            {customer.name}
                          </div>
                          {customer.emailVerifiedAt && (
                            <div className="flex items-center mt-1 text-green-600 text-sm">
                              <svg
                                className="mr-1 w-4 h-4"
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
                              Verified
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900 text-sm">
                        {customer.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900 text-sm">
                        {customer.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <RoleBadge role={customer.role} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={customer.status} />
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm whitespace-nowrap">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-gray-500 text-center"
                  >
                    No customers found matching your criteria.
                  </td>
                </tr>
              )}
            </DataTable>
          </div>

          {/* Pagination */}
          {customersData?.pagination && (
            <div className="px-6 py-4 border-gray-200 border-t">
              <Pagination
                currentPage={currentPage}
                totalPages={customersData.pagination.totalPages}
                totalItems={customersData.pagination.totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main Customers Page with SessionProvider
export default function CustomersPage() {
  return (
    <SessionProvider>
      <CustomersContent />
    </SessionProvider>
  );
}