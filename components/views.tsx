'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Aperture, ArrowRight, BookOpen, CalendarDays, ChevronRight, CookingPot, Eye, FileText, Globe2, LayoutGrid, LockKeyhole, Mountain, Paintbrush, PenLine, Plus, Puzzle, ShieldCheck, Sprout, SquarePen, Trash2, UsersRound } from 'lucide-react';
import { ADMIN_ID, MEMBER_ID, categories, compactText, formatDate, matches, roleLabel, type Note, type Person, type Post } from '@/lib/workspace';
import { Avatar, BlankState, Brand, CategoryIcon, CategoryTag, FilterField, Heading, Pagination, RoleBadge, SelectField } from './ui';

const peopleSize = 6;
const notesSize = 7;
const postsSize = 6;
const groupsSize = 6;

export function PostsView({ posts, people, author, onAuthor, onNew, onOpen }: { posts: Post[]; people: Person[]; author: string; onAuthor: (id: string) => void; onNew?: () => void; onOpen: (post: Post) => void }) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const filtered = posts.filter(p => (!author || p.authorId === author) && matches(query, p.title, p.body, people.find(x => x.id === p.authorId)?.name ?? '')).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const current = Math.min(page, Math.max(1, Math.ceil(filtered.length / postsSize)));
  const shown = filtered.slice((current - 1) * postsSize, current * postsSize);
  return <>
    <Heading title="Public posts" eyebrow="COMMUNITY" description={onNew ? "Read what people are sharing, or publish something of your own." : "Read what people are sharing in the Fieldnote community."} action={onNew && <button className="btn fn-btn primary-btn" type="button" onClick={() => { setPage(1); onAuthor(''); setQuery(''); onNew(); }}><PenLine size={17} />Write post</button>} />
    <section className="subpage-content">
      <div className="info-strip"><Globe2 size={18} strokeWidth={1.7} /><p><strong>Open to everyone.</strong> {onNew ? "Posts are public. Your private notes stay in My notes." : "You don’t need an account to read these posts."}</p></div>
      <div className="data-toolbar">
        <div className="library-heading"><h2>Public feed</h2><span className="badge count-badge">{filtered.length} {filtered.length === 1 ? 'post' : 'posts'}</span></div>
        <div className="data-filters"><FilterField value={query} onChange={v => { setQuery(v); setPage(1); }} label="Search posts" placeholder="Search posts…" />
          <SelectField label="Filter by author" value={author} onChange={v => { onAuthor(v); setPage(1); }} options={[{value: '', label: 'All authors'}, ...people.map(p => ({ value: p.id, label: p.name }))]} />
        </div>
      </div>
      {shown.length ? <>
        <div className="posts-grid">
          {shown.map(p => {
            const person = people.find(x => x.id === p.authorId);
            return <motion.article className="card post-card" key={p.id} whileHover={{ y: -2 }} transition={{ duration: 0.16 }}>
              <div className="post-meta"><button className="post-author" type="button" title="Filter posts by this author" onClick={() => { onAuthor(p.authorId); setPage(1); }}><Avatar person={person} size="small" /><span>{person?.name ?? 'Former member'}</span></button><time dateTime={p.publishedAt}>{formatDate(p.publishedAt)}</time></div>
              <h3>{p.title}</h3><p>{compactText(p.body)}</p>
              <button className="btn text-btn" type="button" onClick={() => onOpen(p)} aria-label={`Read ${p.title}`}>Read post <ArrowRight size={15} /></button>
            </motion.article>;
          })}
        </div>
        <Pagination page={current} pageSize={postsSize} total={filtered.length} noun="post" onPage={setPage} />
      </> : <BlankState icon={Globe2} title="No posts found" description={query || author ? 'Try a different search or choose another author.' : 'Be the first to share something.'} action={query || author ? <button className="btn fn-btn secondary-btn" onClick={() => { onAuthor(''); setQuery(''); setPage(1); }}>Clear filters</button> : undefined} />}
    </section>
  </>;
}

export function PeopleView({ people, currentUser, onNew, onRead, onEdit, onDelete }: { people: Person[]; currentUser: Person; onNew: () => void; onRead: (p: Person) => void; onEdit: (p: Person) => void; onDelete: (p: Person) => void }) {
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const filtered = people.filter(p => (!role || p.role === role) && matches(query, p.name, p.email, ...p.interests));
  const current = Math.min(page, Math.max(1, Math.ceil(filtered.length / peopleSize)));
  const shown = filtered.slice((current - 1) * peopleSize, current * peopleSize);
  return <>
    <Heading title="People" eyebrow="ADMINISTRATION" description="Manage workspace users, roles, and profiles." action={<button className="btn fn-btn primary-btn" type="button" onClick={() => { setQuery(''); setRole(''); setPage(1); onNew(); }}><Plus size={18} />Add user</button>} />
    <section className="subpage-content">
      <div className="data-toolbar">
        <div className="library-heading"><h2>User directory</h2><span className="badge count-badge">{filtered.length} {filtered.length === 1 ? 'user' : 'users'}</span></div>
        <div className="data-filters"><FilterField value={query} onChange={v => { setQuery(v); setPage(1); }} label="Search people" placeholder="Search people…" />
          <SelectField label="Filter by role" value={role} onChange={v => { setRole(v); setPage(1); }} options={[{value: '', label: 'All roles'}, {value: 'admin', label: 'Administrator'}, {value: 'member', label: 'Member'}]} /></div>
      </div>
      {shown.length ? <>
        <div className="table-frame"><table className="table workspace-table people-table">
          <thead><tr><th scope="col">Name</th><th scope="col">Role</th><th scope="col">Interests</th><th scope="col">Joined</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>{shown.map(p => <tr key={p.id}>
            <td><button type="button" className="person-cell" onClick={() => onRead(p)} aria-label={`View ${p.name}'s profile`}><Avatar person={p} /><span><strong>{p.name}{p.id === currentUser.id && <small> (you)</small>}</strong><small>{p.email}</small></span></button></td>
            <td><RoleBadge role={p.role} /></td>
            <td><div className="interest-tags">{p.interests.length ? <>{p.interests.slice(0, 2).map(i => <span className="badge interest-tag" key={i}>{i}</span>)}{p.interests.length > 2 && <span className="badge interest-tag">+{p.interests.length - 2}</span>}</> : <span className="muted">—</span>}</div></td>
            <td><time dateTime={p.joined}>{formatDate(p.joined)}</time></td>
            <td><div className="row-actions"><button type="button" className="btn fn-icon" title="Edit user" aria-label={`Edit ${p.name}`} onClick={() => onEdit(p)}><SquarePen size={16} strokeWidth={1.65} /></button>
              {p.id !== currentUser.id && p.id !== ADMIN_ID && p.id !== MEMBER_ID && <button type="button" className="btn fn-icon row-danger" title="Remove user" aria-label={`Remove ${p.name}`} onClick={() => onDelete(p)}><Trash2 size={16} strokeWidth={1.65} /></button>}</div></td>
          </tr>)}</tbody>
        </table></div>
        <Pagination page={current} pageSize={peopleSize} total={filtered.length} noun="user" onPage={setPage} />
      </> : <BlankState icon={UsersRound} title="No matching users" description="Try another name, email, interest, or role." action={<button className="btn fn-btn secondary-btn" onClick={() => { setQuery(''); setRole(''); setPage(1); }}>Clear filters</button>} />}
    </section>
  </>;
}

export function AllNotesView({ notes, people, onOpen }: { notes: Note[]; people: Person[]; onOpen: (note: Note) => void }) {
  const [query, setQuery] = useState('');
  const [owner, setOwner] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const filtered = notes.filter(n => (!owner || n.ownerId === owner) && (!category || n.category === category) && matches(query, n.title, n.body)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const current = Math.min(page, Math.max(1, Math.ceil(filtered.length / notesSize)));
  const shown = filtered.slice((current - 1) * notesSize, current * notesSize);
  return <>
    <Heading title="All user notes" eyebrow="ADMINISTRATION" description="Browse private notes across the workspace with read-only access." />
    <section className="subpage-content">
      <div className="info-strip"><LockKeyhole size={17} strokeWidth={1.7} /><p><strong>Admin view.</strong> Only a note’s owner can edit or delete it.</p></div>
      <div className="data-toolbar">
        <div className="library-heading"><h2>Workspace notes</h2><span className="badge count-badge">{filtered.length} {filtered.length === 1 ? 'note' : 'notes'}</span></div>
        <div className="data-filters"><FilterField value={query} onChange={v => { setQuery(v); setPage(1); }} label="Search workspace notes" placeholder="Search notes…" />
          <SelectField label="Filter by owner" value={owner} onChange={v => { setOwner(v); setPage(1); }} options={[{value: '', label: 'All owners'}, ...people.map(p => ({value: p.id, label: p.name}))]} />
          <SelectField label="Filter by category" value={category} onChange={v => { setCategory(v); setPage(1); }} options={[{value: '', label: 'All categories'}, ...categories.map(c => ({value: c, label: c}))]} />
        </div>
      </div>
      {shown.length ? <>
        <div className="table-frame"><table className="table workspace-table notes-table">
          <thead><tr><th scope="col">Note</th><th scope="col">Owner</th><th scope="col">Category</th><th scope="col">Last edited</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>{shown.map(n => { const owner = people.find(p => p.id === n.ownerId); return <tr key={n.id}>
            <td><button className="table-note" onClick={() => onOpen(n)}><CategoryIcon category={n.category} /><strong>{n.title}</strong></button></td>
            <td><div className="inline-person"><Avatar person={owner} size="small" />{owner?.name ?? 'Former member'}</div></td>
            <td><CategoryTag category={n.category} /></td>
            <td><time dateTime={n.updatedAt}>{formatDate(n.updatedAt)}</time></td>
            <td><button type="button" className="btn fn-icon" title="Read note" aria-label={`Read ${n.title}`} onClick={() => onOpen(n)}><Eye size={17} strokeWidth={1.75} /></button></td>
          </tr>; })}</tbody>
        </table></div>
        <Pagination page={current} pageSize={notesSize} total={filtered.length} noun="note" onPage={setPage} />
      </> : <BlankState icon={FileText} title="No matching notes" description="Try a different search or adjust the filters." action={<button className="btn fn-btn secondary-btn" onClick={() => { setQuery(''); setOwner(''); setCategory(''); setPage(1); }}>Clear filters</button>} />}
    </section>
  </>;
}

export interface InterestGroup { key: string; name: string; members: Person[]; }
export function getInterestGroups(people: Person[]): InterestGroup[] {
  const map = new Map<string, InterestGroup>();
  for (const person of people) {
    for (const label of person.interests) {
      const key = label.toLowerCase();
      if (!map.has(key)) map.set(key, { key, name: label, members: [] });
      const entry = map.get(key)!;
      if (!entry.members.some(p => p.id === person.id)) entry.members.push(person);
    }
  }
  return [...map.values()].sort((a, b) => b.members.length - a.members.length || a.name.localeCompare(b.name));
}
const interestIcons = { design: Paintbrush, reading: BookOpen, photography: Aperture, hiking: Mountain, writing: PenLine, gardening: Sprout, cooking: CookingPot, chess: Puzzle };
const groupTones = ['olive', 'lilac', 'sand', 'fern', 'blue', 'rose'];
export function InterestsView({ groups, onGroup }: { groups: InterestGroup[]; onGroup: (group: InterestGroup) => void }) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const filtered = groups.filter(g => matches(query, g.name));
  const current = Math.min(page, Math.max(1, Math.ceil(filtered.length / groupsSize)));
  const shown = filtered.slice((current - 1) * groupsSize, current * groupsSize);
  return <>
    <Heading title="Interest groups" eyebrow="ADMINISTRATION" description="See who shares the same interests across the workspace." />
    <section className="subpage-content">
      <div className="data-toolbar"><div className="library-heading"><h2>Browse interests</h2><span className="badge count-badge">{filtered.length} {filtered.length === 1 ? 'group' : 'groups'}</span></div><FilterField value={query} onChange={v => { setQuery(v); setPage(1); }} label="Search interests" placeholder="Search interests…" /></div>
      {shown.length ? <><div className="groups-grid">
        {shown.map((g, i) => { const Icon = Object.hasOwn(interestIcons, g.key) ? interestIcons[g.key as keyof typeof interestIcons] : Sprout; return <motion.article className="card group-card" key={g.key} whileHover={{ y: -2 }} transition={{ duration: 0.16 }}>
          <div className="group-top"><span className={`group-icon tone-${groupTones[i % groupTones.length]}`}><Icon size={21} strokeWidth={1.7} /></span><span className="badge count-badge">{g.members.length} {g.members.length === 1 ? 'person' : 'people'}</span></div>
          <h3>{g.name}</h3>
          <div className="group-footer"><div className="avatar-stack" aria-hidden="true">{g.members.slice(0, 4).map(p => <Avatar key={p.id} person={p} size="small" />)}{g.members.length > 4 && <span className="avatar-overflow">+{g.members.length - 4}</span>}</div>
            <button className="btn text-btn" aria-label={`View ${g.name} group`} onClick={() => onGroup(g)}>View group <ArrowRight size={15} /></button></div>
        </motion.article>; })}
      </div><Pagination page={current} pageSize={groupsSize} total={filtered.length} noun="group" onPage={setPage} /></> : <BlankState icon={Sprout} title="No interest groups found" description="Groups appear when people add interests to their profiles." />}
    </section>
  </>;
}

export function ProfileView({ person, noteCount, postCount, onEdit, onPosts, onSignOut, onSwitch, canSwitch }: { person: Person; noteCount: number; postCount: number; onEdit: () => void; onPosts: () => void; onSignOut: () => void; onSwitch: () => void; canSwitch: boolean }) {
  return <>
    <Heading title="My profile" eyebrow="PERSONAL WORKSPACE" description="Manage your details and the interests attached to your profile." action={<button className="btn fn-btn primary-btn" onClick={onEdit}><SquarePen size={16} />Edit profile</button>} />
    <div className="profile-layout subpage-content">
      <section className="card profile-card" aria-labelledby="profile-name">
        <div className="profile-top"><Avatar person={person} size="hero" /><div><h2 id="profile-name">{person.name}</h2><p>{person.email}</p></div><RoleBadge role={person.role} /></div>
        <div className="profile-interest-block"><h3>Interests</h3>{person.interests.length ? <div className="interest-tags">{person.interests.map(i => <span className="badge interest-tag" key={i}>{i}</span>)}</div> : <p>No interests added yet.</p>}</div>
        <div className="profile-joined"><CalendarDays size={16} />Joined <time dateTime={person.joined}>{formatDate(person.joined, true)}</time></div>
      </section>
      <div className="profile-right">
        <section className="card profile-card"><h3>Workspace activity</h3><div className="profile-stats"><div><FileText size={17} /><strong>{noteCount}</strong><span>Private notes</span></div><div><Globe2 size={17} /><strong>{postCount}</strong><span>Public posts</span></div></div><button className="btn text-btn" onClick={onPosts}>View my public posts <ArrowRight size={15} /></button></section>
        <section className="card profile-card"><h3>Demo session</h3><p>This prototype saves changes in this browser only.</p><div className="profile-actions">{canSwitch && <button className="btn fn-btn secondary-btn" onClick={onSwitch}>Try the {person.id === ADMIN_ID ? 'member' : 'admin'} view</button>}<button className="btn fn-btn ghost-btn" onClick={onSignOut}>Sign out</button></div></section>
      </div>
    </div>
  </>;
}

export function SignInView({ people, onSignIn }: { people: Person[]; onSignIn: (id: string) => void }) {
  const accounts = [ADMIN_ID, MEMBER_ID].map(id => people.find(p => p.id === id)).filter((p): p is Person => Boolean(p));
  return <main className="signin-layout">
    <div className="signin-art"><Brand /><div className="signin-art-text"><p className="fern-eyebrow"><Sprout size={15} /> THE FIELD JOURNAL</p><h2>A little room to <em>think.</em></h2><p>A private place for whatever’s on your mind.</p></div><div className="fern-index" aria-hidden="true"><span /> FIG. 01 &nbsp; / &nbsp; WOOD FERN</div></div>
    <div className="signin-content"><div className="signin-inner">
      <span className="signin-glyph"><LayoutGrid size={23} strokeWidth={1.7} /></span>
      <p className="eyebrow"><span className="eyebrow-dot" />FIELDNOTE WORKSPACE</p><h1>Welcome back.</h1><p>Choose a demo account to explore Fieldnote as an administrator or a member.</p>
      <div className="signin-accounts">
        {accounts.map(p => <button type="button" key={p.id} className="btn signin-account" onClick={() => onSignIn(p.id)}>
          <Avatar person={p} size="large" /><span><strong>{p.name}</strong><small>{roleLabel(p.role)}</small></span><ChevronRight size={19} className="signin-arrow" />
        </button>)}
      </div>
      <div className="auth-switch">Have an email and password? <Link href="/login">Log in</Link><span aria-hidden="true"> · </span>New here? <Link href="/register">Create an account</Link></div>
      <div className="signin-disclaimer"><ShieldCheck size={17} />Demo only. No password or live authentication is used.</div>
      <Link href="/posts" className="btn text-btn signin-public">Browse public posts <ArrowRight size={15} /></Link>
    </div></div>
  </main>;
}
