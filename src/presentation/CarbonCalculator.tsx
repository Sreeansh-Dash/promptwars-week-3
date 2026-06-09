"use client";

import React, { useState } from 'react';
import { useCarbonStore } from '../infrastructure/storage/CarbonStore';
import { calculateMonthlyCarbon } from '../core/engine/carbonMath';
import { ApiInsightsError, GroqTimeoutError } from '../core/errors/errors';

/**
 * Constants to remove magic numbers in forms and conversions.
 */
const DAYS_IN_WEEK = 7;
const MAX_WEEKLY_DISTANCE_KM = 500;
const MAX_MONTHLY_ELECTRICITY_KWH = 1000;
const GROQ_TIMEOUT_MS = 6000;

interface TransportationStepProps {
  vehicleType: 'ev' | 'transit' | 'cycle' | 'gas';
  kmPerDay: number;
  updateTransport: (field: 'kmPerDay' | 'vehicleType', value: string | number) => void;
}

/**
 * Sub-component rendering the Transportation step questionnaire.
 */
function TransportationStep({ vehicleType, kmPerDay, updateTransport }: TransportationStepProps) {
  const transportationItems = [
    { type: 'ev', icon: 'electric_car', label: 'EV / Hybrid' },
    { type: 'transit', icon: 'directions_bus', label: 'Public Transit' },
    { type: 'cycle', icon: 'pedal_bike', label: 'Bicycle' },
    { type: 'gas', icon: 'local_gas_station', label: 'Gas Vehicle' }
  ];

  return (
    <div>
      <h3 className="font-body-lg text-body-lg text-primary font-semibold mb-2">Step 1: Transportation</h3>
      <p className="text-on-surface-variant text-sm mb-6">How do you commute on an average week?</p>
      
      <label className="font-label-md text-label-md text-on-surface block mb-3">Primary Mode</label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {transportationItems.map(item => (
          <button
            key={item.type}
            type="button"
            onClick={() => updateTransport('vehicleType', item.type)}
            className={`glass-panel p-4 rounded-xl flex flex-col items-center gap-2 transition-all min-h-[90px] ${
              vehicleType === item.type
                ? 'border-primary bg-primary/15 text-primary'
                : 'hover:bg-white/5 text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-2xl" aria-hidden="true">{item.icon}</span>
            <span className="text-xs font-bold">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="distance-slider" className="font-label-md text-label-md text-on-surface block">
            Weekly Distance:
          </label>
          <span className="text-primary font-bold tracking-wider">{kmPerDay * DAYS_IN_WEEK} km</span>
        </div>
        <input 
          id="distance-slider"
          type="range"
          min="0"
          max={MAX_WEEKLY_DISTANCE_KM}
          value={kmPerDay * DAYS_IN_WEEK}
          onChange={(e) => updateTransport('kmPerDay', Math.round(Number(e.target.value) / DAYS_IN_WEEK))}
          className="w-full accent-primary h-2 bg-surface-bright rounded-lg appearance-none cursor-pointer"
          aria-valuenow={kmPerDay * DAYS_IN_WEEK}
          aria-valuemin={0}
          aria-valuemax={MAX_WEEKLY_DISTANCE_KM}
        />
        <div className="flex justify-between mt-1 text-[10px] text-on-surface-variant/60">
          <span>0 km</span>
          <span>{MAX_WEEKLY_DISTANCE_KM / 2} km</span>
          <span>{MAX_WEEKLY_DISTANCE_KM} km</span>
        </div>
      </div>
    </div>
  );
}

interface HomeEnergyStepProps {
  electricityKwhPerMonth: number;
  heatingType: 'coal' | 'renewable';
  updateEnergy: (field: 'electricityKwhPerMonth' | 'heatingType', value: string | number) => void;
}

/**
 * Sub-component rendering the Home Energy step questionnaire.
 */
function HomeEnergyStep({ electricityKwhPerMonth, heatingType, updateEnergy }: HomeEnergyStepProps) {
  const energyItems = [
    { type: 'coal', icon: 'power', label: 'Standard Grid (Coal/Gas)' },
    { type: 'renewable', icon: 'solar_power', label: 'Renewable (Solar/Wind)' }
  ];

  return (
    <div>
      <h3 className="font-body-lg text-body-lg text-primary font-semibold mb-2">Step 2: Home Energy</h3>
      <p className="text-on-surface-variant text-sm mb-6">Describe your monthly household electricity usage.</p>
      
      <label className="font-label-md text-label-md text-on-surface block mb-3">Power Source Grid</label>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {energyItems.map(item => (
          <button
            key={item.type}
            type="button"
            onClick={() => updateEnergy('heatingType', item.type)}
            className={`glass-panel p-4 rounded-xl flex flex-col items-center gap-2 text-center transition-all ${
              heatingType === item.type
                ? 'border-primary bg-primary/15 text-primary'
                : 'hover:bg-white/5 text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-2xl" aria-hidden="true">{item.icon}</span>
            <span className="text-xs font-bold">{item.label}</span>
          </button>
        ))}
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="energy-slider" className="font-label-md text-label-md text-on-surface block">
            Monthly Usage:
          </label>
          <span className="text-primary font-bold tracking-wider">{electricityKwhPerMonth} kWh</span>
        </div>
        <input 
          id="energy-slider"
          type="range"
          min="0"
          max={MAX_MONTHLY_ELECTRICITY_KWH}
          value={electricityKwhPerMonth}
          onChange={(e) => updateEnergy('electricityKwhPerMonth', Number(e.target.value))}
          className="w-full accent-primary h-2 bg-surface-bright rounded-lg appearance-none cursor-pointer"
          aria-valuenow={electricityKwhPerMonth}
          aria-valuemin={0}
          aria-valuemax={MAX_MONTHLY_ELECTRICITY_KWH}
        />
        <div className="flex justify-between mt-1 text-[10px] text-on-surface-variant/60">
          <span>0 kWh</span>
          <span>{MAX_MONTHLY_ELECTRICITY_KWH / 2} kWh</span>
          <span>{MAX_MONTHLY_ELECTRICITY_KWH} kWh</span>
        </div>
      </div>
    </div>
  );
}

interface DietStepProps {
  diet: 'meat-heavy' | 'average' | 'vegetarian' | 'vegan';
  onChange: (diet: 'meat-heavy' | 'average' | 'vegetarian' | 'vegan') => void;
}

/**
 * Sub-component rendering the Dietary habits step questionnaire.
 */
function DietStep({ diet, onChange }: DietStepProps) {
  const dietItems = [
    { type: 'meat-heavy', icon: 'restaurant', label: 'Meat Heavy', desc: 'Frequent red meat/poultry' },
    { type: 'average', icon: 'local_pizza', label: 'Balanced Average', desc: 'Occasional meat, dairy, vegetables' },
    { type: 'vegetarian', icon: 'egg_alt', label: 'Vegetarian', desc: 'No meat, includes dairy/eggs' },
    { type: 'vegan', icon: 'nutrition', label: 'Strict Vegan', desc: '100% plant-based food items' }
  ];

  return (
    <div>
      <h3 className="font-body-lg text-body-lg text-primary font-semibold mb-2">Step 3: Dietary Profile</h3>
      <p className="text-on-surface-variant text-sm mb-6">Choose the profile that matches your weekly food habits.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {dietItems.map(item => (
          <button
            key={item.type}
            type="button"
            onClick={() => onChange(item.type as 'meat-heavy' | 'average' | 'vegetarian' | 'vegan')}
            className={`glass-panel p-4 rounded-xl flex items-center gap-4 transition-all text-left ${
              diet === item.type
                ? 'border-primary bg-primary/15 text-primary'
                : 'hover:bg-white/5 text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-2xl shrink-0" aria-hidden="true">{item.icon}</span>
            <div>
              <span className="text-xs font-bold block">{item.label}</span>
              <span className="text-[10px] text-on-surface-variant/80">{item.desc}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

interface WasteStepProps {
  waste: 'high' | 'average' | 'low';
  onChange: (waste: 'high' | 'average' | 'low') => void;
}

/**
 * Sub-component rendering the Waste generation step questionnaire.
 */
function WasteStep({ waste, onChange }: WasteStepProps) {
  const wasteItems = [
    { type: 'high', icon: 'delete', label: 'High Trash', desc: 'Standard bin full weekly' },
    { type: 'average', icon: 'auto_delete', label: 'Average Trash', desc: 'Mixed trash and recycling' },
    { type: 'low', icon: 'recycling', label: 'Low Waste', desc: 'Heavy recycling and composting' }
  ];

  return (
    <div>
      <h3 className="font-body-lg text-body-lg text-primary font-semibold mb-2">Step 4: Household Waste</h3>
      <p className="text-on-surface-variant text-sm mb-6">How much landfill trash is generated by your household?</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {wasteItems.map(item => (
          <button
            key={item.type}
            type="button"
            onClick={() => onChange(item.type as 'high' | 'average' | 'low')}
            className={`glass-panel p-4 rounded-xl flex flex-col items-center gap-2 text-center transition-all ${
              waste === item.type
                ? 'border-primary bg-primary/15 text-primary'
                : 'hover:bg-white/5 text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-2xl" aria-hidden="true">{item.icon}</span>
            <span className="text-xs font-bold block">{item.label}</span>
            <span className="text-[10px] text-on-surface-variant/80">{item.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

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

  const handleDietChange = (dietValue: 'meat-heavy' | 'average' | 'vegetarian' | 'vegan') => {
    dispatch({
      type: 'UPDATE_METRICS',
      payload: { diet: dietValue }
    });
  };

  const handleWasteChange = (wasteValue: 'high' | 'average' | 'low') => {
    dispatch({
      type: 'UPDATE_METRICS',
      payload: { waste: wasteValue }
    });
  };

  const handleNext = () => {
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  /**
   * Submits the carbon metrics form, races backend requests against a timeout,
   * handles custom typing exceptions, and maps them to clear UI alerts.
   */
  const handleSubmit = async () => {
    setIsLoading(true);
    const abortController = new AbortController();
    const signal = abortController.signal;

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

      // 3. Fetch insights racing against client timeout
      const fetchPromise = fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.carbonData),
        signal
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => {
          abortController.abort();
          reject(new GroqTimeoutError("Insights AI query took too long to complete"));
        }, GROQ_TIMEOUT_MS)
      );

      const response = await Promise.race([fetchPromise, timeoutPromise]);

      if (!response.ok) {
        throw new ApiInsightsError("Network request failed", response.status);
      }

      const data = await response.json();
      if (data.insights && typeof data.insights === 'string') {
        dispatch({ type: 'SET_AI_INSIGHTS', payload: data.insights });
      } else {
        throw new ApiInsightsError("Invalid response format received from insights endpoint");
      }
      
      // Reset wizard to step 1
      setStep(1);
      alert('Impact logged successfully! Your dashboard statistics and AI recommendation plans are updated.');
    } catch (e) {
      if (e instanceof GroqTimeoutError) {
        alert("The AI Insights model took too long to respond (5s limit). Please check your internet connection or try again.");
      } else if (e instanceof ApiInsightsError) {
        alert(`An error occurred while generating AI Insights (Status: ${e.status ?? 'unknown'}). Please check your credentials.`);
      } else {
        console.error("Failed to submit carbon data:", e);
        alert('Could not submit carbon data. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-xl p-6 flex flex-col glow-effect min-h-[400px]">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
        <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary" aria-hidden="true">calculate</span>
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
          <TransportationStep 
            vehicleType={state.carbonData.transportation.vehicleType}
            kmPerDay={state.carbonData.transportation.kmPerDay}
            updateTransport={updateTransport}
          />
        )}

        {step === 2 && (
          <HomeEnergyStep 
            electricityKwhPerMonth={state.carbonData.homeEnergy.electricityKwhPerMonth}
            heatingType={state.carbonData.homeEnergy.heatingType}
            updateEnergy={updateEnergy}
          />
        )}

        {step === 3 && (
          <DietStep 
            diet={state.carbonData.diet}
            onChange={handleDietChange}
          />
        )}

        {step === 4 && (
          <WasteStep 
            waste={state.carbonData.waste}
            onChange={handleWasteChange}
          />
        )}
      </div>

      {/* Footer controls */}
      <div className="mt-8 flex justify-between border-t border-white/5 pt-4">
        {step > 1 ? (
          <button 
            type="button"
            onClick={handleBack}
            className="btn-secondary px-5 py-2.5 rounded-lg font-label-md text-label-md flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_back</span>
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
            <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span>
          </button>
        ) : (
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="btn-primary px-6 py-2.5 rounded-lg font-label-md text-label-md flex items-center gap-2 bg-gradient-to-r from-primary to-teal-500 hover:from-primary/90 hover:to-teal-500/90 text-slate-950 font-bold"
          >
            {isLoading ? 'Processing...' : 'Log & Get AI Insights'}
            <span className="material-symbols-outlined text-sm" aria-hidden="true">auto_awesome</span>
          </button>
        )}
      </div>
    </div>
  );
}
