"use client";

import React, { useEffect, useRef } from 'react';

/**
 * Premium WebGL ambient shader canvas component.
 * Draws organic flowing emerald/teal currents on a slate background.
 * Optimized with aria-hidden to ensure screen readers ignore it.
 */
export default function ShaderCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animationId: number;

    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) return;

    const vs = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;
      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fs = `
      precision highp float;
      varying vec2 v_texCoord;
      uniform float u_time;
      uniform vec2 u_resolution;

      void main() {
        vec2 uv = v_texCoord;
        
        // Organic flowing wave calculation
        float noise = sin(uv.x * 3.0 + u_time * 0.4) * cos(uv.y * 2.0 - u_time * 0.2);
        noise += sin(uv.y * 4.5 + u_time * 0.6) * cos(uv.x * 3.5 - u_time * 0.15);
        
        // Premium Eco Aurora Color Palette (Deep Slate, Emerald, Teal)
        vec3 deepSlate = vec3(0.035, 0.051, 0.082); // #090d15
        vec3 emerald = vec3(0.062, 0.725, 0.505);   // #10b981
        vec3 teal = vec3(0.176, 0.831, 0.749);      // #2dd4bf
        
        // Interpolate colors based on time-based noise and UV coords
        vec3 color = mix(deepSlate, emerald * 0.25, clamp(noise + 0.4, 0.0, 1.0));
        color = mix(color, teal * 0.15, clamp(sin(u_time * 0.15 + uv.x * 2.5), 0.0, 1.0) * 0.4);
        
        // Vignette shading to darken boundaries
        float dist = distance(uv, vec2(0.5));
        color *= 1.2 - dist;

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    function compileShader(type: number, source: string) {
      const shader = gl!.createShader(type);
      if (!shader) return null;
      gl!.shaderSource(shader, source);
      gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl!.getShaderInfoLog(shader));
        gl!.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = compileShader(gl.VERTEX_SHADER, vs);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fs);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1
    ]), gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    const uTimeLoc = gl.getUniformLocation(program, 'u_time');
    const uResLoc = gl.getUniformLocation(program, 'u_resolution');

    const handleResize = () => {
      const w = canvas.clientWidth || 1280;
      const h = canvas.clientHeight || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    const render = (time: number) => {
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTimeLoc) gl.uniform1f(uTimeLoc, time * 0.001);
      if (uResLoc) gl.uniform2f(uResLoc, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none" aria-hidden="true">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
