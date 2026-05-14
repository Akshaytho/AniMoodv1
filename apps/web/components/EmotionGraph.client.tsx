'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { GraphNode, GraphLink } from '@/lib/emotion-graph-data';

// react-force-graph-2d's TS types are intentionally loose (NodeObject extends
// Record<string, any>); we cast to `any` at the property boundary rather than
// fight the library's typings.
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false }) as any;

interface EmotionGraphProps {
  nodes: GraphNode[];
  links: GraphLink[];
  height?: number;
}

interface ForceNode extends GraphNode {
  x?: number;
  y?: number;
}

export function EmotionGraph({ nodes, links, height = 380 }: EmotionGraphProps) {
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(800);

  // Measure container width so graph fills it responsively
  useEffect(() => {
    if (!wrapRef.current) return;
    const el = wrapRef.current;
    const update = () => setWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function onClick(n: ForceNode) {
    if (n.kind === 'anime') router.push(`/anime/${n.slug}`);
    else if (n.kind === 'emotion') router.push(`/emotion/${n.slug}`);
    else router.push(`/theme/${n.slug}`);
  }

  return (
    <div ref={wrapRef} className="relative w-full" style={{ height }}>
      <ForceGraph2D
        graphData={{ nodes: nodes as ForceNode[], links }}
        width={width}
        height={height}
        backgroundColor="rgba(0,0,0,0)"
        nodeRelSize={5}
        nodeColor={(n: any) => (n as ForceNode).color}
        nodeLabel={(n: any) => `${(n as ForceNode).name}`}
        linkColor={() => 'rgba(167, 139, 250, 0.25)'}
        linkWidth={(l: any) => ((l as { weight?: number }).weight ?? 1) * 1}
        linkDirectionalParticles={1}
        linkDirectionalParticleWidth={1.4}
        linkDirectionalParticleColor={() => 'rgba(255,165,220,0.7)'}
        cooldownTicks={140}
        d3VelocityDecay={0.34}
        onNodeHover={(n: any) => {
          if (typeof document !== 'undefined') {
            document.body.style.cursor = n ? 'pointer' : 'default';
          }
        }}
        onNodeClick={(n: any) => onClick(n as ForceNode)}
        nodeCanvasObject={(n: any, ctx: any, globalScale: any) => {
          const node = n as ForceNode;
          // Guard against pre-layout NaN/undefined coords
          if (!Number.isFinite(node.x) || !Number.isFinite(node.y)) return;
          const x = node.x as number;
          const y = node.y as number;
          const fontSize = 11 / globalScale;
          const r = node.val;
          const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 2.2);
          grad.addColorStop(0, node.color + 'cc');
          grad.addColorStop(1, node.color + '00');
          ctx.beginPath();
          ctx.arc(x, y, r * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fillStyle = node.color;
          ctx.fill();
          ctx.lineWidth = 1 / globalScale;
          ctx.strokeStyle = 'rgba(255,255,255,0.4)';
          ctx.stroke();
          ctx.font = `${fontSize}px ui-sans-serif, system-ui, -apple-system, "Geist", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillStyle = '#f3f3f5';
          ctx.shadowColor = 'rgba(0,0,0,0.8)';
          ctx.shadowBlur = 3;
          ctx.fillText(node.name, x, y + r + 3);
          ctx.shadowBlur = 0;
        }}
      />
    </div>
  );
}
