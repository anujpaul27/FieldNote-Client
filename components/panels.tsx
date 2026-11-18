'use client';

import { useId, useRef, useState, type FormEvent } from 'react';
import { ArrowRight, CalendarDays, ChevronRight, FileText, Globe2, LockKeyhole, Pin, Search, ShieldCheck, Trash2, UserRound, UsersRound } from 'lucide-react';
import { categories, cleanInterests, compactText, formatDate, matches, type Category, type Note, type Person, type Post, type Role } from '@/lib/workspace';
import { Avatar, CategoryIcon, CategoryTag, Pagination, RoleBadge } from './ui';
import type { InterestGroup } from './views';

export interface NoteDraft { title: string; body: string; category: Category; pinned: boolean; }
export interface PersonDraft { name: string; email: string; interests: string[]; role: Role; }
export interface PostDraft { title: string; body: string; }

export function NoteEditor({ note, onSave, onClose, onDelete }: { note?: Note; onSave: (data: NoteDraft) => void; onClose: () => void; onDelete?: () => void }) {
  const [title, setTitle] = useState(note?.title ?? '');
  const [category, setCategory] = useState<Category>(note?.category ?? 'Personal');
  const [body, setBody] = useState(note?.body ?? '');
  const [pinned, setPinned] = useState(note?.pinned ?? false);
  const [error, setError] = useState('');
  function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError('Give your note a title.'); return; }
    onSave({ title: title.trim(), category, body: body.trim(), pinned });
  }
  return <form className="panel-form" onSubmit={submit}>
    <div className="panel-body editor-body">
      <div className="panel-caption"><LockKeyhole size={15} /> This note isn’t part of the public feed.</div>
      <label className="form-field"><span>Title</span><input className="input text-control editor-title" data-initial-focus required maxLength={100} value={title} placeholder="Give your note a title" onChange={e => { setTitle(e.target.value); setError(''); }} /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-field"><span id="note-category-label">Category</span><div className="editor-categories" role="group" aria-labelledby="note-category-label">
        {categories.map(c => <button className={`btn editor-category ${category === c ? 'selected' : ''}`} type="button" key={c} aria-pressed={category === c} onClick={() => setCategory(c)}><CategoryIcon category={c} />{c}</button>)}
      </div></div>
      <label className="form-field body-field"><span>Note</span><textarea className="textarea text-control" placeholder="What’s on your mind?" value={body} maxLength={10000} onChange={e => setBody(e.target.value)} /></label>
      <div className="editor-bottom"><button type="button" className={`btn fn-btn secondary-btn pin-control ${pinned ? 'is-pinned' : ''}`} aria-pressed={pinned} onClick={() => setPinned(!pinned)}><Pin size={15} />{pinned ? 'Pinned' : 'Pin note'}</button><span className="muted">{body.length.toLocaleString('en-US')} / 10,000</span></div>
    </div>
    <footer className="panel-footer">
      {onDelete && <button type="button" className="btn fn-icon delete-icon" onClick={onDelete} aria-label="Delete note" title="Delete note"><Trash2 size={18} /></button>}
      <span className="footer-spacer" />
      <button className="btn fn-btn secondary-btn" type="button" onClick={onClose}>Cancel</button><button className="btn fn-btn primary-btn" type="submit">Save note</button>
    </footer>
  </form>;
}

export function NoteReader({ note, owner }: { note: Note; owner?: Person }) {
  return <div className="panel-body reader-body">
    <div className="panel-caption"><ShieldCheck size={15} /> Read-only admin view</div>
    <div className="reader-meta"><CategoryTag category={note.category} /><span><CalendarDays size={15} />{formatDate(note.updatedAt, true)}</span></div>
    <div className="reader-owner"><Avatar person={owner} size="small" /><span>Owned by <strong>{owner?.name ?? 'Former member'}</strong></span></div>
    <div className="reader-copy">{note.body || <span className="muted">No content yet.</span>}</div>
  </div>;
}

export function PostEditor({ onSave, onClose }: { onSave: (data: PostDraft) => void; onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) { setError('Add a title and some text before publishing.'); return; }
    onSave({ title: title.trim(), body: body.trim() });
  }
  return <form className="panel-form" onSubmit={submit}>
    <div className="panel-body editor-body">
      <div className="panel-caption"><Globe2 size={16} /> Everyone can read this post once it’s published.</div>
      <label className="form-field"><span>Title</span><input className="input text-control editor-title" data-initial-focus required maxLength={100} value={title} placeholder="Add a title" onChange={e => { setTitle(e.target.value); setError(''); }} /></label>
      <label className="form-field body-field"><span>Post</span><textarea className="textarea text-control" placeholder="Share something worth passing along…" value={body} maxLength={10000} required onChange={e => { setBody(e.target.value); setError(''); }} /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="editor-bottom"><span /><span className="muted">{body.length.toLocaleString('en-US')} / 10,000</span></div>
    </div>
    <footer className="panel-footer"><button className="btn fn-btn secondary-btn" type="button" onClick={onClose}>Cancel</button><button className="btn fn-btn primary-btn" type="submit">Publish post</button></footer>
  </form>;
}

export function PostReader({ post, author, onAuthor }: { post: Post; author?: Person; onAuthor: () => void }) {
  return <div className="panel-body reader-body">
    <div className="panel-caption"><Globe2 size={16} /> Public post</div>
    <div className="reader-byline"><Avatar person={author} /><div><strong>{author?.name ?? 'Former member'}</strong><time dateTime={post.publishedAt}>{formatDate(post.publishedAt, true)}</time></div></div>
    <div className="reader-copy">{post.body}</div>
    {!!author && <button type="button" className="btn text-btn" onClick={onAuthor}>More posts by {author.name.split(' ')[0]} <ArrowRight size={15} /></button>}
  </div>;
}

export function PersonEditor({ person, people, canChangeRole, isSelf, onSave, onClose }: { person?: Person; people: Person[]; canChangeRole: boolean; isSelf?: boolean; onSave: (data: PersonDraft) => void; onClose: () => void }) {
  const fieldId = useId();
  const [name, setName] = useState(person?.name ?? '');
  const [email, setEmail] = useState(person?.email ?? '');
  const [role, setRole] = useState<Role>(person?.role ?? 'member');
  const [interests, setInterests] = useState(person?.interests.join(', ') ?? '');
  const [error, setError] = useState('');
  function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) { setError('A name and email are required.'); return; }
    if (people.some(p => p.id !== person?.id && p.email.toLowerCase() === email.trim().toLowerCase())) { setError('This email already belongs to a workspace user.'); return; }
    onSave({ name: compactText(name), email: email.trim().toLowerCase(), role, interests: cleanInterests(interests) });
  }
  return <form className="panel-form" onSubmit={submit}>
    <div className="panel-body editor-body">
      {person && <div className="person-edit-avatar"><Avatar size="large" person={person} /><RoleBadge role={person.role} /></div>}
      <label className="form-field"><span>Full name</span><input className="input text-control" data-initial-focus value={name} onChange={e => { setName(e.target.value); setError(''); }} placeholder="e.g. Casey Lee" required maxLength={70} /></label>
      <label className="form-field"><span>Email address</span><input className="input text-control" type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} placeholder="casey@example.com" required maxLength={140} /></label>
      {canChangeRole && <div className="form-field"><label htmlFor={`${fieldId}-role`}>Role</label><select id={`${fieldId}-role`} aria-describedby={`${fieldId}-role-help`} className="select text-control" value={role} onChange={e => setRole(e.target.value as Role)}><option value="member">Member</option><option value="admin">Administrator</option></select><small id={`${fieldId}-role-help`}>Administrators can manage users and read all notes.</small></div>}
      <div className="form-field"><label htmlFor={`${fieldId}-interests`}>Interests</label><input id={`${fieldId}-interests`} aria-describedby={`${fieldId}-interests-help`} className="input text-control" value={interests} onChange={e => setInterests(e.target.value)} placeholder="e.g. Reading, Chess, Photography" maxLength={320} /><small id={`${fieldId}-interests-help`}>Separate up to 10 interests with commas.</small></div>
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
    <footer className="panel-footer"><button className="btn fn-btn secondary-btn" type="button" onClick={onClose}>Cancel</button><button className="btn fn-btn primary-btn" type="submit">{person ? isSelf ? 'Save profile' : 'Save changes' : 'Add user'}</button></footer>
  </form>;
}

export function PersonReader({ person, count, onPosts }: { person: Person; count: number; onPosts: () => void }) {
  return <div className="panel-body reader-body">
    <div className="reader-byline"><Avatar person={person} size="large" /><div><strong>{person.name}</strong><span>{person.email}</span></div><RoleBadge role={person.role} /></div>
    <div className="profile-interest-block"><h3>Interests</h3>{person.interests.length ? <div className="interest-tags">{person.interests.map(i => <span className="badge interest-tag" key={i}>{i}</span>)}</div> : <p>No interests added yet.</p>}</div>
    <div className="profile-joined"><CalendarDays size={16} />Joined <time dateTime={person.joined}>{formatDate(person.joined, true)}</time></div>
    <button className="btn fn-btn secondary-btn" type="button" onClick={onPosts}><Globe2 size={16} /> View public posts ({count}) <ArrowRight size={15} /></button>
  </div>;
}

export function GroupReader({ group, onPerson }: { group: InterestGroup; onPerson: (person: Person) => void }) {
  const [page, setPage] = useState(1);
  const size = 6;
  const current = Math.min(page, Math.max(1, Math.ceil(group.members.length / size)));
  return <div className="panel-body group-reader">
    <div className="panel-caption"><UsersRound size={16} /> {group.members.length} {group.members.length === 1 ? 'person shares' : 'people share'} this interest.</div>
    {group.members.slice((current - 1) * size, current * size).map(p => <button className="group-member" type="button" key={p.id} onClick={() => onPerson(p)}><Avatar person={p} /><span><strong>{p.name}</strong><small>{p.email}</small></span><ChevronRight size={17} /></button>)}
    <Pagination page={current} pageSize={size} total={group.members.length} noun="member" onPage={setPage} />
  </div>;
}

export function ConfirmPanel({ text, action, onConfirm, onClose }: { text: string; action: string; onConfirm: () => void; onClose: () => void }) {
  return <><div className="panel-body confirm-body"><div className="confirm-icon"><Trash2 size={22} strokeWidth={1.7} /></div><p>{text}</p></div>
    <footer className="panel-footer"><button className="btn fn-btn secondary-btn" data-initial-focus type="button" onClick={onClose}>Cancel</button><button className="btn fn-btn danger-btn" type="button" onClick={onConfirm}>{action}</button></footer></>;
}

export function WorkspaceGuide() {
  return <div className="panel-body guide-body">
    <div><span className="guide-icon"><LockKeyhole size={18} /></span><div><h3>Private notes and public posts</h3><p>Members can edit only their own notes. Administrators can read everyone’s notes. Public posts are visible to anyone in the demo feed.</p></div></div>
    <div><span className="guide-icon"><Search size={18} /></span><div><h3>Quick search</h3><p>Press <kbd className="kbd fn-key">⌘</kbd> or <kbd className="kbd fn-key">Ctrl</kbd> with <kbd className="kbd fn-key">K</kbd> to search from any workspace page.</p></div></div>
    <div><span className="guide-icon"><UserRound size={18} /></span><div><h3>Try both roles</h3><p>Use the account menu to switch demo roles. The two demo accounts can’t be removed. This prototype stores data in your browser, not on a server.</p></div></div>
  </div>;
}

type Result = { id: string; title: string; detail: string; icon: typeof FileText; run: () => void };
export function QuickSearch({ notes, posts, people, onNote, onPost, onPerson }: { notes: Note[]; posts: Post[]; people: Person[]; onNote: (note: Note) => void; onPost: (post: Post) => void; onPerson: (person: Person) => void }) {
  const [query, setQuery] = useState('');
  const resultsRef = useRef<HTMLDivElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const sortedNotes = [...notes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const noteResults: Result[] = sortedNotes.filter(n => matches(query, n.title, n.category, n.body)).slice(0, query.trim() ? 5 : 4).map(n => ({ id: n.id, title: n.title, detail: n.category, icon: FileText, run: () => onNote(n) }));
  const postResults: Result[] = query.trim() ? posts.filter(p => matches(query, p.title, p.body)).slice(0, 5).map(p => ({ id: p.id, title: p.title, detail: 'Public post', icon: Globe2, run: () => onPost(p) })) : [];
  const peopleResults: Result[] = query.trim() ? people.filter(p => matches(query, p.name, p.email, ...p.interests)).slice(0, 5).map(p => ({ id: p.id, title: p.name, detail: p.email, icon: UserRound, run: () => onPerson(p) })) : [];
  const sections = [{ label: query.trim() ? 'YOUR NOTES' : 'RECENT NOTES', items: noteResults }, { label: 'PUBLIC POSTS', items: postResults }, { label: 'PEOPLE', items: peopleResults }];
  const flat = sections.flatMap(s => s.items);
  return <div className="search-dialog-body">
    <label className="input search-dialog-field"><Search size={21} strokeWidth={1.7} /><input data-initial-focus ref={searchInput} type="search" aria-label="Search workspace" value={query} placeholder={people.length ? "Search notes, posts, or people…" : "Search notes and public posts…"} onChange={e => setQuery(e.target.value)} onKeyDown={e => {
      if (e.key === 'Enter' && flat.length > 0) { e.preventDefault(); flat[0].run(); }
      if (e.key === 'ArrowDown') { e.preventDefault(); resultsRef.current?.querySelector('button')?.focus(); }
    }} /></label>
    <div className="search-results" ref={resultsRef} onKeyDown={e => {
      if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
      const buttons = Array.from(resultsRef.current?.querySelectorAll('button') ?? []);
      const from = buttons.indexOf(document.activeElement as HTMLButtonElement);
      if (from < 0) return;
      e.preventDefault();
      if (from === 0 && e.key === 'ArrowUp') searchInput.current?.focus();
      else buttons[from + (e.key === 'ArrowUp' ? -1 : 1)]?.focus();
    }}>
      {sections.filter(s => s.items.length > 0).map(s => <div key={s.label} className="search-section"><p>{s.label}</p>{s.items.map(r => <button type="button" key={r.id} onClick={r.run}><span className="result-icon"><r.icon size={17} strokeWidth={1.7} /></span><span className="result-title"><strong>{r.title}</strong><small>{r.detail}</small></span><ChevronRight size={16} className="result-arrow" /></button>)}</div>)}
      {!flat.length && <p className="search-empty">{query.trim() ? `No matches for “${query.trim()}”.` : 'Search for a note or post to get started.'}</p>}
    </div>
    <div className="search-hints"><span><kbd className="kbd fn-key">↑</kbd> <kbd className="kbd fn-key">↓</kbd> Navigate</span><span><kbd className="kbd fn-key">↵</kbd> Open</span><span><kbd className="kbd fn-key">Esc</kbd> Close</span></div>
  </div>;
}
