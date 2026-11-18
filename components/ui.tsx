'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowDownWideNarrow, ArrowLeft, ArrowRight, BookOpen, BriefcaseBusiness, ChevronDown, Lightbulb, Search, X, type LucideIcon } from 'lucide-react';
import { type Category, type Person, initials, roleLabel } from '@/lib/workspace';

export const categoryIcons: Record<Category, LucideIcon> = { Work: BriefcaseBusiness, Personal: BookOpen, Ideas: Lightbulb };
export const categoryClass = (category: Category) => `category-${category.toLowerCase()}`;

export function Brand() {
  return <span className="brand">
    <svg className="brand-mark" width="38" height="38" viewBox="0 0 48 48" aria-hidden="true">
      <rect width="48" height="48" rx="13" fill="currentColor" />
      <g fill="none" stroke="#22382b" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 13.5h14.5A3.5 3.5 0 0 1 32 17v16.5H16a3 3 0 0 1-3-3V17a3.5 3.5 0 0 1 3.5-3.5M13 30.5a3 3 0 0 1 3-3h16M19 19h6.5M19 23h4"/>
        <path d="M33.5 8.9v6.6m3.3-3.3h-6.6"/>
      </g>
    </svg>
    <span>Fieldnote<span className="brand-period">.</span></span>
  </span>;
}

export function Avatar({ person, size = 'medium' }: { person?: Person; size?: 'small' | 'medium' | 'large' | 'hero' }) {
  return <span aria-hidden="true" className={`avatar fn-avatar avatar-${size} tone-${person?.tone ?? 'olive'}`}><span>{person ? initials(person.name) : '?'}</span></span>;
}

export function RoleBadge({ role }: { role: Person['role'] }) {
  return <span className={`badge role-badge ${role === 'admin' ? 'role-admin' : ''}`}>{roleLabel(role)}</span>;
}

export function CategoryIcon({ category }: { category: Category }) {
  const Icon = categoryIcons[category];
  return <span className={`category-icon ${categoryClass(category)}`}><Icon size={17} strokeWidth={1.65} aria-hidden="true" /></span>;
}

export function CategoryTag({ category }: { category: Category }) {
  return <span className={`badge category-tag ${categoryClass(category)}`}><span className="tag-dot" />{category}</span>;
}

export function Heading({ title, eyebrow, description, action }: { title: string; eyebrow: string; description: string; action?: ReactNode }) {
  return <header className="page-heading">
    <div>
      <p className="eyebrow"><span className="eyebrow-dot" />{eyebrow}</p>
      <h1>{title}</h1>
      <p className="page-description">{description}</p>
    </div>
    {action && <div className="page-action">{action}</div>}
  </header>;
}

export function FilterField({ value, onChange, label, placeholder }: { value: string; onChange: (value: string) => void; label: string; placeholder: string }) {
  return <label className="input filter-field"><Search size={16} aria-hidden="true" /><input type="search" aria-label={label} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} /></label>;
}

export function SelectField({ value, onChange, label, options, sort = false }: { value: string; onChange: (value: string) => void; label: string; options: { value: string; label: string }[]; sort?: boolean }) {
  return <label className={`select select-field ${sort ? 'sort-field' : ''}`}>
    {sort && <ArrowDownWideNarrow size={15} aria-hidden="true" />}
    <select aria-label={label} value={value} onChange={e => onChange(e.target.value)}>{options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
    <ChevronDown className="select-chevron" size={13} aria-hidden="true" />
  </label>;
}

export function BlankState({ icon: Icon, title, description, action }: { icon: LucideIcon; title: string; description: string; action?: ReactNode }) {
  return <div className="blank-state">
    <span className="blank-icon"><Icon size={24} strokeWidth={1.6} /></span>
    <h2>{title}</h2><p>{description}</p>
    {action && <div className="blank-action">{action}</div>}
  </div>;
}

export function Pagination({ page, pageSize, total, noun, onPage }: { page: number; pageSize: number; total: number; noun: string; onPage: (value: number) => void }) {
  if (!total) return null;
  const max = Math.ceil(total / pageSize);
  const steps = Array.from(new Set([1, ...(page > 2 ? [page - 1] : []), page, ...(page < max - 1 ? [page + 1] : []), max])).sort((a, b) => a - b);
  return <footer className="pager">
    <p>Showing <strong>{(page - 1) * pageSize + 1}–{Math.min(total, page * pageSize)}</strong> of <strong>{total}</strong> {total === 1 ? noun : `${noun}s`}</p>
    {max > 1 && <nav className="page-buttons" aria-label={`${noun} pages`}>
      <button type="button" className="btn fn-icon page-arrow" aria-label="Previous page" disabled={page <= 1} onClick={() => onPage(page - 1)}><ArrowLeft size={15} /></button>
      {steps.map((step, i) => <span className="page-step" key={step}>
        {i > 0 && step - steps[i - 1] > 1 && <span className="page-gap" aria-hidden="true">…</span>}
        <button type="button" className={`btn page-number ${step === page ? 'is-current' : ''}`} aria-label={`Page ${step}`} aria-current={step === page ? 'page' : undefined} onClick={() => onPage(step)}>{step}</button>
      </span>)}
      <button type="button" className="btn fn-icon page-arrow" aria-label="Next page" disabled={page >= max} onClick={() => onPage(page + 1)}><ArrowRight size={15} /></button>
    </nav>}
  </footer>;
}

export type Action = { label: string; icon: LucideIcon; onClick: () => void; danger?: boolean };
export function ActionMenu({ label, trigger, entries, up = false, className = '' }: { label: string; trigger: ReactNode; entries: Action[]; up?: boolean; className?: string }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const first = useRef<HTMLButtonElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    function outside(e: PointerEvent) { if (!wrap.current?.contains(e.target as Node)) setOpen(false); }
    function escape(e: KeyboardEvent) { if (e.key === 'Escape') { setOpen(false); triggerRef.current?.focus(); } }
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [open]);
  return <div className={`action-wrap ${up ? 'action-up' : ''} ${open ? 'action-open' : ''}`} ref={wrap} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false); }}>
    <button type="button" className={className || 'btn fn-icon menu-trigger'} ref={triggerRef} aria-label={label} aria-controls={open ? id : undefined} aria-expanded={open} onClick={() => setOpen(!open)} onKeyDown={e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); requestAnimationFrame(() => first.current?.focus()); }
    }}>{trigger}</button>
    {open && <div id={id} className="menu action-menu" aria-label={label}>
      {entries.map(({ label, icon: Icon, onClick, danger }, i) => <button type="button" key={label} ref={i === 0 ? first : undefined} className={danger ? 'menu-danger' : ''} onClick={() => { setOpen(false); triggerRef.current?.focus(); onClick(); }}><Icon size={15} strokeWidth={1.8} />{label}</button>)}
    </div>}
  </div>;
}

export function Overlay({ open, kind, title, eyebrow, onClose, children }: { open: boolean; kind: 'sheet' | 'dialog' | 'search'; title: string; eyebrow?: string; onClose: () => void; children?: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const panel = useRef<HTMLElement>(null);
  const id = useId();
  const reduce = useReducedMotion();
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!mounted || !open) return;
    const prev = document.activeElement as HTMLElement | null;
    const scroll = document.body.style.overflow;
    const shell = document.querySelector<HTMLElement>('[data-workspace-content]');
    shell?.setAttribute('inert', '');
    document.body.style.overflow = 'hidden';
    const focus = requestAnimationFrame(() => {
      const el = panel.current?.querySelector<HTMLElement>('[data-initial-focus]') ?? panel.current;
      el?.focus({ preventScroll: true });
    });
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
      if (e.key !== 'Tab') return;
      const els = Array.from(panel.current?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex="0"]') ?? []).filter(el => el.getClientRects().length > 0);
      const first = els[0];
      const last = els[els.length - 1];
      if (!first) { e.preventDefault(); return; }
      if (!panel.current?.contains(document.activeElement) || document.activeElement === panel.current) { e.preventDefault(); (e.shiftKey ? last : first).focus(); }
      else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      cancelAnimationFrame(focus);
      document.body.style.overflow = scroll;
      shell?.removeAttribute('inert');
      if (prev?.isConnected && !prev.closest('.overlay-panel')) prev.focus({ preventScroll: true });
    };
  }, [open, onClose, mounted, kind, title]);
  if (!mounted) return null;
  return createPortal(<AnimatePresence>
    {open && <motion.div className={`overlay-layer overlay-${kind}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.16 }}>
      <div className="overlay-scrim" aria-hidden="true" onClick={onClose} />
      <motion.section ref={panel} className="overlay-panel" role="dialog" aria-modal="true" aria-labelledby={id} tabIndex={-1}
        initial={reduce ? false : kind === 'sheet' ? { x: '100%' } : { y: 12, scale: 0.985 }}
        animate={{ x: 0, y: 0, scale: 1 }} exit={reduce ? { opacity: 0 } : kind === 'sheet' ? { x: '100%' } : { y: 7, scale: 0.99 }}
        transition={{ type: 'tween', duration: 0.23, ease: [0.22, 1, 0.36, 1] }}>
        <header className="overlay-heading">
          <div>{eyebrow && <p className="eyebrow"><span className="eyebrow-dot" />{eyebrow}</p>}<h2 id={id}>{title}</h2></div>
          <button className="btn fn-icon close-overlay" type="button" aria-label="Close dialog" onClick={onClose}><X size={21} strokeWidth={1.75} /></button>
        </header>
        {children}
      </motion.section>
    </motion.div>}
  </AnimatePresence>, document.body);
}
