"use client";

import React, { useState } from 'react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalEmissions: number;
  streak: number;
  trees: number;
}

const COPY_FEEDBACK_DURATION_MS = 2000;

/**
 * Premium ShareModal Component.
 * Offers carbon stats text templates that users can copy to their clipboard
 * and share on Twitter, LinkedIn, etc. Styled as a clean, centered overlay.
 * 
 * @param props - Contains isOpen status, onClose handler, and emissions metrics to render.
 */
export default function ShareModal({ isOpen, onClose, totalEmissions, streak, trees }: ShareModalProps) {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  if (!isOpen) return null;

  const emissionsText = totalEmissions > 0 ? `${totalEmissions} kg CO₂` : "0 kg CO₂";
  const treesText = totalEmissions > 0 ? `${trees} trees` : "0 trees";

  const templates = [
    {
      id: 1,
      name: "Quick Twitter / X Card 🐦",
      text: `My monthly carbon footprint is only ${emissionsText} (${treesText} compensated)! Lowered my impact with EcoPulse. Track your footprint today! 🌿 #EcoPulse #Sustainability #ClimateAction`
    },
    {
      id: 2,
      name: "Check-in Streak Update 🔥",
      text: `🔥 Logged a ${streak}-day carbon tracking streak on EcoPulse! Keeping my monthly emissions at ${emissionsText}. Small actions lead to big changes! 🌍 #ActOnClimate #GreenHabits`
    },
    {
      id: 3,
      name: "LinkedIn Eco Impact 💼",
      text: `I'm using EcoPulse to track and reduce my carbon emissions. My monthly footprint is ${emissionsText}, which is below the global average. Join me in taking local-first, private climate actions! 🍃 #Sustainability #CarbonFootprint #GreenTech`
    }
  ];

  /**
   * Copies the chosen social sharing template to the user's system clipboard.
   * 
   * @param text - The text string to copy.
   * @param id - The ID of the template card to display feedback.
   */
  const handleCopy = (text: string, id: number) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), COPY_FEEDBACK_DURATION_MS);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[150] flex items-center justify-center bg-[#051424]/80 backdrop-blur-md p-4 animate-in fade-in duration-200" 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="modal-title"
    >
      <div className="glass-panel max-w-xl w-full rounded-[24px] p-8 relative flex flex-col glow-effect border border-[#4edea3]/30 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          type="button"
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 text-on-surface transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Close dialog"
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">close</span>
        </button>

        <h3 id="modal-title" className="font-headline-md text-headline-md text-primary font-bold mb-3 flex items-center gap-2 pr-10">
          <span className="material-symbols-outlined text-[24px]" aria-hidden="true">share</span>
          Share Your Progress
        </h3>
        <p className="text-body-md text-on-surface-variant mb-6">Select a pre-made social template below to copy and paste to your social media app of choice.</p>

        <div className="space-y-6 flex-1">
          {templates.map(tpl => (
            <div key={tpl.id} className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-label-md font-bold text-secondary">{tpl.name}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(tpl.text, tpl.id)}
                  className={`text-label-sm px-4 py-1.5 rounded-full font-semibold flex items-center gap-1.5 transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
                    copiedId === tpl.id
                      ? 'bg-primary text-slate-950 font-bold'
                      : 'bg-white/5 text-on-surface hover:bg-white/10 border border-white/10'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                    {copiedId === tpl.id ? 'check' : 'content_copy'}
                  </span>
                  {copiedId === tpl.id ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-body-md text-on-surface-variant font-medium leading-relaxed bg-black/25 p-4 rounded-lg select-all border border-white/5">
                {tpl.text}
              </p>
            </div>
          ))}
        </div>

        <button 
          type="button"
          onClick={onClose}
          className="btn-primary w-full py-3.5 rounded-xl mt-6 font-bold text-slate-950 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background text-label-md"
        >
          Done
        </button>
      </div>
    </div>
  );
}
