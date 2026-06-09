"use client";

import React from 'react';
import { useCarbonStore } from '../infrastructure/storage/CarbonStore';
import { calculateMonthlyCarbon } from '../core/engine/carbonMath';

/**
 * Premium Emissions Bar Chart component.
 * Displays calculated metrics (Transport, Energy, Diet, Waste) dynamically compared against global averages.
 * Integrates an invisible summary table for screen readers to fulfill WCAG contrast and accessibility compliance.
 */
export default function EmissionsChart() {
  const { state } = useCarbonStore();
  const emissions = calculateMonthlyCarbon(state.carbonData);

  const globalAvg = {
    transport: 120,
    energy: 150,
    diet: 100,
    waste: 30,
    total: 400
  };

  const maxCategory = 300;
  const getPct = (val: number) => Math.min(100, Math.max(8, (val / maxCategory) * 100));

  const totalDeltaPct = Math.round(((emissions.total - globalAvg.total) / globalAvg.total) * 100);
  const deltaLabel = totalDeltaPct < 0 ? `${Math.abs(totalDeltaPct)}% lower` : `${totalDeltaPct}% higher`;

  return (
    <div className="glass-panel rounded-xl p-6 flex flex-col glow-effect">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-headline-md text-headline-md text-on-surface">Carbon Pulse</h2>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant mb-1">Delta vs Global Avg</p>
          <span className={`text-xl font-extrabold ${totalDeltaPct <= 0 ? 'text-primary' : 'text-error'}`}>
            {totalDeltaPct <= 0 ? '-' : '+'}{Math.abs(totalDeltaPct)}%
          </span>
        </div>
      </div>

      {/* Screen Reader Accessible Table Summary (visually hidden but fully descriptive) */}
      <div style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
        <h3>Emissions Comparison Table</h3>
        <table>
          <thead>
            <tr>
              <th scope="col">Category</th>
              <th scope="col">Your Emissions (Monthly)</th>
              <th scope="col">Global Average (Monthly)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Transportation</td>
              <td>{emissions.transport} kg CO₂</td>
              <td>{globalAvg.transport} kg CO₂</td>
            </tr>
            <tr>
              <td>Home Energy</td>
              <td>{emissions.energy} kg CO₂</td>
              <td>{globalAvg.energy} kg CO₂</td>
            </tr>
            <tr>
              <td>Diet</td>
              <td>{emissions.diet} kg CO₂</td>
              <td>{globalAvg.diet} kg CO₂</td>
            </tr>
            <tr>
              <td>Waste</td>
              <td>{emissions.waste} kg CO₂</td>
              <td>{globalAvg.waste} kg CO₂</td>
            </tr>
            <tr>
              <td>Total</td>
              <td>{emissions.total} kg CO₂</td>
              <td>{globalAvg.total} kg CO₂</td>
            </tr>
          </tbody>
        </table>
        <p>Your total emissions are {emissions.total} kg CO₂ per month, which is {deltaLabel} than the global average of {globalAvg.total} kg CO₂.</p>
      </div>

      {/* Visual Chart (Hidden from screen readers to prevent duplicate focus) */}
      <div 
        className="flex items-end h-48 gap-4 mt-8 px-4 border-b border-white/10 pb-2 relative"
        aria-hidden="true"
      >
        {/* Y-axis markers */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-on-surface-variant/40 pb-2">
          <span>{maxCategory} kg</span>
          <span>{maxCategory / 2} kg</span>
          <span>0 kg</span>
        </div>

        {/* Transport Bars */}
        <div className="flex-1 flex justify-center items-end gap-2 group ml-6">
          <div 
            className="w-10 bg-primary/30 hover:bg-primary/50 rounded-t-sm transition-all duration-500 relative"
            style={{ height: `${getPct(emissions.transport)}%` }}
          >
            <div className="absolute -top-6 w-full text-center text-[10px] text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              {emissions.transport}
            </div>
          </div>
          <div 
            className="w-10 bg-surface-bright/35 hover:bg-surface-bright/50 rounded-t-sm transition-all duration-500 relative"
            style={{ height: `${getPct(globalAvg.transport)}%` }}
          >
            <div className="absolute -top-6 w-full text-center text-[10px] text-on-surface-variant font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              {globalAvg.transport}
            </div>
          </div>
        </div>

        {/* Energy Bars */}
        <div className="flex-1 flex justify-center items-end gap-2 group">
          <div 
            className="w-10 bg-primary/60 hover:bg-primary/80 rounded-t-sm transition-all duration-500 relative"
            style={{ height: `${getPct(emissions.energy)}%` }}
          >
            <div className="absolute -top-6 w-full text-center text-[10px] text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              {emissions.energy}
            </div>
          </div>
          <div 
            className="w-10 bg-surface-bright/35 hover:bg-surface-bright/50 rounded-t-sm transition-all duration-500 relative"
            style={{ height: `${getPct(globalAvg.energy)}%` }}
          >
            <div className="absolute -top-6 w-full text-center text-[10px] text-on-surface-variant font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              {globalAvg.energy}
            </div>
          </div>
        </div>

        {/* Diet Bars */}
        <div className="flex-1 flex justify-center items-end gap-2 group">
          <div 
            className="w-10 bg-primary/90 hover:bg-primary rounded-t-sm transition-all duration-500 relative"
            style={{ height: `${getPct(emissions.diet)}%`, boxShadow: '0 0 10px rgba(78, 222, 163, 0.2)' }}
          >
            <div className="absolute -top-6 w-full text-center text-[10px] text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              {emissions.diet}
            </div>
          </div>
          <div 
            className="w-10 bg-surface-bright/35 hover:bg-surface-bright/50 rounded-t-sm transition-all duration-500 relative"
            style={{ height: `${getPct(globalAvg.diet)}%` }}
          >
            <div className="absolute -top-6 w-full text-center text-[10px] text-on-surface-variant font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              {globalAvg.diet}
            </div>
          </div>
        </div>

        {/* Waste Bars */}
        <div className="flex-1 flex justify-center items-end gap-2 group">
          <div 
            className="w-10 bg-primary/40 hover:bg-primary/60 rounded-t-sm transition-all duration-500 relative"
            style={{ height: `${getPct(emissions.waste)}%` }}
          >
            <div className="absolute -top-6 w-full text-center text-[10px] text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              {emissions.waste}
            </div>
          </div>
          <div 
            className="w-10 bg-surface-bright/35 hover:bg-surface-bright/50 rounded-t-sm transition-all duration-500 relative"
            style={{ height: `${getPct(globalAvg.waste)}%` }}
          >
            <div className="absolute -top-6 w-full text-center text-[10px] text-on-surface-variant font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              {globalAvg.waste}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-4 px-6 ml-6 font-label-sm text-label-sm text-on-surface-variant" aria-hidden="true">
        <span>Transport</span>
        <span>Energy</span>
        <span>Diet</span>
        <span>Waste</span>
      </div>

      <div className="flex justify-center gap-6 mt-6 pt-4 border-t border-white/5" aria-hidden="true">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-primary"></span>
          <span className="font-label-sm text-label-sm text-on-surface">You ({emissions.total} kg)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-surface-bright"></span>
          <span className="font-label-sm text-label-sm text-on-surface">Global Avg ({globalAvg.total} kg)</span>
        </div>
      </div>
    </div>
  );
}
