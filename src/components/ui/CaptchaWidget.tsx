import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { RefreshCw } from 'lucide-react';

// ─── Public API ───────────────────────────────────────────────────────────────
export interface CaptchaHandle {
  /** Call this after a failed submission to regenerate the code */
  refresh: () => void;
  /** Returns true if the provided user value matches the current code */
  verify: (input: string) => boolean;
}

interface CaptchaWidgetProps {
  theme: 'light' | 'dark';
  /** Fired whenever the user changes their input */
  onInput?: (value: string) => void;
  /** The current typed value controlled externally */
  value: string;
  setValue: (v: string) => void;
}

// ─── CAPTCHA generator ────────────────────────────────────────────────────────
function generateCode(): string {
  let c = '';
  for (let i = 0; i < 5; i++) {
    c += Math.floor(Math.random() * 10).toString();
  }
  return c;
}

// ─── Canvas renderer ──────────────────────────────────────────────────────────
function drawCaptcha(canvas: HTMLCanvasElement, code: string, darkMode: boolean) {
  const W = canvas.width;
  const H = canvas.height;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = darkMode ? '#0A1A2E' : '#F0F5FF';
  ctx.fillRect(0, 0, W, H);

  // Subtle gradient overlay
  const grad = ctx.createLinearGradient(0, 0, W, H);
  if (darkMode) {
    grad.addColorStop(0, 'rgba(21,94,239,0.07)');
    grad.addColorStop(1, 'rgba(14,165,233,0.05)');
  } else {
    grad.addColorStop(0, 'rgba(21,94,239,0.05)');
    grad.addColorStop(1, 'rgba(99,102,241,0.04)');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Noise dots
  for (let i = 0; i < 120; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = darkMode
      ? `rgba(${120 + Math.random() * 135},${120 + Math.random() * 135},${120 + Math.random() * 135},${0.2 + Math.random() * 0.4})`
      : `rgba(${40 + Math.random() * 100},${40 + Math.random() * 100},${180 + Math.random() * 75},${0.15 + Math.random() * 0.3})`;
    ctx.fill();
  }

  // Interference lines
  const lineColors = darkMode
    ? ['rgba(56,189,248,0.35)', 'rgba(99,102,241,0.3)', 'rgba(168,85,247,0.28)', 'rgba(34,211,238,0.22)']
    : ['rgba(21,94,239,0.25)', 'rgba(99,102,241,0.2)', 'rgba(14,165,233,0.18)', 'rgba(139,92,246,0.15)'];

  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * W, Math.random() * H);
    ctx.bezierCurveTo(
      Math.random() * W, Math.random() * H,
      Math.random() * W, Math.random() * H,
      Math.random() * W, Math.random() * H
    );
    ctx.strokeStyle = lineColors[i % lineColors.length];
    ctx.lineWidth = 1 + Math.random() * 1.5;
    ctx.stroke();
  }

  // Draw each digit with random tilt, scale & color
  const charColors = darkMode
    ? ['#38BDF8', '#818CF8', '#A78BFA', '#34D399', '#FB923C', '#F472B6', '#FBBF24']
    : ['#155EEF', '#4F46E5', '#7C3AED', '#059669', '#EA580C', '#DB2777', '#D97706'];

  const cellW = W / code.length;
  for (let i = 0; i < code.length; i++) {
    const x = cellW * i + cellW / 2;
    const y = H / 2 + (Math.random() - 0.5) * 10;
    const angle = (Math.random() - 0.5) * 0.55; // ±~16°
    const fontSize = 22 + Math.floor(Math.random() * 7);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.font = `${Math.random() > 0.5 ? 'bold ' : ''}${fontSize}px 'Courier New', monospace`;
    ctx.fillStyle = charColors[i % charColors.length];
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Slight shadow for depth
    ctx.shadowColor = darkMode ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,50,0.25)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;

    ctx.fillText(code[i], 0, 0);
    ctx.restore();
  }

  // Strikethrough line over digits
  ctx.beginPath();
  ctx.moveTo(10, H / 2 + (Math.random() - 0.5) * 8);
  ctx.lineTo(W - 10, H / 2 + (Math.random() - 0.5) * 8);
  ctx.strokeStyle = darkMode ? 'rgba(99,102,241,0.4)' : 'rgba(21,94,239,0.25)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

// ─── Component ─────────────────────────────────────────────────────────────────
const CaptchaWidget = forwardRef<CaptchaHandle, CaptchaWidgetProps>(({ theme, value, setValue }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [code, setCode] = useState<string>(() => generateCode());
  const [shake, setShake] = useState(false);
  const isDark = theme === 'dark';

  const refresh = useCallback(() => {
    const next = generateCode();
    setCode(next);
    setValue('');
  }, [setValue]);

  // Expose API to parent
  useImperativeHandle(ref, () => ({
    refresh,
    verify: (input: string) => input.trim() === code,
  }), [refresh, code]);

  // Re-render canvas when code or theme changes
  useEffect(() => {
    if (!canvasRef.current) return;
    drawCaptcha(canvasRef.current, code, isDark);
  }, [code, isDark]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  // Auto-verify inline so shake fires immediately on wrong entry
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 5);
    setValue(v);
    if (v.length === 5 && v !== code) {
      triggerShake();
    }
  };

  return (
    <div className="space-y-2">
      <label className={`block text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-1`}>
        Security CAPTCHA
      </label>

      {/* Canvas + Refresh button row */}
      <div className="flex items-center gap-2">
        <div
          className={`relative rounded-xl overflow-hidden border ${
            isDark
              ? 'border-white/15 bg-[#0A1A2E]'
              : 'border-slate-300 bg-[#F0F5FF]'
          } shadow-inner flex-1`}
          style={{ height: 56 }}
        >
          <canvas
            ref={canvasRef}
            width={220}
            height={56}
            className="w-full h-full select-none pointer-events-none"
            aria-label="CAPTCHA image"
          />
          {/* Subtle gloss overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        </div>

        {/* Refresh button */}
        <button
          type="button"
          onClick={refresh}
          title="Generate new CAPTCHA"
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer ${
            isDark
              ? 'bg-white/5 border border-white/10 text-slate-300 hover:bg-blue-600/20 hover:border-blue-500/40 hover:text-[#38BDF8]'
              : 'bg-slate-100 border border-slate-300 text-slate-600 hover:bg-blue-50 hover:border-blue-400 hover:text-[#155EEF]'
          } active:scale-95`}
          aria-label="Refresh CAPTCHA"
        >
          <RefreshCw className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Input */}
      <div className="relative">
        <input
          id="captcha-input"
          type="text"
          inputMode="numeric"
          maxLength={5}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          value={value}
          onChange={handleChange}
          placeholder="Enter the 5 digits above"
          className={`w-full px-4 py-2.5 rounded-2xl text-sm outline-none transition-all tracking-[0.25em] font-mono text-center font-bold
            ${isDark
              ? 'bg-[#09192C] border border-white/10 text-white placeholder:text-slate-500 placeholder:tracking-normal placeholder:font-sans placeholder:font-normal focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8]'
              : 'bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 placeholder:tracking-normal placeholder:font-sans placeholder:font-normal focus:bg-white focus:border-[#155EEF] focus:ring-1 focus:ring-[#155EEF]'
            }
            ${shake ? 'animate-[shake_0.4s_ease-in-out]' : ''}
            ${value.length === 5 && value === code
              ? (isDark ? 'border-emerald-500/60 ring-1 ring-emerald-500/40' : 'border-emerald-500 ring-1 ring-emerald-300')
              : ''
            }
          `}
        />

        {/* Live indicator dot */}
        {value.length === 5 && (
          <div className={`absolute right-3.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${
            value === code ? 'bg-emerald-500' : 'bg-rose-500'
          }`} />
        )}
      </div>

      {/* Helper text */}
      <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
        Enter the 5-digit code shown in the image. Click{' '}
        <button
          type="button"
          onClick={refresh}
          className={`underline cursor-pointer ${isDark ? 'text-[#38BDF8]' : 'text-[#155EEF]'} hover:no-underline`}
        >
          refresh
        </button>{' '}
        for a new code.
      </p>
    </div>
  );
});

CaptchaWidget.displayName = 'CaptchaWidget';
export { CaptchaWidget };
