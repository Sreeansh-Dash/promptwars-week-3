"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useCarbon } from '../context/CarbonContext';
import { GLOBAL_AVERAGE_MONTHLY_KG } from '../utils/carbonEngine';
import { CarbonData } from '../types';
import { exportDataJson } from '../utils/exportData';

export default function Home() {
  const { carbonData, setCarbonData, monthlyEmissions, actions, setActions, toggleActionCompleted, streak, badges, history, isMounted, saveDataToLocal } = useCarbon();
  const [isGettingInsights, setIsGettingInsights] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Background WebGL Shader Logic
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    
    function syncSize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }
    window.addEventListener('resize', syncSize);
    syncSize();

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;
    const vs = `attribute vec2 a_position;
    varying vec2 v_texCoord;
    void main() {
      v_texCoord = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }`;
    const fs = `precision highp float;
    varying vec2 v_texCoord;
    uniform float u_time;
    uniform vec2 u_resolution;
    
    void main() {
        vec2 uv = v_texCoord;
        float noise = sin(uv.x * 3.0 + u_time * 0.5) * cos(uv.y * 2.0 - u_time * 0.3);
        noise += sin(uv.y * 5.0 + u_time * 0.8) * cos(uv.x * 4.0 - u_time * 0.2);
        
        vec3 deepSlate = vec3(0.02, 0.08, 0.14); // background #051424 approx
        vec3 emerald = vec3(0.062, 0.725, 0.505);  // #10b981
        vec3 teal = vec3(0.176, 0.831, 0.749);     // #2dd4bf
        
        vec3 color = mix(deepSlate, emerald * 0.3, clamp(noise + 0.5, 0.0, 1.0));
        color = mix(color, teal * 0.2, clamp(sin(u_time * 0.2 + uv.x * 2.0), 0.0, 1.0) * 0.5);
        
        float dist = distance(uv, vec2(0.5));
        color *= 1.2 - dist;
    
        gl_FragColor = vec4(color, 1.0);
    }`;
    function cs(type: number, src: string) {
      const s = (gl as WebGLRenderingContext).createShader(type)!;
      (gl as WebGLRenderingContext).shaderSource(s, src);
      (gl as WebGLRenderingContext).compileShader(s);
      return s;
    }
    const prog = gl.createProgram()!;
    gl.attachShader(prog, cs(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, cs(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    const uTime = gl.getUniformLocation(prog, 'u_time');
    
    let animationFrameId: number;
    function render(t: number) {
      gl!.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl!.uniform1f(uTime, t * 0.001);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    }
    render(0);
    return () => {
      window.removeEventListener('resize', syncSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const fetchInsights = async () => {
    setIsGettingInsights(true);
    saveDataToLocal(); // Save current before asking API
    try {
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(carbonData),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.insights && Array.isArray(data.insights)) {
          // Map to ActionItem
          const newActions = data.insights.map((act: any, i: number) => ({
            id: `ai-act-${Date.now()}-${i}`,
            title: act.title,
            description: act.description,
            co2SavedKg: act.co2SavedKg,
            completed: false
          }));
          setActions(newActions);
        }
      } else {
        console.error("Failed to fetch insights");
      }
    } catch (e) {
      console.error(e);
    }
    setIsGettingInsights(false);
  };

  const handleUpdateData = (field: keyof CarbonData, subfield: string, value: string | number) => {
    setCarbonData(prev => {
      if (typeof prev[field] === 'object') {
        return { ...prev, [field]: { ...prev[field], [subfield]: value } };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleExport = () => {
    const fullState = { carbonData, actions, streak, badges, history };
    exportDataJson(fullState, `ecopulse-export-${new Date().toISOString().split('T')[0]}.json`);
  };

  if (!isMounted) return null; // Avoid hydration mismatch

  const userTotal = monthlyEmissions.total;
  const maxBarValue = Math.max(userTotal, GLOBAL_AVERAGE_MONTHLY_KG, 1000);
  const userBarHeight = (userTotal / maxBarValue) * 100;
  const globalBarHeight = (GLOBAL_AVERAGE_MONTHLY_KG / maxBarValue) * 100;

  return (
    <div className="text-on-background font-body-md overflow-x-hidden min-h-screen relative">
      <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none">
        <canvas ref={canvasRef} className="block w-full h-full"></canvas>
      </div>

      {/* Top Nav */}
      <nav className="fixed top-0 w-full z-50 bg-surface-container/60 backdrop-blur-xl border-b border-outline-variant/10 shadow-[0_0_30px_rgba(3,198,178,0.15)] flex justify-between items-center px-4 md:px-10 h-16 transition-all duration-300">
        <div className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
          <span className="font-bold text-xl text-primary tracking-wide">EcoPulse</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <div className="text-on-surface-variant font-semibold flex items-center gap-1">
            🔥 {streak} Day Streak
          </div>
          <button onClick={handleExport} className="text-on-surface hover:text-primary transition-colors text-sm font-semibold border border-outline px-3 py-1 rounded-md">
            Export Data
          </button>
        </div>
      </nav>

      <main className="relative z-10 w-full max-w-[1280px] mx-auto px-4 md:px-10 pb-32 pt-24 space-y-16">
        
        {/* Hero Section */}
        <section className="flex flex-col justify-center items-center text-center relative mt-8 mb-16">
          <div className="glass-panel p-8 md:p-12 rounded-[32px] max-w-3xl mx-auto flex flex-col items-center gap-8 glow-effect">
            <h1 className="text-4xl md:text-6xl font-extrabold text-on-background bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                Track your impact.<br/>Save the planet.<br/>Powered by AI.
            </h1>
            <p className="text-lg text-on-surface-variant max-w-2xl">
                EcoPulse helps you measure, reduce, and track your carbon footprint with actionable insights and local-first privacy.
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Calculator & Charts */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Calculator Card */}
            <section className="glass-card p-6 md:p-8 rounded-2xl glow-effect">
              <h2 className="text-2xl font-bold mb-6 text-primary">Carbon Calculator</h2>
              <div className="space-y-6">
                
                {wizardStep === 1 && (
                  <div className="animate-in fade-in slide-in-from-bottom-4">
                    <h3 className="text-lg font-medium mb-4 text-on-surface">1. Transportation</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-on-surface-variant">Daily Commute (km)</label>
                        <input 
                          type="number" 
                          value={carbonData.transportation.kmPerDay}
                          onChange={(e) => handleUpdateData('transportation', 'kmPerDay', Number(e.target.value))}
                          className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-on-surface-variant">Vehicle Type</label>
                        <select 
                          value={carbonData.transportation.vehicleType}
                          onChange={(e) => handleUpdateData('transportation', 'vehicleType', e.target.value)}
                          className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
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
                    <h3 className="text-lg font-medium mb-4 text-on-surface">2. Home Energy</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-on-surface-variant">Monthly Electricity (kWh)</label>
                        <input 
                          type="number" 
                          value={carbonData.homeEnergy.electricityKwhPerMonth}
                          onChange={(e) => handleUpdateData('homeEnergy', 'electricityKwhPerMonth', Number(e.target.value))}
                          className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-on-surface-variant">Heating Type</label>
                        <select 
                          value={carbonData.homeEnergy.heatingType}
                          onChange={(e) => handleUpdateData('homeEnergy', 'heatingType', e.target.value)}
                          className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
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
                    <h3 className="text-lg font-medium mb-4 text-on-surface">3. Lifestyle</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-on-surface-variant">Dietary Preferences</label>
                        <select 
                          value={carbonData.diet}
                          onChange={(e) => handleUpdateData('diet', '', e.target.value)}
                          className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="meat-heavy">Meat-heavy</option>
                          <option value="average">Average</option>
                          <option value="vegetarian">Vegetarian</option>
                          <option value="vegan">Vegan</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-on-surface-variant">Waste Generation</label>
                        <select 
                          value={carbonData.waste}
                          onChange={(e) => handleUpdateData('waste', '', e.target.value)}
                          className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="high">High (Lots of packaging)</option>
                          <option value="average">Average</option>
                          <option value="low">Low (Zero-waste efforts)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-6 mt-6 border-t border-outline-variant/30">
                  <button 
                    onClick={() => setWizardStep(prev => Math.max(1, prev - 1))}
                    disabled={wizardStep === 1}
                    className="px-6 py-2 rounded-lg font-medium text-on-surface hover:bg-surface-container disabled:opacity-30 transition-colors border border-outline-variant"
                  >
                    Back
                  </button>
                  <button 
                    onClick={() => {
                      if (wizardStep < 3) setWizardStep(prev => prev + 1);
                      else fetchInsights();
                    }}
                    className="bg-primary-container text-white font-medium px-6 py-2 rounded-lg transition-transform hover:scale-[1.02] active:scale-95 btn-pulse shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50"
                    disabled={isGettingInsights}
                  >
                    {wizardStep === 3 ? (isGettingInsights ? 'Analyzing...' : 'Generate AI Action Plan') : 'Next Step'}
                  </button>
                </div>
              </div>
            </section>

            {/* Dashboard / Charts */}
            <section className="glass-card p-6 md:p-8 rounded-2xl glow-effect">
              <h2 className="text-2xl font-bold mb-6 text-primary">Monthly Footprint Analysis</h2>
              
              <div className="flex h-64 items-end space-x-8 px-4 relative border-b border-outline-variant pb-2">
                {/* User Bar */}
                <div className="flex flex-col items-center flex-1 group relative">
                  <div 
                    className="w-full max-w-[80px] bg-secondary-container rounded-t-md relative transition-all duration-700 ease-out flex items-end justify-center"
                    style={{ height: `${userBarHeight}%`, minHeight: '10%' }}
                  >
                    <span className="text-on-primary-container font-bold absolute -top-8 bg-secondary-fixed px-2 py-1 rounded text-sm shadow-lg whitespace-nowrap">
                      {userTotal.toFixed(0)} kg
                    </span>
                  </div>
                  <span className="mt-4 font-semibold text-on-surface">You</span>
                </div>

                {/* Global Bar */}
                <div className="flex flex-col items-center flex-1 group relative">
                  <div 
                    className="w-full max-w-[80px] bg-surface-container-highest rounded-t-md relative transition-all duration-700 ease-out flex items-end justify-center"
                    style={{ height: `${globalBarHeight}%`, minHeight: '10%' }}
                  >
                    <span className="text-on-surface font-bold absolute -top-8 bg-surface-variant border border-outline px-2 py-1 rounded text-sm shadow-lg whitespace-nowrap">
                      {GLOBAL_AVERAGE_MONTHLY_KG} kg
                    </span>
                  </div>
                  <span className="mt-4 font-semibold text-on-surface-variant">Global Avg</span>
                </div>
              </div>
              
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-surface-container p-3 rounded-lg text-center border border-outline-variant">
                  <div className="text-on-surface-variant mb-1">Transport</div>
                  <div className="font-bold text-lg text-primary">{monthlyEmissions.transport.toFixed(0)}</div>
                </div>
                <div className="bg-surface-container p-3 rounded-lg text-center border border-outline-variant">
                  <div className="text-on-surface-variant mb-1">Energy</div>
                  <div className="font-bold text-lg text-primary">{monthlyEmissions.energy.toFixed(0)}</div>
                </div>
                <div className="bg-surface-container p-3 rounded-lg text-center border border-outline-variant">
                  <div className="text-on-surface-variant mb-1">Diet</div>
                  <div className="font-bold text-lg text-primary">{monthlyEmissions.diet.toFixed(0)}</div>
                </div>
                <div className="bg-surface-container p-3 rounded-lg text-center border border-outline-variant">
                  <div className="text-on-surface-variant mb-1">Waste</div>
                  <div className="font-bold text-lg text-primary">{monthlyEmissions.waste.toFixed(0)}</div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: AI Action Planner & Badges */}
          <div className="lg:col-span-1 space-y-8">
            <aside className="glass-card p-6 rounded-2xl glow-effect sticky top-24">
              <h2 className="text-2xl font-bold mb-4 text-primary flex items-center gap-2">
                <span className="text-2xl">⚡</span> AI Action Planner
              </h2>
              <p className="text-on-surface-variant mb-6 text-sm">Personalized habits generated by Groq's Llama 3.</p>
              
              <ul className="space-y-4">
                {actions.map((action, idx) => (
                  <li key={action.id || idx} className={`p-4 rounded-xl border transition-all ${action.completed ? 'bg-primary-container/20 border-primary' : 'bg-surface-container border-outline-variant hover:border-primary/50'}`}>
                    <label className="flex items-start cursor-pointer gap-3">
                      <div className="mt-1">
                        <input 
                          type="checkbox" 
                          checked={action.completed}
                          onChange={() => toggleActionCompleted(action.id)}
                          className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary accent-primary bg-background"
                        />
                      </div>
                      <div>
                        <h4 className={`font-semibold ${action.completed ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>
                          {action.title}
                        </h4>
                        <p className={`text-sm mt-1 ${action.completed ? 'text-on-surface-variant opacity-70' : 'text-on-surface-variant'}`}>
                          {action.description}
                        </p>
                        <div className="mt-2 inline-flex items-center text-xs font-bold bg-secondary-container text-on-secondary-container px-2 py-1 rounded">
                          -{action.co2SavedKg} kg CO2
                        </div>
                      </div>
                    </label>
                  </li>
                ))}
              </ul>

              {/* Badges Section */}
              {badges.length > 0 && (
                <div className="mt-8 pt-6 border-t border-outline-variant/30">
                  <h3 className="text-lg font-bold mb-4 text-on-surface">Unlocked Badges</h3>
                  <div className="flex flex-wrap gap-2">
                    {badges.map(badge => (
                      <div key={badge.id} className="bg-tertiary-container text-on-tertiary-container px-3 py-1.5 rounded-full text-xs font-bold shadow-sm" title={badge.description}>
                        🏆 {badge.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>

        </div>
      </main>
    </div>
  );
}
