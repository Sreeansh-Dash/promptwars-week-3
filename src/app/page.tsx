"use client";

import React, { useState } from 'react';
import { useCarbonStore } from '../infrastructure/storage/CarbonStore';
import { calculateMonthlyCarbon } from '../core/engine/carbonMath';
import ShaderCanvas from '../presentation/ShaderCanvas';
import CarbonCalculator from '../presentation/CarbonCalculator';
import EmissionsChart from '../presentation/EmissionsChart';
import BadgeGrid from '../presentation/BadgeGrid';
import ShareModal from '../presentation/ShareModal';
import MarkdownRenderer from '../presentation/MarkdownRenderer';

const MONTHLY_TREE_CO2_ABSORPTION_KG = 1.83;
const LOW_EMISSIONS_THRESHOLD_KG = 250;
const AVERAGE_EMISSIONS_THRESHOLD_KG = 400;
const ROUNDING_MULTIPLIER_ONE_DECIMAL = 10;

/**
 * Main application dashboard content.
 * Wires together all presentation components (Shader background, Ticker, Calculator, SVG Chart, Badges, and Habit Planner).
 */
export default function Home() {
  const { state, dispatch, isHydrated, hasHydrationError, dismissHydrationError } = useCarbonStore();
  const [welcome, setWelcome] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'calculator' | 'achievements' | 'planner'
  
  // Custom states for interactive features
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileTitle, setProfileTitle] = useState('');
  
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  
  // Custom habit input state
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitDesc, setNewHabitDesc] = useState('');
  const [newHabitCo2, setNewHabitCo2] = useState(5);

  const [copiedInsights, setCopiedInsights] = useState(false);

  const emissions = calculateMonthlyCarbon(state.carbonData);

  // Calculate trees equivalent: 1 mature tree absorbs ~22kg CO2 per year, which is ~1.83kg per month
  const treesEquivalent = Math.round((emissions.total / MONTHLY_TREE_CO2_ABSORPTION_KG) * ROUNDING_MULTIPLIER_ONE_DECIMAL) / ROUNDING_MULTIPLIER_ONE_DECIMAL;
  
  // Status check based on global average (400kg CO2)
  const statusLabel = emissions.total <= LOW_EMISSIONS_THRESHOLD_KG 
    ? 'Excellent (-35% or more)' 
    : emissions.total <= AVERAGE_EMISSIONS_THRESHOLD_KG 
      ? 'Optimal (Under average)' 
      : 'High Footprint';
      
  const statusColor = emissions.total <= LOW_EMISSIONS_THRESHOLD_KG 
    ? 'text-primary font-bold' 
    : emissions.total <= AVERAGE_EMISSIONS_THRESHOLD_KG 
      ? 'text-secondary font-bold' 
      : 'text-error font-bold';

  const handleExport = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `ecopulse-carbon-data-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      console.error("Failed to export state data:", e);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all your carbon metrics, history logs, and unlocked badges?')) {
      dispatch({ type: 'RESET' });
      localStorage.removeItem('ecoPulseData_v1');
      alert('Application reset successfully.');
    }
  };

  const startEditProfile = () => {
    setProfileName(state.userProfile.name);
    setProfileTitle(state.userProfile.title);
    setIsEditingProfile(true);
  };

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) return;
    dispatch({
      type: 'UPDATE_PROFILE',
      payload: {
        name: profileName,
        title: profileTitle || 'Eco Novice'
      }
    });
    setIsEditingProfile(false);
  };

  const handleAddCustomHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;
    dispatch({
      type: 'ADD_CUSTOM_ACTION',
      payload: {
        id: `custom-habit-${Date.now()}`,
        title: newHabitTitle,
        description: newHabitDesc || 'User created custom habit.',
        co2SavedKg: newHabitCo2,
        completed: false
      }
    });
    setNewHabitTitle('');
    setNewHabitDesc('');
    setNewHabitCo2(5);
  };

  const handleDeleteHabit = (id: string) => {
    dispatch({ type: 'DELETE_ACTION', payload: id });
  };

  const handleCopyInsights = () => {
    if (!state.aiInsights) return;
    try {
      navigator.clipboard.writeText(state.aiInsights);
      setCopiedInsights(true);
      setTimeout(() => setCopiedInsights(false), 2000);
    } catch (e) {
      console.error("Failed to copy insights text: ", e);
    }
  };

  const notifications = [
    { id: 1, text: "Grid shifting to 80% renewable today." },
    { id: 2, text: "Your travel emissions are down 12%." },
    { id: 3, text: "Peak pricing starts in 30 minutes." }
  ];



  // Prevent hydration mismatch errors by displaying a premium dark-themed loading skeleton
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-[#0e1511] flex flex-col items-center justify-center text-on-surface" role="status" aria-live="polite">
        <span className="material-symbols-outlined text-primary text-5xl animate-spin" aria-hidden="true">eco</span>
        <h2 className="mt-4 font-headline-md text-headline-md tracking-wider">EcoPulse Preparing...</h2>
        <p className="text-on-surface-variant text-body-md mt-2">Initializing Local-First state engine.</p>
      </div>
    );
  }

  // Welcome / Landing Card Screen
  if (welcome) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
        <ShaderCanvas />
        <main className="glass-panel p-8 md:p-14 rounded-[32px] max-w-3xl w-full text-center flex flex-col items-center gap-8 glow-effect">
          <div className="flex items-center gap-3 text-primary">
            <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">eco</span>
            <span className="font-headline-md text-headline-md font-extrabold tracking-wider text-primary">EcoPulse</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl font-black leading-tight text-on-background bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Track your impact.<br />Save the planet.<br />Powered by AI.
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Measure your ecological footprint, lock in green habits, and unlock custom gamified badges. Entirely private and local-first.
          </p>
          <button 
            type="button"
            onClick={() => setWelcome(false)}
            className="bg-primary text-slate-950 font-bold px-10 py-5 rounded-full transition-all duration-300 hover:scale-[1.03] active:scale-95 shadow-[0_0_30px_rgba(78,222,163,0.4)] min-h-[48px] min-w-[200px] text-label-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
          >
            Start My Eco-Journey
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0e1511] relative text-on-surface font-sans">
      <ShaderCanvas />

      {/* Navigation Drawer (Desktop Sidebar) */}
      <aside className="hidden md:flex flex-col h-full w-80 fixed left-0 top-0 z-[60] bg-[#161d19]/85 backdrop-blur-[40px] border-r border-primary/20 shadow-2xl py-8 justify-between">
        <div className="px-6 pb-6 border-b border-white/10">
          <div className="font-headline-md text-headline-md text-primary flex items-center gap-2 font-bold mb-6">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">eco</span>
            EcoPulse
          </div>
          
          {/* Editable User Profile Info */}
          {isEditingProfile ? (
            <form onSubmit={saveProfile} className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/10">
              <div>
                <label htmlFor="profile-name" className="text-xs uppercase font-bold text-on-surface-variant block mb-1">Name</label>
                <input 
                  id="profile-name"
                  type="text" 
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full bg-[#0e1511] border border-white/15 rounded-lg px-3 py-2 text-body-md text-on-surface focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label htmlFor="profile-title" className="text-xs uppercase font-bold text-on-surface-variant block mb-1">Title</label>
                <input 
                  id="profile-title"
                  type="text" 
                  value={profileTitle}
                  onChange={(e) => setProfileTitle(e.target.value)}
                  className="w-full bg-[#0e1511] border border-white/15 rounded-lg px-3 py-2 text-body-md text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex gap-2.5 pt-1">
                <button type="submit" className="bg-primary text-slate-950 px-4 py-2 rounded-lg text-label-sm font-bold hover:opacity-90 transition-all">Save</button>
                <button type="button" onClick={() => setIsEditingProfile(false)} className="bg-white/5 text-on-surface border border-white/10 px-4 py-2 rounded-lg text-label-sm hover:bg-white/10 transition-all">Cancel</button>
              </div>
            </form>
          ) : (
            <div className="flex items-center gap-4 group p-1.5 hover:bg-white/5 rounded-xl transition-all">
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                <span className="material-symbols-outlined text-primary text-3xl" aria-hidden="true">person</span>
              </div>
              <div className="flex-1">
                <h2 className="font-label-md text-label-md text-on-surface font-bold flex items-center gap-2">
                  {state.userProfile.name}
                  <button 
                    onClick={startEditProfile} 
                    type="button"
                    className="material-symbols-outlined text-on-surface-variant hover:text-primary text-base focus:outline-none transition-colors"
                    aria-label="Edit Profile"
                  >
                    <span aria-hidden="true">edit</span>
                  </button>
                </h2>
                <p className="font-label-sm text-xs text-on-surface-variant font-medium mt-0.5">{state.userProfile.title}</p>
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 pt-6 space-y-2">
          {[
            { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
            { id: 'calculator', icon: 'calculate', label: 'Calculator' },
            { id: 'achievements', icon: 'military_tech', label: 'Achievements' },
            { id: 'planner', icon: 'psychology', label: 'AI Insights' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left flex items-center gap-4 px-6 py-4 font-label-md text-label-md transition-all duration-200 border-l-4 ${
                activeTab === tab.id
                  ? 'bg-primary/15 text-primary border-primary font-bold'
                  : 'text-on-surface-variant hover:bg-white/5 hover:text-secondary border-transparent'
              }`}
            >
              <span className="material-symbols-outlined text-2xl" aria-hidden="true">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="px-6 pt-4 border-t border-white/10 space-y-4">
          <div className="font-label-md text-body-md flex items-center justify-between font-semibold">
            <span className="text-on-surface-variant">Streak status</span>
            <span className="text-primary font-bold">🔥 {state.streak} Days</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button 
              type="button"
              onClick={handleExport}
              className="btn-secondary w-full text-center text-label-sm py-2.5 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-secondary"
            >
              Export
            </button>
            <button 
              type="button"
              onClick={handleReset}
              className="bg-error/10 border border-error/30 text-error hover:bg-error/20 w-full text-center text-label-sm py-2.5 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-error"
            >
              Reset
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-80 pb-24 md:pb-8 flex flex-col min-h-screen">
        
        {/* Visually Hidden h1 to fulfill WCAG 2.1 Single H1 per page requirement */}
        <h1 className="sr-only">EcoPulse Dashboard — Local-First Carbon Footprint Tracker</h1>

        {/* Top Header Bar */}
        <header className="z-50 bg-[#0e1511]/60 backdrop-blur-[20px] border-b border-white/10 flex justify-between items-center w-full px-6 py-5 sticky top-0">
          <div className="flex items-center gap-2 md:hidden">
            <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">eco</span>
            <span className="font-headline-sm text-headline-sm font-bold text-primary">EcoPulse</span>
          </div>

          {/* Predictive AI Ticker */}
          <div className="flex-1 md:ml-0 ml-4 max-w-2xl mx-auto glass-panel rounded-full px-6 py-2.5 flex items-center gap-3 text-sm">
            <span className="material-symbols-outlined text-secondary text-lg animate-pulse" aria-hidden="true">auto_awesome</span>
            <div className="relative h-6 overflow-hidden flex-1" aria-label="Real-time environmental notifications">
              <div className="font-label-sm text-xs text-on-surface-variant flex items-center">
                <span className="text-primary mr-2 font-bold">[AI Pulse]:</span>
                {state.streak > 0 
                  ? `Maintain your ${state.streak}-day streak! Grid shifts 80% renewable at 14:00 today.` 
                  : 'Log metrics to generate a customized, zero-emission lifestyle pathway.'
                }
              </div>
            </div>
          </div>

          {/* Functional Notification Center */}
          <div className="relative ml-4">
            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              type="button"
              className={`w-11 h-11 rounded-full glass-panel flex items-center justify-center transition-all focus:outline-none ${
                notificationsOpen ? 'text-primary border-primary' : 'text-on-surface-variant hover:text-secondary'
              }`}
              aria-label="Toggle notifications"
            >
              <span className="material-symbols-outlined text-xl" aria-hidden="true">notifications</span>
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-primary rounded-full animate-ping" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-primary rounded-full" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-[#161d19]/95 backdrop-blur-xl border border-primary/20 rounded-xl shadow-2xl p-5 z-[80] animate-in fade-in duration-200">
                <h4 className="font-bold text-xs uppercase tracking-wider text-primary mb-3">Live Eco Alerts</h4>
                <div className="space-y-3">
                  {notifications.map(n => (
                    <div key={n.id} className="text-body-md text-on-surface-variant leading-relaxed pb-2 border-b border-white/5 last:border-0 flex gap-2">
                      <span className="text-primary">🌿</span>
                      <span>{n.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Dashboard Pages */}
        <div className="flex-1 w-full max-w-[1280px] mx-auto px-6 py-6 space-y-6">
          {hasHydrationError && (
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-6 py-4 rounded-xl flex items-center justify-between animate-in fade-in duration-200" role="alert">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-amber-400" aria-hidden="true">warning</span>
                <div>
                  <h4 className="font-bold text-sm">Storage Corrupted & Reset</h4>
                  <p className="text-xs text-on-surface-variant mt-0.5">Outdated or corrupt local storage data was detected. Your state has been reset to defaults to ensure stability.</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={dismissHydrationError}
                className="text-on-surface-variant hover:text-amber-400 text-sm font-semibold focus:outline-none transition-colors"
                aria-label="Dismiss warning"
              >
                Dismiss
              </button>
            </div>
          )}
          
          {/* Main Dashboard Layout */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300 items-start">
              
              {/* Dynamic Metrics and Charts */}
              <div className="lg:col-span-2 space-y-6">
                <EmissionsChart />
                <BadgeGrid />
              </div>

              {/* Shareable Ticket and Actions Planner */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* Shareable Ticket Card */}
                <div className="glass-panel rounded-xl p-6 flex flex-col justify-between relative overflow-hidden group border border-white/10">
                  <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <span className="font-label-sm text-xs text-secondary uppercase tracking-wider font-bold">Monthly Impact</span>
                        <h3 className="font-headline-md text-headline-md text-on-surface mt-1 font-extrabold">{emissions.total} kg CO₂</h3>
                      </div>
                      <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">energy_savings_leaf</span>
                    </div>
                    
                    <div className="space-y-4 border-y border-white/10 py-4 my-4">
                      <div className="flex justify-between text-body-md">
                        <span className="text-on-surface-variant">Emissions Status</span>
                        <span className={statusColor}>{statusLabel}</span>
                      </div>
                      <div className="flex justify-between text-body-md">
                        <span className="text-on-surface-variant">Tree Compensation</span>
                        <span className="text-on-surface font-semibold">{treesEquivalent} trees / month</span>
                      </div>
                      <div className="flex justify-between text-body-md">
                        <span className="text-on-surface-variant">Check-in Streak</span>
                        <span className="text-primary font-bold">🔥 {state.streak} Days</span>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    type="button" 
                    onClick={() => setShareModalOpen(true)}
                    className="btn-secondary w-full font-label-md text-label-md px-4 py-3.5 rounded-lg flex items-center justify-center gap-2 mt-4 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <span className="material-symbols-outlined text-lg" aria-hidden="true">share</span>
                    Share Progress
                  </button>
                </div>

                {/* AI Text Insights Preview Card */}
                <div className="glass-panel p-6 rounded-xl flex flex-col border border-white/10">
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2 font-bold">
                      <span className="material-symbols-outlined text-primary text-xl" aria-hidden="true">auto_awesome</span>
                      Predictive Insights
                    </h2>
                    {state.aiInsights && (
                      <button 
                        onClick={handleCopyInsights}
                        type="button"
                        className="text-xs text-secondary hover:text-primary flex items-center gap-1 font-semibold focus:outline-none"
                        aria-label="Copy AI Insights Report"
                      >
                        <span className="material-symbols-outlined text-sm" aria-hidden="true">{copiedInsights ? 'check' : 'content_copy'}</span>
                        {copiedInsights ? 'Copied!' : 'Copy'}
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto bg-black/25 p-4 rounded-xl border border-white/5 scrollbar-thin scrollbar-thumb-white/10">
                    <MarkdownRenderer text={state.aiInsights} onCalculatorRedirect={() => setActiveTab('calculator')} />
                  </div>
                </div>

                {/* Custom Habit Adder */}
                <div className="glass-panel p-6 rounded-xl flex flex-col border border-white/10">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2 flex items-center gap-2 font-bold">
                    <span className="material-symbols-outlined text-secondary text-xl" aria-hidden="true">checklist</span>
                    Custom Habit Tracker
                  </h2>
                  <p className="text-xs text-on-surface-variant mb-4">Add your own eco-friendly habits and check them off to build your streak.</p>
                  
                  {/* Habit Adder Form */}
                  <form onSubmit={handleAddCustomHabit} className="bg-white/5 border border-white/10 p-4 rounded-xl mb-4 space-y-3">
                    <div className="text-xs font-bold text-primary uppercase tracking-wider">Add Custom Habit</div>
                    <input 
                      type="text"
                      placeholder="Habit title (e.g. Composting)"
                      value={newHabitTitle}
                      onChange={(e) => setNewHabitTitle(e.target.value)}
                      className="w-full bg-[#0e1511] border border-white/15 rounded-lg px-3 py-2 text-body-md text-on-surface focus:outline-none focus:border-primary"
                      required
                    />
                    <input 
                      type="text"
                      placeholder="Habit description (e.g. compost food scraps)"
                      value={newHabitDesc}
                      onChange={(e) => setNewHabitDesc(e.target.value)}
                      className="w-full bg-[#0e1511] border border-white/15 rounded-lg px-3 py-2 text-body-md text-on-surface focus:outline-none focus:border-primary"
                    />
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-on-surface-variant">
                        <span>Carbon Saved:</span>
                        <span className="text-primary font-bold">{newHabitCo2} kg CO₂</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input 
                          type="range"
                          min="1"
                          max="30"
                          value={newHabitCo2}
                          onChange={(e) => setNewHabitCo2(Number(e.target.value))}
                          className="accent-primary h-2 bg-surface-bright rounded-lg flex-1 cursor-pointer"
                        />
                        <button 
                          type="submit"
                          className="bg-primary text-slate-950 px-4 py-1.5 rounded-lg font-bold text-xs hover:opacity-90 shrink-0 transition-opacity"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  </form>

                  {state.actions.length === 0 ? (
                    <div className="text-center py-6 text-on-surface-variant/60 text-xs">
                      No custom habits added yet. Create custom habits above.
                    </div>
                  ) : (
                    <ul className="space-y-3 max-h-96 overflow-y-auto pr-1">
                      {state.actions.map(action => (
                        <li 
                          key={action.id} 
                          className={`p-4 rounded-xl border transition-all duration-300 relative group/item ${
                            action.completed 
                              ? 'bg-primary/5 border-primary/20 opacity-70' 
                              : 'bg-white/5 border-white/10 hover:border-primary/50'
                          }`}
                        >
                          <div className="absolute top-3 right-3 opacity-0 group-hover/item:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleDeleteHabit(action.id)}
                              type="button"
                              className="material-symbols-outlined text-on-surface-variant hover:text-error text-lg focus:outline-none transition-colors"
                              aria-label={`Delete habit ${action.title}`}
                            >
                              <span aria-hidden="true">delete</span>
                            </button>
                          </div>
                          
                          <label className="flex items-start cursor-pointer gap-3.5 select-none mr-6">
                            <div className="mt-1">
                              <input 
                                type="checkbox" 
                                checked={action.completed}
                                onChange={() => {
                                  dispatch({ type: 'TOGGLE_ACTION', payload: action.id });
                                  if (!action.completed) {
                                    dispatch({ type: 'SET_STREAK', payload: state.streak + 1 });
                                  } else {
                                    dispatch({ type: 'SET_STREAK', payload: Math.max(0, state.streak - 1) });
                                  }
                                }}
                                className="w-5 h-5 rounded border-white/20 text-primary focus:ring-primary accent-primary bg-[#0e1511] cursor-pointer"
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className={`text-body-md font-bold ${action.completed ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>
                                {action.title}
                              </h4>
                              <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed font-medium">
                                {action.description}
                              </p>
                              <div className="mt-2 inline-flex items-center text-[10px] font-bold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                Save ~{action.co2SavedKg} kg CO₂
                              </div>
                            </div>
                          </label>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* Calculator Step Wizard */}
          {activeTab === 'calculator' && (
            <div className="max-w-3xl mx-auto animate-in fade-in duration-300">
              <CarbonCalculator />
            </div>
          )}

          {/* Achievements Grid View */}
          {activeTab === 'achievements' && (
            <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
              <BadgeGrid />
            </div>
          )}

          {/* AI Action Planner Detail (Now displays fully-rendered Markdown insights) */}
          {activeTab === 'planner' && (
            <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
              <div className="glass-panel p-8 rounded-2xl flex flex-col border border-white/10 relative">
                
                <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
                  <div>
                    <h2 className="font-headline-md text-headline-md text-primary font-bold">AI Carbon Insights</h2>
                    <p className="text-body-md text-on-surface-variant mt-1">Personalized carbon trajectory analysis and lifestyle optimization roadmap modeled by Groq AI.</p>
                  </div>
                  {state.aiInsights && (
                    <button 
                      onClick={handleCopyInsights}
                      type="button"
                      className="btn-secondary px-4 py-2.5 rounded-lg flex items-center gap-2 font-bold text-label-sm focus:outline-none"
                      aria-label="Copy full report"
                    >
                      <span className="material-symbols-outlined text-lg" aria-hidden="true">{copiedInsights ? 'check' : 'content_copy'}</span>
                      {copiedInsights ? 'Report Copied!' : 'Copy Report'}
                    </button>
                  )}
                </div>
                
                <div className="bg-black/20 border border-white/5 rounded-2xl p-6 min-h-[300px] overflow-y-auto leading-relaxed scrollbar-thin">
                  <MarkdownRenderer text={state.aiInsights} onCalculatorRedirect={() => setActiveTab('calculator')} />
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 rounded-t-xl bg-[#161d19]/80 backdrop-blur-[30px] border-t border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex justify-around items-center h-16 px-4">
          {[
            { id: 'dashboard', icon: 'home_app_logo', label: 'Home' },
            { id: 'calculator', icon: 'calculate', label: 'Calculator' },
            { id: 'achievements', icon: 'military_tech', label: 'Earn' },
            { id: 'planner', icon: 'lightbulb', label: 'Insights' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center transition-all ${
                activeTab === tab.id
                  ? 'text-primary bg-primary/15 rounded-full px-4 py-1 font-bold'
                  : 'text-on-surface-variant opacity-75'
              }`}
            >
              <span className="material-symbols-outlined" aria-hidden="true">{tab.icon}</span>
              <span className="text-[10px] font-bold mt-0.5">{tab.label}</span>
            </button>
          ))}
        </nav>
      </main>

      {/* Share Social Progress Modal */}
      <ShareModal 
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        totalEmissions={emissions.total}
        streak={state.streak}
        trees={treesEquivalent}
      />
    </div>
  );
}
