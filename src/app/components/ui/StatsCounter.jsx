// components/ui/StatsCounter.jsx
"use client"
import React, { useState, useEffect } from 'react';

export default function StatsCounter({ value, label, suffix = "", duration = 2000 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (end === 0) return;
    
    const range = end - start;
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor(duration / range));
    
    const timer = setInterval(() => {
      start += increment;
      setCount(start);
      if (start === end) {
        clearInterval(timer);
      }
    }, stepTime);
    
    return () => clearInterval(timer);
  }, [value, duration]);

  return (
    <div className="text-center">
      <div className="mb-2 font-bold text-gray-800 text-4xl md:text-5xl">
        {count}{suffix}
      </div>
      <div className="font-medium text-gray-600">{label}</div>
    </div>
  );
}