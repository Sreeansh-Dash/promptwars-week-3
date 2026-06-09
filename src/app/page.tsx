"use client";

import React, { useState } from 'react';
import { useFootprint } from '../context/FootprintContext';
import { GLOBAL_AVERAGE_MONTHLY_KG } from '../utils/carbonEngine';
import { CarbonData } from '../types';

export default function Home() {
  const { carbonData, setCarbonData, monthlyEmissions, actions, toggleActionCompleted, streak } = useFootprint();
  const [isGettingInsights, setIsGettingInsights] = useState(false);

  // Helper for tracking Wizard State
  const [wizardStep, setWizardStep] = useState(1);

  const fetchInsights = async () => {
    setIsGettingInsights(true);
    try {
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(carbonData),
      });
      // Currently using context state for actions, user will implement API handling later
      if (!response.ok) {
        console.error("Failed to fetch insights");
      }
    } catch (e) {
      console.error(e);
    }
    setTimeout(() => setIsGettingInsights(false), 1000);
  };

  const handleUpdateData = (field: keyof CarbonData, subfield: string, value: string | number) => {
    setCarbonData(prev => {
      if (typeof prev[field] === 'object') {
        return { ...prev, [field]: { ...prev[field], [subfield]: value } };
      }
      return { ...prev, [field]: value };
    });
  };

  // SVG Chart Calculations
  const userTotal = monthlyEmissions.total;
  const maxBarValue = Math.max(userTotal, GLOBAL_AVERAGE_MONTHLY_KG, 1000);
  const userBarHeight = (userTotal / maxBarValue) * 100;
  const globalBarHeight = (GLOBAL_AVERAGE_MONTHLY_KG / maxBarValue) * 100;

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex justify-between items-center bg-surface p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-primary">Hello, Eco-Warrior!</h1>
          <p className="text-secondary mt-1">Ready to make an impact today?</p>
        </div>
        <div className="bg-primary-container text-on-primary px-4 py-2 rounded-xl flex items-center space-x-2 shadow-sm" aria-label="Streak tracker">
          <span className="text-2xl" aria-hidden="true">🔥</span>
          <span className="font-bold text-lg">{streak} Day Streak</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Wizard & Charts */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Carbon Calculator Wizard */}
          <section className="bg-surface p-6 rounded-2xl shadow-sm" aria-labelledby="calculator-heading">
            <h2 id="calculator-heading" className="text-2xl font-semibold mb-6">Carbon Tracker</h2>
            
            {/* Simple Wizard Steps */}
            <div className="space-y-6">
              {wizardStep === 1 && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                  <h3 className="text-lg font-medium mb-4">1. Transportation</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1" htmlFor="kmPerDay">Daily Commute (km)</label>
                      <input 
                        id="kmPerDay"
                        type="number" 
                        value={carbonData.transportation.kmPerDay}
                        onChange={(e) => handleUpdateData('transportation', 'kmPerDay', Number(e.target.value))}
                        className="w-full bg-background border border-outline rounded-lg p-3 text-primary focus:outline-none focus:ring-2 focus:ring-primary-container"
                        aria-label="Kilometers commuted per day"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" htmlFor="vehicleType">Vehicle Type</label>
                      <select 
                        id="vehicleType"
                        value={carbonData.transportation.vehicleType}
                        onChange={(e) => handleUpdateData('transportation', 'vehicleType', e.target.value)}
                        className="w-full bg-background border border-outline rounded-lg p-3 text-primary focus:outline-none focus:ring-2 focus:ring-primary-container"
                        aria-label="Primary vehicle type"
                      >
                        <option value="car">Car (Petrol/Diesel)</option>
                        <option value="public">Public Transit</option>
                        <option value="bike">Bicycle</option>
                        <option value="walking">Walking</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                  <h3 className="text-lg font-medium mb-4">2. Home Energy</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1" htmlFor="electricity">Monthly Electricity (kWh)</label>
                      <input 
                        id="electricity"
                        type="number" 
                        value={carbonData.homeEnergy.electricityKwhPerMonth}
                        onChange={(e) => handleUpdateData('homeEnergy', 'electricityKwhPerMonth', Number(e.target.value))}
                        className="w-full bg-background border border-outline rounded-lg p-3 text-primary focus:outline-none focus:ring-2 focus:ring-primary-container"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" htmlFor="heating">Heating Type</label>
                      <select 
                        id="heating"
                        value={carbonData.homeEnergy.heatingType}
                        onChange={(e) => handleUpdateData('homeEnergy', 'heatingType', e.target.value)}
                        className="w-full bg-background border border-outline rounded-lg p-3 text-primary focus:outline-none focus:ring-2 focus:ring-primary-container"
                      >
                        <option value="gas">Natural Gas</option>
                        <option value="electric">Electric / Heat Pump</option>
                        <option value="none">None</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                  <h3 className="text-lg font-medium mb-4">3. Lifestyle</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1" htmlFor="diet">Dietary Preferences</label>
                      <select 
                        id="diet"
                        value={carbonData.diet}
                        onChange={(e) => handleUpdateData('diet', '', e.target.value)}
                        className="w-full bg-background border border-outline rounded-lg p-3 text-primary focus:outline-none focus:ring-2 focus:ring-primary-container"
                      >
                        <option value="meat-heavy">Meat-heavy</option>
                        <option value="average">Average</option>
                        <option value="vegetarian">Vegetarian</option>
                        <option value="vegan">Vegan</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" htmlFor="waste">Waste Generation</label>
                      <select 
                        id="waste"
                        value={carbonData.waste}
                        onChange={(e) => handleUpdateData('waste', '', e.target.value)}
                        className="w-full bg-background border border-outline rounded-lg p-3 text-primary focus:outline-none focus:ring-2 focus:ring-primary-container"
                      >
                        <option value="high">High (Lots of packaging)</option>
                        <option value="average">Average</option>
                        <option value="low">Low (Zero-waste efforts)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <button 
                  onClick={() => setWizardStep(prev => Math.max(1, prev - 1))}
                  disabled={wizardStep === 1}
                  className="px-6 py-2 rounded-lg font-medium text-primary hover:bg-secondary-container disabled:opacity-50 transition-colors"
                >
                  Back
                </button>
                <button 
                  onClick={() => {
                    if (wizardStep < 3) setWizardStep(prev => prev + 1);
                    else fetchInsights();
                  }}
                  className="px-6 py-2 rounded-lg font-medium bg-primary text-on-primary hover:bg-primary-container transition-colors shadow-sm"
                >
                  {wizardStep === 3 ? (isGettingInsights ? 'Analyzing...' : 'Get AI Insights') : 'Next Step'}
                </button>
              </div>
            </div>
          </section>

          {/* Analytics Dashboard */}
          <section className="bg-surface p-6 rounded-2xl shadow-sm" aria-labelledby="analytics-heading">
            <h2 id="analytics-heading" className="text-2xl font-semibold mb-6">Your Footprint vs Global Average</h2>
            
            <div className="flex h-64 items-end space-x-8 px-4 relative border-b border-outline">
              {/* User Bar */}
              <div className="flex flex-col items-center flex-1 group">
                <div 
                  className="w-full max-w-24 bg-tertiary-container rounded-t-md relative transition-all duration-500 ease-out flex items-end justify-center pb-2"
                  style={{ height: `${userBarHeight}%`, minHeight: '2rem' }}
                  role="progressbar"
                  aria-valuenow={userTotal}
                  aria-valuemax={maxBarValue}
                  aria-label={`Your total monthly footprint is ${userTotal.toFixed(0)} kg CO2`}
                >
                  <span className="text-on-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-tertiary px-2 py-1 rounded shadow-md text-sm whitespace-nowrap">
                    {userTotal.toFixed(0)} kg
                  </span>
                </div>
                <span className="mt-4 font-medium">You</span>
              </div>

              {/* Global Bar */}
              <div className="flex flex-col items-center flex-1 group">
                <div 
                  className="w-full max-w-24 bg-secondary rounded-t-md relative transition-all duration-500 ease-out flex items-end justify-center pb-2"
                  style={{ height: `${globalBarHeight}%`, minHeight: '2rem' }}
                  role="progressbar"
                  aria-valuenow={GLOBAL_AVERAGE_MONTHLY_KG}
                  aria-valuemax={maxBarValue}
                  aria-label={`Global average monthly footprint is ${GLOBAL_AVERAGE_MONTHLY_KG} kg CO2`}
                >
                  <span className="text-on-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-secondary-container text-primary px-2 py-1 rounded shadow-md text-sm whitespace-nowrap">
                    {GLOBAL_AVERAGE_MONTHLY_KG} kg
                  </span>
                </div>
                <span className="mt-4 font-medium">Global</span>
              </div>
            </div>
            
            {/* Breakdown */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-background p-3 rounded-lg text-center border border-outline">
                <div className="text-secondary mb-1">Transport</div>
                <div className="font-bold text-lg">{monthlyEmissions.transport.toFixed(0)} kg</div>
              </div>
              <div className="bg-background p-3 rounded-lg text-center border border-outline">
                <div className="text-secondary mb-1">Energy</div>
                <div className="font-bold text-lg">{monthlyEmissions.energy.toFixed(0)} kg</div>
              </div>
              <div className="bg-background p-3 rounded-lg text-center border border-outline">
                <div className="text-secondary mb-1">Diet</div>
                <div className="font-bold text-lg">{monthlyEmissions.diet.toFixed(0)} kg</div>
              </div>
              <div className="bg-background p-3 rounded-lg text-center border border-outline">
                <div className="text-secondary mb-1">Waste</div>
                <div className="font-bold text-lg">{monthlyEmissions.waste.toFixed(0)} kg</div>
              </div>
            </div>
          </section>

        </div>

        {/* Right Column: Actions */}
        <div className="lg:col-span-1">
          <aside className="bg-surface p-6 rounded-2xl shadow-sm sticky top-8" aria-labelledby="actions-heading">
            <h2 id="actions-heading" className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-container" aria-hidden="true"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
              AI Action Planner
            </h2>
            <p className="text-secondary mb-6 text-sm">Personalized habits tailored to your lifestyle to help lower your footprint.</p>
            
            <ul className="space-y-4">
              {actions.map(action => (
                <li key={action.id} className={`p-4 rounded-xl border-2 transition-all ${action.completed ? 'bg-secondary-container border-transparent' : 'bg-background border-outline-variant hover:border-primary-container'}`}>
                  <label className="flex items-start cursor-pointer gap-3">
                    <div className="mt-1">
                      <input 
                        type="checkbox" 
                        checked={action.completed}
                        onChange={() => toggleActionCompleted(action.id)}
                        className="w-5 h-5 rounded border-outline text-primary focus:ring-primary-container accent-primary"
                        aria-label={`Mark action "${action.title}" as completed`}
                      />
                    </div>
                    <div>
                      <h4 className={`font-semibold ${action.completed ? 'line-through text-secondary' : 'text-primary'}`}>
                        {action.title}
                      </h4>
                      <p className={`text-sm mt-1 ${action.completed ? 'text-secondary opacity-80' : 'text-on-surface-variant'}`}>
                        {action.description}
                      </p>
                      <div className="mt-2 inline-flex items-center text-xs font-bold bg-primary-fixed text-on-primary-fixed px-2 py-1 rounded">
                        -{action.co2SavedKg} kg CO2
                      </div>
                    </div>
                  </label>
                </li>
              ))}
            </ul>
          </aside>
        </div>

      </div>
    </main>
  );
}
