// app/context/CustomerContext.jsx
'use client';

import { createContext, useContext, useState } from 'react';

const CustomerContext = createContext();

export function CustomerProvider({ children }) {
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [viewMode, setViewMode] = useState('view'); // 'view' or 'edit'

  const openCustomer = (customer, mode = 'view') => {
    setCurrentCustomer(customer);
    setCurrentOrder(null);
    setViewMode(mode);
  };

  const openOrder = (order, mode = 'view') => {
    setCurrentOrder(order);
    setCurrentCustomer(null);
    setViewMode(mode);
  };

  const closeCustomer = () => {
    setCurrentCustomer(null);
    setCurrentOrder(null);
    setViewMode('view');
  };

  return (
    <CustomerContext.Provider value={{
      currentCustomer,
      currentOrder,
      viewMode,
      openCustomer,
      openOrder,
      closeCustomer
    }}>
      {children}
    </CustomerContext.Provider>
  );
}

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
};