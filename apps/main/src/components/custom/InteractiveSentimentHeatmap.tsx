import React, { useEffect, useMemo, useRef, useState } from "react";
import { getPublicBlogReviewsApi } from "@/services/blogApi";
import type { BlogReviewResponse } from "@/types/blog/BlogReviewResponse";

type HeatmapCell = { rating: number; weekday: number; count: number };

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function InteractiveSentimentHeatmap({
  productId,
  onFilterChange,
}: {
  productId?: string;
  onFilterChange?: (weekday: number | null) => void;
}) {
  const [reviews, setReviews] = useState<BlogReviewResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [hover, setHover] = useState<{ x: number; y: number; text: string } | null>(null);
  const [filterDay, setFilterDay] = useState<number | null>(null);
  const [pointHover, setPointHover] = useState<{ x: number; y: number; text: string } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const all: BlogReviewResponse[] = [];
        let page = 0;
        const size = 100;
        const maxPages = 5; // up to 500 reviews
        for (; page < maxPages; page++) {
          const resp = await getPublicBlogReviewsApi({ productId, page, size });
          // resp is AxiosResponse<ApiResponse<PageResponse<...>>>; payload is in resp.data.data
          if (!resp || !resp.data || !resp.data.data) break;
          const payload = resp.data.data;
          const items = payload?.content || [];
          all.push(...items);
          if (items.length < size) break;
        }
        if (mounted) setReviews(all);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => { mounted = false; };
  }, [productId]);

  const distribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    reviews.forEach(r => {
      const idx = Math.max(1, Math.min(5, Math.round(r.rating ?? 5))) - 1;
      counts[idx]++;
    });
    const total = counts.reduce((a, b) => a + b, 0) || 1;
    return counts.map((c, i) => ({ rating: i + 1, count: c, pct: Math.round((c / total) * 100) }));
  }, [reviews]);

  const trend = useMemo(() => {
    // average rating per day for last 30 days, optionally filtered by weekday
    const map = new Map<string, { sum: number; n: number; weekday: number }>();
    const end = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(end);
      d.setDate(end.getDate() - (29 - i));
      map.set(formatDate(d), { sum: 0, n: 0, weekday: d.getDay() });
    }
    reviews.forEach(r => {
      const d = r.createdAt ? new Date(r.createdAt) : new Date();
      if (filterDay !== null && d.getDay() !== filterDay) return;
      const key = formatDate(d);
      if (!map.has(key)) return;
      const entry = map.get(key)!;
      entry.sum += r.rating ?? 0;
      entry.n += 1;
    });
    const labels: string[] = [];
    const values: number[] = [];
    Array.from(map.entries()).forEach(([k, v]) => {
      labels.push(k.slice(5)); // MM-DD
      values.push(v.n ? +(v.sum / v.n).toFixed(2) : 0);
    });
    return { labels, values };
  }, [reviews, filterDay]);

  const heatmap = useMemo(() => {
    // rows: rating 1..5, cols: weekday 0..6 (Sun..Sat)
    const grid: number[][] = Array.from({ length: 5 }, () => Array(7).fill(0));
    reviews.forEach(r => {
      const d = r.createdAt ? new Date(r.createdAt) : new Date();
      const wd = d.getDay();
      const rating = Math.max(1, Math.min(5, Math.round(r.rating ?? 5)));
      grid[rating - 1][wd]++;
    });
    const cells: HeatmapCell[] = [];
    for (let rating = 5; rating >= 1; rating--) {
      for (let wd = 0; wd < 7; wd++) {
        cells.push({ rating, weekday: wd, count: grid[rating - 1][wd] });
      }
    }
    const max = Math.max(1, ...cells.map(c => c.count));
    return { cells, max };
  }, [reviews]);

  const weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  const onCellHover = (e: React.MouseEvent, c: HeatmapCell) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    setHover({ x: e.clientX + 12, y: e.clientY + 8, text: `Rating ${c.rating} on ${weekdays[c.weekday]}: ${c.count}` });
  };

  const downloadCSV = () => {
    const rows: string[] = [];
    rows.push('rating,weekday,count');
    heatmap.cells.forEach(c => rows.push(`${c.rating},${c.weekday},${c.count}`));
    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'review-heatmap.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div ref={containerRef} className="p-4 bg-white rounded border">
      <div className="flex items-start justify-between">
        <h3 className="font-bold mb-2">Interactive Sentiment & Rating Heatmap</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setFilterDay(null);
              onFilterChange?.(null);
            }}
            className="text-xs px-2 py-1 border rounded"
          >
            Clear filter
          </button>
          <button onClick={downloadCSV} className="text-xs px-2 py-1 border rounded">Export CSV</button>
        </div>
      </div>
      {loading && <div className="text-sm text-slate-500">Loading data...</div>}
      <div className="grid grid-cols-3 gap-4 mt-3">
        <div>
          <h4 className="font-medium">Distribution</h4>
          <div className="mt-2 space-y-2">
            {distribution.map(d => (
              <div key={d.rating} className="flex items-center gap-2">
                <div className="w-8 text-xs">{d.rating}★</div>
                <div className="flex-1 h-3 bg-slate-100 rounded overflow-hidden">
                  <div style={{ width: `${d.pct}%` }} className="h-3 bg-amber-400 transition-all" />
                </div>
                <div className="w-12 text-right text-xs">{d.count}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-medium">Trend (30 days avg)</h4>
          <svg viewBox="0 0 300 60" className="w-full h-16">
            <polyline
              fill="none"
              stroke="#f59e0b"
              strokeWidth={2}
              points={trend.values.map((v, i) => `${(i / (trend.values.length - 1 || 1)) * 300},${60 - (v / 5) * 60}`).join(" ")}
            />
            {trend.values.map((v, i) => {
              const x = (i / (trend.values.length - 1 || 1)) * 300;
              const y = 60 - (v / 5) * 60;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={3}
                  fill="#f59e0b"
                  onMouseEnter={(e) => setPointHover({ x: e.clientX + 8, y: e.clientY - 8, text: `${trend.labels[i]}: ${v}` })}
                  onMouseLeave={() => setPointHover(null)}
                />
              );
            })}
          </svg>
          <div className="text-xs text-slate-500">Avg rating per day (empty=0){filterDay !== null && ` — filtered: ${weekdays[filterDay]}`}</div>
        </div>
        <div>
          <h4 className="font-medium">Heatmap (Rating × Weekday)</h4>
          <div className="mt-2">
            <div className="grid grid-cols-7 gap-1 text-xs text-center text-slate-600">
              {weekdays.map(d => <div key={d} className="py-1">{d}</div>)}
            </div>
            <div className="mt-1 grid grid-rows-5 gap-1">
              {Array.from({ length: 5 }).map((_, rowIdx) => (
                <div key={rowIdx} className="flex gap-1 items-center">
                  <div className="w-8 text-xs text-center">{5 - rowIdx}★</div>
                  <div className="flex-1 grid grid-cols-7 gap-1">
                    {heatmap.cells.slice(rowIdx * 7, rowIdx * 7 + 7).map(c => {
                      const intensity = Math.round((c.count / heatmap.max) * 255);
                      const bg = `rgb(${255 - intensity}, ${230 - Math.round(intensity * 0.2)}, ${200 - Math.round(intensity * 0.6)})`;
                      return (
                        <div
                          key={`${c.rating}-${c.weekday}`}
                          onMouseMove={(e) => onCellHover(e, c)}
                          onMouseLeave={() => setHover(null)}
                          onClick={() => {
                            const newVal = c.weekday === filterDay ? null : c.weekday;
                            setFilterDay(newVal);
                            onFilterChange?.(newVal);
                          }}
                          style={{ background: bg }}
                          className={`h-10 flex items-center justify-center text-xs cursor-pointer ${filterDay === c.weekday ? 'ring-2 ring-amber-300' : ''}`}
                          role="button"
                          aria-label={`Rating ${c.rating} - ${c.count}`}
                        >
                          {c.count || ""}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-2">Click a cell to filter trend by weekday</div>
        </div>
      </div>
      {hover && (
        <div style={{ position: 'fixed', left: hover.x, top: hover.y, zIndex: 60 }} className="bg-black text-white text-xs px-2 py-1 rounded">{hover.text}</div>
      )}
      {pointHover && (
        <div style={{ position: 'fixed', left: pointHover.x, top: pointHover.y, zIndex: 60 }} className="bg-black text-white text-xs px-2 py-1 rounded">{pointHover.text}</div>
      )}
    </div>
  );
}
