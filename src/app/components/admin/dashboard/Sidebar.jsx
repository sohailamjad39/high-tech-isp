// app/components/admin/dashboard/Sidebar.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";

// Function to fetch admin icon metadata
const fetchAdminIcon = (iconName) => {
  return async () => {
    // In production, you might fetch actual image dimensions from an API
    // For now, return static data for all icons
    return {
      src: `/admin/${iconName}.svg`,
      alt: "",
      width: 20,
      height: 20,
    };
  };
};

export default function Sidebar() {
  const pathname = usePathname();

  // Pre-fetch all icon metadata
  const { data: dashboardIcon } = useQuery({
    queryKey: ["admin-icon", "dashboard"],
    queryFn: fetchAdminIcon("dashboard"),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    cacheTime: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  const { data: customersIcon } = useQuery({
    queryKey: ["admin-icon", "customers"],
    queryFn: fetchAdminIcon("customers"),
    staleTime: 24 * 60 * 60 * 1000,
    cacheTime: 7 * 24 * 60 * 60 * 1000,
  });

  const { data: ordersIcon } = useQuery({
    queryKey: ["admin-icon", "orders"],
    queryFn: fetchAdminIcon("orders"),
    staleTime: 24 * 60 * 60 * 1000,
    cacheTime: 7 * 24 * 60 * 60 * 1000,
  });

  const { data: subscriptionIcon } = useQuery({
    queryKey: ["admin-icon", "subscription"],
    queryFn: fetchAdminIcon("subscription"),
    staleTime: 24 * 60 * 60 * 1000,
    cacheTime: 7 * 24 * 60 * 60 * 1000,
  });

  const { data: billingIcon } = useQuery({
    queryKey: ["admin-icon", "billing"],
    queryFn: fetchAdminIcon("billing"),
    staleTime: 24 * 60 * 60 * 1000,
    cacheTime: 7 * 24 * 60 * 60 * 1000,
  });

  const { data: ticketsIcon } = useQuery({
    queryKey: ["admin-icon", "tickets"],
    queryFn: fetchAdminIcon("tickets"),
    staleTime: 24 * 60 * 60 * 1000,
    cacheTime: 7 * 24 * 60 * 60 * 1000,
  });

  const { data: techniciansIcon } = useQuery({
    queryKey: ["admin-icon", "technicians"],
    queryFn: fetchAdminIcon("technicians"),
    staleTime: 24 * 60 * 60 * 1000,
    cacheTime: 7 * 24 * 60 * 60 * 1000,
  });

  const { data: plansIcon } = useQuery({
    queryKey: ["admin-icon", "plans"],
    queryFn: fetchAdminIcon("plans"),
    staleTime: 24 * 60 * 60 * 1000,
    cacheTime: 7 * 24 * 60 * 60 * 1000,
  });

  const { data: coverageIcon } = useQuery({
    queryKey: ["admin-icon", "coverage"],
    queryFn: fetchAdminIcon("coverage"),
    staleTime: 24 * 60 * 60 * 1000,
    cacheTime: 7 * 24 * 60 * 60 * 1000,
  });

  const { data: officeIcon } = useQuery({
    queryKey: ["admin-icon", "office"],
    queryFn: fetchAdminIcon("office"),
    staleTime: 24 * 60 * 60 * 1000,
    cacheTime: 7 * 24 * 60 * 60 * 1000,
  });

  const { data: cmsIcon } = useQuery({
    queryKey: ["admin-icon", "cms"],
    queryFn: fetchAdminIcon("cms"),
    staleTime: 24 * 60 * 60 * 1000,
    cacheTime: 7 * 24 * 60 * 60 * 1000,
  });

  const { data: promocodeIcon } = useQuery({
    queryKey: ["admin-icon", "promocode"],
    queryFn: fetchAdminIcon("promocode"),
    staleTime: 24 * 60 * 60 * 1000,
    cacheTime: 7 * 24 * 60 * 60 * 1000,
  });

  const { data: reportIcon } = useQuery({
    queryKey: ["admin-icon", "report"],
    queryFn: fetchAdminIcon("report"),
    staleTime: 24 * 60 * 60 * 1000,
    cacheTime: 7 * 24 * 60 * 60 * 1000,
  });

  const { data: auditIcon } = useQuery({
    queryKey: ["admin-icon", "audit"],
    queryFn: fetchAdminIcon("audit"),
    staleTime: 24 * 60 * 60 * 1000,
    cacheTime: 7 * 24 * 60 * 60 * 1000,
  });

  const { data: settingsIcon } = useQuery({
    queryKey: ["admin-icon", "settings"],
    queryFn: fetchAdminIcon("settings"),
    staleTime: 24 * 60 * 60 * 1000,
    cacheTime: 7 * 24 * 60 * 60 * 1000,
  });

  return (
    <div className="flex flex-col bg-white shadow-lg w-64">
      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
        {/* Dashboard */}
        <Link
          href="/admin/dashboard"
          className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${
            pathname === "/admin/dashboard"
              ? "bg-blue-100 text-blue-800"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <span className="mr-3">
            {dashboardIcon && (
              <Image
                src={dashboardIcon.src}
                alt={dashboardIcon.alt}
                width={dashboardIcon.width}
                height={dashboardIcon.height}
                className="w-5 h-5"
                priority={true}
              />
            )}
          </span>
          Dashboard
        </Link>

        {/* Customers */}
        <Link
          href="/admin/customers"
          className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${
            pathname === "/admin/customers"
              ? "bg-blue-100 text-blue-800"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <span className="mr-3">
            {customersIcon && (
              <Image
                src={customersIcon.src}
                alt={customersIcon.alt}
                width={customersIcon.width}
                height={customersIcon.height}
                className="w-5 h-5"
                priority={true}
              />
            )}
          </span>
          Customers
        </Link>

        {/* Orders */}
        <Link
          href="/admin/orders"
          className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${
            pathname === "/admin/orders"
              ? "bg-blue-100 text-blue-800"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <span className="mr-3">
            {ordersIcon && (
              <Image
                src={ordersIcon.src}
                alt={ordersIcon.alt}
                width={ordersIcon.width}
                height={ordersIcon.height}
                className="w-5 h-5"
                priority={true}
              />
            )}
          </span>
          Orders
        </Link>

        {/* Subscriptions */}
        <Link
          href="/admin/subscriptions"
          className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${
            pathname === "/admin/subscriptions"
              ? "bg-blue-100 text-blue-800"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <span className="mr-3">
            {subscriptionIcon && (
              <Image
                src={subscriptionIcon.src}
                alt={subscriptionIcon.alt}
                width={subscriptionIcon.width}
                height={subscriptionIcon.height}
                className="w-5 h-5"
                priority={true}
              />
            )}
          </span>
          Subscriptions
        </Link>

        {/* Billing */}
        <Link
          href="/admin/billing"
          className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${
            pathname === "/admin/billing"
              ? "bg-blue-100 text-blue-800"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <span className="mr-3">
            {billingIcon && (
              <Image
                src={billingIcon.src}
                alt={billingIcon.alt}
                width={billingIcon.width}
                height={billingIcon.height}
                className="w-5 h-5"
                priority={true}
              />
            )}
          </span>
          Billing
        </Link>

        {/* Tickets */}
        <Link
          href="/admin/tickets"
          className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${
            pathname === "/admin/tickets"
              ? "bg-blue-100 text-blue-800"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <span className="mr-3">
            {ticketsIcon && (
              <Image
                src={ticketsIcon.src}
                alt={ticketsIcon.alt}
                width={ticketsIcon.width}
                height={ticketsIcon.height}
                className="w-5 h-5"
                priority={true}
              />
            )}
          </span>
          Tickets
        </Link>

        {/* Technicians */}
        <Link
          href="/admin/technicians"
          className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${
            pathname === "/admin/technicians"
              ? "bg-blue-100 text-blue-800"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <span className="mr-3">
            {techniciansIcon && (
              <Image
                src={techniciansIcon.src}
                alt={techniciansIcon.alt}
                width={techniciansIcon.width}
                height={techniciansIcon.height}
                className="w-5 h-5"
                priority={true}
              />
            )}
          </span>
          Technicians
        </Link>

        {/* Plans */}
        <Link
          href="/admin/plans"
          className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${
            pathname === "/admin/plans"
              ? "bg-blue-100 text-blue-800"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <span className="mr-3">
            {plansIcon && (
              <Image
                src={plansIcon.src}
                alt={plansIcon.alt}
                width={plansIcon.width}
                height={plansIcon.height}
                className="w-5 h-5"
                priority={true}
              />
            )}
          </span>
          Plans
        </Link>

        {/* Coverage */}
        <Link
          href="/admin/coverage"
          className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${
            pathname === "/admin/coverage"
              ? "bg-blue-100 text-blue-800"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <span className="mr-3">
            {coverageIcon && (
              <Image
                src={coverageIcon.src}
                alt={coverageIcon.alt}
                width={coverageIcon.width}
                height={coverageIcon.height}
                className="w-5 h-5"
                priority={true}
              />
            )}
          </span>
          Coverage
        </Link>

        {/* Offices */}
        <Link
          href="/admin/offices"
          className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${
            pathname === "/admin/offices"
              ? "bg-blue-100 text-blue-800"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <span className="mr-3">
            {officeIcon && (
              <Image
                src={officeIcon.src}
                alt={officeIcon.alt}
                width={officeIcon.width}
                height={officeIcon.height}
                className="w-5 h-5"
                priority={true}
              />
            )}
          </span>
          Offices
        </Link>

        {/* CMS */}
        <Link
          href="/admin/cms"
          className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${
            pathname === "/admin/cms"
              ? "bg-blue-100 text-blue-800"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <span className="mr-3">
            {cmsIcon && (
              <Image
                src={cmsIcon.src}
                alt={cmsIcon.alt}
                width={cmsIcon.width}
                height={cmsIcon.height}
                className="w-5 h-5"
                priority={true}
              />
            )}
          </span>
          CMS
        </Link>

        {/* Promo Codes */}
        <Link
          href="/admin/promo-codes"
          className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${
            pathname === "/admin/promo-codes"
              ? "bg-blue-100 text-blue-800"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <span className="mr-3">
            {promocodeIcon && (
              <Image
                src={promocodeIcon.src}
                alt={promocodeIcon.alt}
                width={promocodeIcon.width}
                height={promocodeIcon.height}
                className="w-5 h-5"
                priority={true}
              />
            )}
          </span>
          Promo Codes
        </Link>

        {/* Reports */}
        <Link
          href="/admin/reports"
          className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${
            pathname === "/admin/reports"
              ? "bg-blue-100 text-blue-800"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <span className="mr-3">
            {reportIcon && (
              <Image
                src={reportIcon.src}
                alt={reportIcon.alt}
                width={reportIcon.width}
                height={reportIcon.height}
                className="w-5 h-5"
                priority={true}
              />
            )}
          </span>
          Reports
        </Link>

        {/* Audit Log */}
        <Link
          href="/admin/audit"
          className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${
            pathname === "/admin/audit"
              ? "bg-blue-100 text-blue-800"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <span className="mr-3">
            {auditIcon && (
              <Image
                src={auditIcon.src}
                alt={auditIcon.alt}
                width={auditIcon.width}
                height={auditIcon.height}
                className="w-5 h-5"
                priority={true}
              />
            )}
          </span>
          Audit Log
        </Link>

        {/* Settings */}
        <Link
          href="/admin/settings"
          className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${
            pathname === "/admin/settings"
              ? "bg-blue-100 text-blue-800"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <span className="mr-3">
            {settingsIcon && (
              <Image
                src={settingsIcon.src}
                alt={settingsIcon.alt}
                width={settingsIcon.width}
                height={settingsIcon.height}
                className="w-5 h-5"
                priority={true}
              />
            )}
          </span>
          Settings
        </Link>
      </nav>
    </div>
  );
}
