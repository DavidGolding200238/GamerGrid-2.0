import React, { useEffect, useRef, useCallback, useState } from 'react';

interface NetNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  phase: number;
  hub: boolean;
  color: string;
}

interface NetSettings {
  nodeCount: number;
  maxSpeed: number;
  linkDistance: number;
}

const PALETTE = ['#00ffc6', '#4f7bff', '#8f4fff', '#ff3d81'];

const createNodes = (count: number, w: number, h: number, maxSpeed: number): NetNode[] => {
  const arr: NetNode[] = [];
  for (let i = 0; i < count; i++) {
    const hub = Math.random() < 0.08;
    const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    arr.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * maxSpeed * (hub ? 0.4 : 1),
      vy: (Math.random() - 0.5) * maxSpeed * (hub ? 0.4 : 1),
      r: (hub ? 3.2 : 1.2) + Math.random() * (hub ? 2.3 : 1.8),
      phase: Math.random() * Math.PI * 2,
      hub,
      color,
    });
  }
  return arr;
};

const useReducedMotion = () => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      setReduced(false);
      return;
    }

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = () => setReduced(mq.matches);
    handler();

    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', handler);
    } else if (typeof mq.addListener === 'function') {
      mq.addListener(handler);
    }

    return () => {
      if (typeof mq.removeEventListener === 'function') {
        mq.removeEventListener('change', handler);
      } else if (typeof mq.removeListener === 'function') {
        mq.removeListener(handler);
      }
    };
  }, []);
  return reduced;
};

export const NetworkBackground: React.FC<{ className?: string; opacity?: number }> = ({ className = '', opacity = 1 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const nodesRef = useRef<NetNode[]>([]);
  const settingsRef = useRef<NetSettings | null>(null);
  const animRef = useRef<number | null>(null);
  const reducedMotion = useReducedMotion();
  const sizeRef = useRef<{w:number;h:number}>({w:0,h:0});

  const init = useCallback(() => {
    const canvas = canvasRef.current; const container = containerRef.current; if (!canvas || !container) return;
    const width = container.clientWidth;
    const height = container.scrollHeight || container.clientHeight;
    // Avoid unnecessary re-init if size unchanged
    if (sizeRef.current.w === width && sizeRef.current.h === height && nodesRef.current.length) return;
    sizeRef.current = {w: width, h: height};
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    const ctx = canvas.getContext('2d'); if (ctx) { ctx.setTransform(1,0,0,1,0,0); ctx.scale(dpr, dpr); }
    const nodeCount = reducedMotion ? 60 : width < 640 ? 75 : Math.min(160, Math.round((width*height)/18000));
    settingsRef.current = {
      nodeCount,
      maxSpeed: reducedMotion ? 0.02 : 0.06,
      linkDistance: width < 640 ? 110 : 170,
    };
    nodesRef.current = createNodes(nodeCount, width, height, settingsRef.current.maxSpeed);
  }, [reducedMotion]);

  const animate = useCallback(() => {
    const canvas = canvasRef.current; const settings = settingsRef.current;
    if (!canvas || !settings) { animRef.current = requestAnimationFrame(animate); return; }
    const ctx = canvas.getContext('2d'); if (!ctx) { animRef.current = requestAnimationFrame(animate); return; }
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);
    ctx.clearRect(0, 0, width, height);

    const nodes = nodesRef.current;
    if (!reducedMotion) {
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy; n.phase += 0.01;
        if (n.x < 0) { n.x = 0; n.vx *= -1; } else if (n.x > width) { n.x = width; n.vx *= -1; }
        if (n.y < 0) { n.y = 0; n.vy *= -1; } else if (n.y > height) { n.y = height; n.vy *= -1; }
      });
    }

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i]; const b = nodes[j];
        const dx = a.x - b.x; const dy = a.y - b.y; const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < settings.linkDistance) {
          const alpha = 1 - dist / settings.linkDistance;
          const col = a.hub ? a.color : b.hub ? b.color : a.color;
          let r=255,g=255,bv=255;
          if (col.startsWith('#') && col.length === 7){ r=parseInt(col.slice(1,3),16); g=parseInt(col.slice(3,5),16); bv=parseInt(col.slice(5,7),16);}    
          const hubBoost = (a.hub || b.hub) ? 1.25 : 1;
          ctx.strokeStyle = `rgba(${r},${g},${bv},${alpha * 0.32 * hubBoost})`;
          ctx.lineWidth = Math.max(0.4, alpha * (a.hub || b.hub ? 2.1 : 1.1));
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }

    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    nodes.forEach(n => {
      const pulse = Math.sin(n.phase) * 0.5 + 0.5;
      const effectiveR = n.r * (0.9 + pulse * 0.4);
      const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, effectiveR * 2.2);
      grd.addColorStop(0, n.color);
      grd.addColorStop(0.4, n.color);
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(n.x, n.y, effectiveR * 2.2, 0, Math.PI*2); ctx.fill();
    });
    ctx.restore();

    nodes.forEach(n => {
      const pulse = Math.sin(n.phase * 1.4) * 0.35 + 0.65;
      ctx.beginPath();
      ctx.fillStyle = n.hub ? 'white' : 'rgba(255,255,255,0.9)';
      ctx.arc(n.x, n.y, (n.hub ? 1.6 : 1) + n.r * 0.4 * pulse, 0, Math.PI*2); ctx.fill();
      if (n.hub) { ctx.strokeStyle = n.color; ctx.lineWidth=1.2; ctx.beginPath(); ctx.arc(n.x,n.y,(n.r*1.8)+pulse*1.4,0,Math.PI*2); ctx.stroke(); }
    });

    const vignette = ctx.createRadialGradient(width/2, height/2, width*0.1, width/2, height/2, width*0.9);
    vignette.addColorStop(0,'rgba(0,0,0,0)'); vignette.addColorStop(1,'rgba(0,0,0,0.35)');
    ctx.fillStyle = vignette; ctx.fillRect(0,0,width,height);

    animRef.current = requestAnimationFrame(animate);
  }, [reducedMotion]);

  useEffect(() => {
    init();
    animRef.current = requestAnimationFrame(animate);
    // Proper feature detection to avoid constructing ResizeObserver without callback
    const ro = typeof window !== 'undefined' && 'ResizeObserver' in window
      ? new ResizeObserver(() => init())
      : null;
    if (ro && containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', init);
    return () => {
      window.removeEventListener('resize', init);
      if (ro && containerRef.current) ro.unobserve(containerRef.current);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [init, animate]);

  return (
    <div ref={containerRef} className={`absolute inset-0 ${className}`} style={{ opacity }} aria-hidden="true">
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute inset-0 pointer-events-none" style={{background:'radial-gradient(circle at 50% 60%, rgba(255,255,255,0.06), rgba(0,0,0,0.9) 65%)'}} />
    </div>
  );
};

export default NetworkBackground;
