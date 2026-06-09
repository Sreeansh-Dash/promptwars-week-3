"use client";

import React, { useEffect } from 'react';
import { useCarbonStore } from '../infrastructure/storage/CarbonStore';

/**
 * Premium BadgeGrid component.
 * Displays achievements and highlights unlocked milestones with custom SVG rendering and contrast styling.
 * Listens to state metrics and triggers unlocking when criteria are met.
 */
export default function BadgeGrid() {
  const { state, dispatch } = useCarbonStore();
  const { carbonData, badges } = state;

  // Criteria checks for dynamic badge unlocking
  const transitUnlocked = carbonData.transportation.vehicleType === 'transit' && carbonData.transportation.kmPerDay >= 15;
  const meatlessUnlocked = carbonData.diet === 'vegetarian' || carbonData.diet === 'vegan';
  const solarUnlocked = carbonData.homeEnergy.heatingType === 'renewable' && carbonData.homeEnergy.electricityKwhPerMonth > 0;
  const wasteUnlocked = carbonData.waste === 'low';

  useEffect(() => {
    const checkAndUnlock = (id: string, name: string, desc: string, isEligible: boolean) => {
      if (isEligible && !badges.some(b => b.id === id)) {
        dispatch({
          type: 'UNLOCK_BADGE',
          payload: {
            id,
            name,
            description: desc,
            unlockedAt: new Date().toLocaleDateString()
          }
        });
      }
    };

    checkAndUnlock('transit-titan', 'Transit Titan', 'Commute via public transit regularly', transitUnlocked);
    checkAndUnlock('meatless-master', 'Meatless Master', 'Choose low-impact vegetarian or vegan diet', meatlessUnlocked);
    checkAndUnlock('solar-flare', 'Solar Flare', 'Use renewable power for your household', solarUnlocked);
    checkAndUnlock('zero-waste', 'Zero Waste', 'Maintain a low weekly waste emission score', wasteUnlocked);
  }, [transitUnlocked, meatlessUnlocked, solarUnlocked, wasteUnlocked, badges, dispatch]);

  const allBadges = [
    {
      id: 'transit-titan',
      name: 'Transit Titan',
      description: 'Commute via transit (15+ km/day)',
      isUnlocked: badges.some(b => b.id === 'transit-titan'),
      unlockedAt: badges.find(b => b.id === 'transit-titan')?.unlockedAt,
      svg: (
        <svg width="48" height="48" viewBox="0 0 64 64" fill="none" className="shrink-0" aria-hidden="true">
          <circle cx="32" cy="32" r="30" fill="url(#grad1)" fillOpacity="0.2" stroke="#10b981" strokeWidth="2"/>
          <path d="M20 32L28 40L44 24" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          <defs>
            <linearGradient id="grad1" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop stopColor="#10b981"/>
              <stop offset="1" stopColor="#2dd4bf"/>
            </linearGradient>
          </defs>
        </svg>
      )
    },
    {
      id: 'meatless-master',
      name: 'Meatless Master',
      description: 'Logged a meat-free vegan/veggie diet',
      isUnlocked: badges.some(b => b.id === 'meatless-master'),
      unlockedAt: badges.find(b => b.id === 'meatless-master')?.unlockedAt,
      svg: (
        <svg width="48" height="48" viewBox="0 0 64 64" fill="none" className="shrink-0" aria-hidden="true">
          <circle cx="32" cy="32" r="30" fill="url(#grad2)" fillOpacity="0.2" stroke="#2dd4bf" strokeWidth="2"/>
          <path d="M32 18V46M18 32H46" stroke="#2dd4bf" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" transform="rotate(45 32 32)"/>
          <defs>
            <linearGradient id="grad2" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop stopColor="#2dd4bf"/>
              <stop offset="1" stopColor="#10b981"/>
            </linearGradient>
          </defs>
        </svg>
      )
    },
    {
      id: 'solar-flare',
      name: 'Solar Flare',
      description: 'Powered by 100% renewable electricity',
      isUnlocked: badges.some(b => b.id === 'solar-flare'),
      unlockedAt: badges.find(b => b.id === 'solar-flare')?.unlockedAt,
      svg: (
        <svg width="48" height="48" viewBox="0 0 64 64" fill="none" className="shrink-0" aria-hidden="true">
          <circle cx="32" cy="32" r="30" fill="url(#grad3)" fillOpacity="0.2" stroke="#eab308" strokeWidth="2"/>
          <path d="M32 16V20M32 44V48M16 32H20M44 32H48M21 21L24 24M40 40L43 43M21 43L24 40M40 21L43 24M32 26C28.6863 26 26 28.6863 26 32C26 35.3137 28.6863 38 32 38C35.3137 38 38 35.3137 38 32C38 28.6863 35.3137 26 32 26Z" stroke="#eab308" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          <defs>
            <linearGradient id="grad3" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop stopColor="#eab308"/>
              <stop offset="1" stopColor="#f97316"/>
            </linearGradient>
          </defs>
        </svg>
      )
    },
    {
      id: 'zero-waste',
      name: 'Zero Waste',
      description: 'Minimize trash output (Low category)',
      isUnlocked: badges.some(b => b.id === 'zero-waste'),
      unlockedAt: badges.find(b => b.id === 'zero-waste')?.unlockedAt,
      svg: (
        <svg width="48" height="48" viewBox="0 0 64 64" fill="none" className="shrink-0" aria-hidden="true">
          <circle cx="32" cy="32" r="30" fill="url(#grad4)" fillOpacity="0.2" stroke="#60a5fa" strokeWidth="2"/>
          <path d="M22 24H42M26 24V44C26 45.1046 26.8954 46 28 46H36C37.1046 46 38 45.1046 38 44V24M30 18H34" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          <defs>
            <linearGradient id="grad4" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop stopColor="#60a5fa"/>
              <stop offset="1" stopColor="#3b82f6"/>
            </linearGradient>
          </defs>
        </svg>
      )
    }
  ];

  return (
    <div className="glass-panel rounded-xl p-6 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-headline-md text-headline-md text-on-surface">Recent Badges</h2>
        <span className="font-label-sm text-label-sm text-secondary">
          {badges.length} of {allBadges.length} Earned
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allBadges.map(badge => (
          <div 
            key={badge.id}
            className={`glass-panel p-4 rounded-lg flex items-center gap-4 transition-all duration-300 ${
              badge.isUnlocked 
                ? 'bg-primary/5 border-primary/20 opacity-100 hover:scale-[1.02]' 
                : 'opacity-40 grayscale'
            }`}
            aria-label={`${badge.name}: ${badge.description}. Status: ${badge.isUnlocked ? 'Unlocked on ' + badge.unlockedAt : 'Locked'}`}
          >
            {badge.isUnlocked ? (
              badge.svg
            ) : (
              <div className="w-12 h-12 rounded-full bg-surface-bright flex items-center justify-center border border-dashed border-outline-variant shrink-0" aria-hidden="true">
                <span className="material-symbols-outlined text-outline">lock</span>
              </div>
            )}
            <div>
              <h4 className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-2">
                {badge.name}
              </h4>
              <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">
                {badge.isUnlocked ? badge.description : 'Locked (Requirement: ' + badge.description + ')'}
              </p>
              {badge.isUnlocked && (
                <span className="text-[10px] text-primary/80 font-bold block mt-1">
                  Unlocked: {badge.unlockedAt}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
