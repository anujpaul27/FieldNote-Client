'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Ellipsis, FileText, LayoutGrid, List, Pin, PinOff, Plus, Sprout, SquarePen, Trash2 } from 'lucide-react';
import { categories, compactText, formatDate, type Note, type Category } from '@/lib/workspace';
import { ActionMenu, BlankState, CategoryIcon, CategoryTag, Heading, Pagination, SelectField } from './ui';

export type NoteLayout = 'grid' | 'list';
type Filter = 'All notes' | 'Pinned' | Category;
const filters: Filter[] = ['All notes', 'Pinned', ...categories];
const sortOptions = [
  { value: 'recent', label: 'Last edited' }, { value: 'newest', label: 'Newest created' }, { value: 'title', label: 'Title A–Z' },
];
const pageSize = 6;

function FernBanner() {
  return <section className="fern-banner" aria-label="Your field journal">
    <div className="fern-art" aria-hidden="true" />
    <div className="fern-content">
      <span className="fern-eyebrow"><Sprout size={15} strokeWidth={1.8} /> THE FIELD JOURNAL</span>
      <h2>A little room to <em>think.</em></h2>
      <p>A private place for whatever’s on your mind.</p>
    </div>
    <div className="fern-index" aria-hidden="true"><span /> FIG. 01 &nbsp; / &nbsp; WOOD FERN</div>
  </section>;
}

function NoteCard({ note, onOpen, onPin, onDelete }: { note: Note; onOpen: () => void; onPin: () => void; onDelete: () => void }) {
  const preview = compactText(note.body.split(/\n\s*\n/)[0]) || 'No content yet.';
  return <motion.article className="card note-card" whileHover={{ y: -2 }} transition={{ type: 'tween', duration: 0.16 }}>
    <button type="button" className="note-target" onClick={onOpen} aria-label={`Open ${note.title}`} />
    <div className="note-top">
      <CategoryIcon category={note.category} />
      <div className="note-tools">
        {note.pinned && <span className="pinned-indicator" title="Pinned"><Pin size={14} strokeWidth={1.7} aria-label="Pinned" /></span>}
        <ActionMenu label={`Options for ${note.title}`} trigger={<Ellipsis size={19} strokeWidth={2} />} entries={[
          { label: 'Edit note', icon: SquarePen, onClick: onOpen },
          { label: note.pinned ? 'Unpin note' : 'Pin note', icon: note.pinned ? PinOff : Pin, onClick: onPin },
          { label: 'Delete note', icon: Trash2, onClick: onDelete, danger: true },
        ]} />
      </div>
    </div>
    <div className="note-copy"><h3>{note.title}</h3><p>{preview}</p></div>
    <div className="note-meta">
      <CategoryTag category={note.category} />
      <time dateTime={note.updatedAt} title={`Last edited ${formatDate(note.updatedAt, true)}`}><CalendarDays size={13} strokeWidth={1.7} aria-hidden="true" />{formatDate(note.updatedAt)}</time>
    </div>
  </motion.article>;
}

export function NotesView({ notes, layout, setLayout, onNew, onOpen, onPin, onDelete }: { notes: Note[]; layout: NoteLayout; setLayout: (layout: NoteLayout) => void; onNew: () => void; onOpen: (note: Note) => void; onPin: (note: Note) => void; onDelete: (note: Note) => void }) {
  const [filter, setFilter] = useState<Filter>('All notes');
  const [sort, setSort] = useState('recent');
  const [page, setPage] = useState(1);
  const filtered = notes.filter(n => filter === 'All notes' || (filter === 'Pinned' ? n.pinned : n.category === filter)).sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (sort === 'title') return a.title.localeCompare(b.title);
    if (sort === 'newest') return b.createdAt.localeCompare(a.createdAt);
    return b.updatedAt.localeCompare(a.updatedAt);
  });
  const safePage = Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize)));
  const shown = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const choose = (f: Filter) => { setFilter(f); setPage(1); };
  const newNote = () => { choose('All notes'); setSort('recent'); onNew(); };
  return <>
    <Heading title="My notes" eyebrow="PERSONAL WORKSPACE" description="Capture ideas, make plans, and keep what matters." action={<button type="button" className="btn fn-btn primary-btn" onClick={newNote}><Plus size={18} strokeWidth={2} />New note</button>} />
    <FernBanner />
    <section className="notes-library" aria-labelledby="library-heading">
      <div className="library-heading"><h2 id="library-heading">Your library</h2><span className="badge count-badge" aria-live="polite">{filtered.length} {filtered.length === 1 ? 'note' : 'notes'}</span></div>
      <div className="notes-toolbar">
        <div className="note-filters" role="group" aria-label="Filter notes">
          {filters.map(f => <button key={f} type="button" className={`btn filter-pill ${filter === f ? 'is-active' : ''} ${f === 'Work' ? 'starts-categories' : ''}`} aria-pressed={filter === f} onClick={() => choose(f)}>
            {f === 'Pinned' && <Pin size={14} strokeWidth={1.7} />}{f}
          </button>)}
        </div>
        <div className="view-options">
          <SelectField value={sort} onChange={value => { setSort(value); setPage(1); }} label="Sort notes" options={sortOptions} sort />
          <div className="join layout-toggle" role="group" aria-label="Notes layout">
            <button type="button" className={`btn join-item fn-icon ${layout === 'grid' ? 'layout-active' : ''}`} aria-pressed={layout === 'grid'} aria-label="Grid view" title="Grid view" onClick={() => setLayout('grid')}><LayoutGrid size={16} strokeWidth={1.8} /></button>
            <button type="button" className={`btn join-item fn-icon ${layout === 'list' ? 'layout-active' : ''}`} aria-pressed={layout === 'list'} aria-label="List view" title="List view" onClick={() => setLayout('list')}><List size={17} strokeWidth={1.8} /></button>
          </div>
        </div>
      </div>
      {shown.length ? <>
        <motion.div key={`${filter}-${safePage}-${layout}`} className={`notes-grid ${layout === 'list' ? 'notes-list' : ''}`} initial={{ y: 4 }} animate={{ y: 0 }} transition={{ duration: 0.2 }}>
          {shown.map(n => <NoteCard key={n.id} note={n} onOpen={() => onOpen(n)} onPin={() => onPin(n)} onDelete={() => onDelete(n)} />)}
        </motion.div>
        <Pagination page={safePage} pageSize={pageSize} total={filtered.length} noun="note" onPage={setPage} />
      </> : <BlankState icon={filter === 'Pinned' ? Pin : FileText} title={filter === 'Pinned' ? 'Nothing pinned yet' : 'No notes here yet'} description={filter === 'Pinned' ? 'Pin a note to keep it at the top of your library.' : filter === 'All notes' ? 'Your ideas start with a blank page.' : `Your ${filter.toLowerCase()} notes will appear here.`} action={filter === 'All notes' ? <button className="btn fn-btn primary-btn" onClick={newNote}><Plus size={17} />New note</button> : <button className="btn fn-btn secondary-btn" onClick={() => choose('All notes')}>View all notes</button>} />}
    </section>
  </>;
}
