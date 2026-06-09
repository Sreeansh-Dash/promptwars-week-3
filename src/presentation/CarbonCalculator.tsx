"use client";

import React, { useState } from 'react';
import { useCarbonStore } from '../infrastructure/storage/CarbonStore';
import { calculateMonthlyCarbon } from '../core/engine/carbonMath';

/**
 * Premium CarbonCalculator Wizard Component.
 * Guides the user through a 4-step check-in (Transport -> Energy -> Diet -> Waste)
 * to input their real weekly environmental metrics.
 * Updates state, saves history, increments streaks, and fetches custom AI action insights on submission.
 */
export default function CarbonCalculator() {
  const { state, dispatch } = useCarbonStore();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const emissions = calculateMonthlyCarbon(state.carbonData);

  const updateTransport = (field: 'kmPerDay' | 'vehicleType', value: string | number) => {
    dispatch({
      type: 'UPDATE_METRICS',
      payload: {
        transportation: {
          ...state.carbonData.transportation,
          [field]: value
        }
      }
    });
  };

  const updateEnergy = (field: 'electricityKwhPerMonth' | 'heatingType', value: string | number) => {
    dispatch({
      type: 'UPDATE_METRICS',
      payload: {
        homeEnergy: {
          ...state.carbonData.homeEnergy,
          [field]: value
        }
      }
    });
  };

  const handleNext = () => {
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // 1. Log monthly emissions to historical record
      dispatch({
        type: 'ADD_HISTORY',
        payload: {
          date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
          totalKg: emissions.total
        }
      });

      // 2. Increment user check-in streak
      dispatch({
        type: 'SET_STREAK',
        payload: state.streak + 1
      });

      // 3. Fetch insights from secure backend endpoint
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.carbonData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.insights && typeof data.insights === 'string') {
          dispatch({ type: 'SET_AI_INSIGHTS', payload: data.insights });
        }
      }
      
      // Reset wizard to step 1
      setStep(1);
      alert('Impact logged successfully! Your dashboard statistics and AI recommendation plans are updated.');
    } catch (e) {
      console.error("Failed to submit carbon data:", e);
      alert('Could not submit carbon data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-xl p-6 flex flex-col glow-effect min-h-[400px]">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
        <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">calculate</span>
          Impact Check-in
        </h2>
        <div className="flex gap-1" aria-label={`Step ${step} of 4`}>
          {[1, 2, 3, 4].map(s => (
            <span 
              key={s} 
              className={`w-8 h-1.5 rounded-full transition-all duration-300 ${
                s <= step ? 'bg-primary' : 'bg-surface-bright'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1">
        {step === 1 && (
          <div>
            <h3 className="font-body-lg text-body-lg text-primary font-semibold mb-2">Step 1: Transportation</h3>
            <p className="text-on-surface-variant text-sm mb-6">How do you commute on an average week?</p>
            
            <label className="font-label-md text-label-md text-on-surface block mb-3">Primary Mode</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { type: 'ev', icon: 'electric_car', label: 'EV / Hybrid' },
                { type: 'transit', icon: 'directions_bus', label: 'Public Transit' },
                { type: 'cycle', icon: 'pedal_bike', label: 'Bicycle' },
                { type: 'gas', icon: 'local_gas_station', label: 'Gas Vehicle' }
              ].map(item => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => updateTransport('vehicleType', item.type)}
                  className={`glass-panel p-4 rounded-xl flex flex-col items-center gap-2 transition-all min-h-[90px] ${
                    state.carbonData.transportation.vehicleType === item.type
                      ? 'border-primary bg-primary/15 text-primary'
                      : 'hover:bg-white/5 text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                  <span className="text-xs font-bold">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="distance-slider" className="font-label-md text-label-md text-on-surface block">
                  Weekly Distance:
                </label>
                <span className="text-primary font-bold tracking-wider">{state.carbonData.transportation.kmPerDay * 7} km</span>
              </div>
              <input 
                id="distance-slider"
                type="range"
                min="0"
                max="500"
                value={state.carbonData.transportation.kmPerDay * 7}
                onChange={(e) => updateTransport('kmPerDay', Math.round(Number(e.target.value) / 7))}
                className="w-full accent-primary h-2 bg-surface-bright rounded-lg appearance-none cursor-pointer"
                aria-valuenow={state.carbonData.transportation.kmPerDay * 7}
                aria-valuemin={0}
                aria-valuemax={500}
              />
              <div className="flex justify-between mt-1 text-[10px] text-on-surface-variant/60">
                <span>0 km</span>
                <span>250 km</span>
                <span>500 km</span>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="font-body-lg text-body-lg text-primary font-semibold mb-2">Step 2: Home Energy</h3>
            <p className="text-on-surface-variant text-sm mb-6">Describe your monthly household electricity usage.</p>
            
            <label className="font-label-md text-label-md text-on-surface block mb-3">Power Source Grid</label>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { type: 'coal', icon: 'power', label: 'Standard Grid (Coal/Gas)' },
                { type: 'renewable', icon: 'solar_power', label: 'Renewable (Solar/Wind)' }
              ].map(item => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => updateEnergy('heatingType', item.type)}
                  className={`glass-panel p-4 rounded-xl flex flex-col items-center gap-2 text-center transition-all ${
                    state.carbonData.homeEnergy.heatingType === item.type
                      ? 'border-primary bg-primary/15 text-primary'
                      : 'hover:bg-white/5 text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                  <span className="text-xs font-bold">{item.label}</span>
                </button>
              ))}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="energy-slider" className="font-label-md text-label-md text-on-surface block">
                  Monthly Usage:
                </label>
                <span className="text-primary font-bold tracking-wider">{state.carbonData.homeEnergy.electricityKwhPerMonth} kWh</span>
              </div>
              <input 
                id="energy-slider"
                type="range"
                min="0"
                max="1000"
                value={state.carbonData.homeEnergy.electricityKwhPerMonth}
                onChange={(e) => updateEnergy('electricityKwhPerMonth', Number(e.target.value))}
                className="w-full accent-primary h-2 bg-surface-bright rounded-lg appearance-none cursor-pointer"
                aria-valuenow={state.carbonData.homeEnergy.electricityKwhPerMonth}
                aria-valuemin={0}
                aria-valuemax={1000}
              />
              <div className="flex justify-between mt-1 text-[10px] text-on-surface-variant/60">
                <span>0 kWh</span>
                <span>500 kWh</span>
                <span>1000 kWh</span>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 className="font-body-lg text-body-lg text-primary font-semibold mb-2">Step 3: Dietary Profile</h3>
            <p className="text-on-surface-variant text-sm mb-6">Choose the profile that matches your weekly food habits.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { type: 'meat-heavy', icon: 'restaurant', label: 'Meat Heavy', desc: 'Frequent red meat/poultry' },
                { type: 'average', icon: 'local_pizza', label: 'Balanced Average', desc: 'Occasional meat, dairy, vegetables' },
                { type: 'vegetarian', icon: 'egg_alt', label: 'Vegetarian', desc: 'No meat, includes dairy/eggs' },
                { type: 'vegan', icon: 'nutrition', label: 'Strict Vegan', desc: '100% plant-based food items' }
              ].map(item => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => dispatch({ type: 'UPDATE_METRICS', payload: { diet: item.type as 'meat-heavy' | 'average' | 'vegetarian' | 'vegan' } })}
                  className={`glass-panel p-4 rounded-xl flex items-center gap-4 transition-all text-left ${
                    state.carbonData.diet === item.type
                      ? 'border-primary bg-primary/15 text-primary'
                      : 'hover:bg-white/5 text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl shrink-0">{item.icon}</span>
                  <div>
                    <span className="text-xs font-bold block">{item.label}</span>
                    <span className="text-[10px] text-on-surface-variant/80">{item.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h3 className="font-body-lg text-body-lg text-primary font-semibold mb-2">Step 4: Household Waste</h3>
            <p className="text-on-surface-variant text-sm mb-6">How much landfill trash is generated by your household?</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { type: 'high', icon: 'delete', label: 'High Trash', desc: 'Standard bin full weekly' },
                { type: 'average', icon: 'auto_delete', label: 'Average Trash', desc: 'Mixed trash and recycling' },
                { type: 'low', icon: 'recycling', label: 'Low Waste', desc: 'Heavy recycling and composting' }
              ].map(item => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => dispatch({ type: 'UPDATE_METRICS', payload: { waste: item.type as 'high' | 'average' | 'low' } })}
                  className={`glass-panel p-4 rounded-xl flex flex-col items-center gap-2 text-center transition-all ${
                    state.carbonData.waste === item.type
                      ? 'border-primary bg-primary/15 text-primary'
                      : 'hover:bg-white/5 text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                  <span className="text-xs font-bold block">{item.label}</span>
                  <span className="text-[10px] text-on-surface-variant/80">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="mt-8 flex justify-between border-t border-white/5 pt-4">
        {step > 1 ? (
          <button 
            type="button"
            onClick={handleBack}
            className="btn-secondary px-5 py-2.5 rounded-lg font-label-md text-label-md flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back
          </button>
        ) : (
          <div />
        )}

        {step < 4 ? (
          <button 
            type="button"
            onClick={handleNext}
            className="btn-primary px-5 py-2.5 rounded-lg font-label-md text-label-md flex items-center gap-2"
          >
            Next Step
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        ) : (
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="btn-primary px-6 py-2.5 rounded-lg font-label-md text-label-md flex items-center gap-2 bg-gradient-to-r from-primary to-teal-500 hover:from-primary/90 hover:to-teal-500/90 text-slate-950 font-bold"
          >
            {isLoading ? 'Processing...' : 'Log & Get AI Insights'}
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
          </button>
        )}
      </div>
    </div>
  );
}
