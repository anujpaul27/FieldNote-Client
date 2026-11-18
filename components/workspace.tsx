'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { ArrowLeft, ArrowLeftRight, CheckCircle2, ChevronRight, ChevronsUpDown, CircleHelp, Files, Globe2, LayoutGrid, LockKeyhole, LogOut, Menu, NotebookPen, Search, ShieldCheck, Sprout, UserRound, UsersRound, X, type LucideIcon } from 'lucide-react';
import { ADMIN_ID, LAYOUT_KEY, MEMBER_ID, SESSION_KEY, STORAGE_KEY, adminRoutes, makeId, roleLabel, sections, seed, tones, type Note, type Person, type Post, type Route, type Workspace } from '@/lib/workspace';
import { ActionMenu, Avatar, BlankState, Brand, Heading, Overlay, type Action } from './ui';
import { NotesView, type NoteLayout } from './notes';
import { AllNotesView, getInterestGroups, InterestsView, PeopleView, PostsView, ProfileView, SignInView } from './views';
import { ConfirmPanel, GroupReader, NoteEditor, NoteReader, PersonEditor, PersonReader, PostEditor, PostReader, QuickSearch, WorkspaceGuide, type NoteDraft, type PersonDraft, type PostDraft } from './panels';

type Panel = { type: 'note'; id?: string }
  | { type: 'read-note'; id: string }
  | { type: 'delete-note'; id: string }
  | { type: 'post'; id?: string }
  | { type: 'person'; id: string }
  | { type: 'edit-person'; id?: string; self?: boolean }
  | { type: 'delete-person'; id: string }
  | { type: 'group'; id: string }
  | { type: 'search' }
  | { type: 'help' };

const navItems: { href: Route; icon: LucideIcon }[] = [{ href: '/', icon: NotebookPen }, { href: '/posts', icon: Globe2 }];
const adminItems: { href: Route; icon: LucideIcon }[] = [{ href: '/people', icon: UsersRound }, { href: '/all-notes', icon: Files }, { href: '/interests', icon: Sprout }];

function Sidebar({ active, person, notesCount, drawer, onCloseDrawer, onNav, accountActions }: {
  active: Route; person: Person; notesCount: number; drawer: boolean; onCloseDrawer: () => void; onNav: (href: Route) => void; accountActions: Action[];
}) {
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (drawer) close.current?.focus(); }, [drawer]);
  const link = ({href, icon: Icon}: { href: Route; icon: LucideIcon }) => <Link key={href} href={href} className={`side-link ${active === href ? 'active-link' : ''}`} aria-current={active === href ? 'page' : undefined} onClick={() => onNav(href)}>
    <Icon size={18} strokeWidth={1.7} aria-hidden="true" /><span>{sections[href]}</span>{href === '/' && <span className="nav-count">{notesCount}</span>}
  </Link>;
  return <aside className={`sidebar ${drawer ? 'sidebar-open' : ''}`} id="workspace-navigation">
    <div className="side-brand-row"><Link href="/" onClick={() => onNav('/')} aria-label="Fieldnote home"><Brand /></Link><button type="button" ref={close} className="btn fn-icon mobile-close" aria-label="Close navigation" onClick={onCloseDrawer}><X size={22} /></button></div>
    <nav className="side-navigation" aria-label="Workspace navigation">
      <div className="nav-group"><p className="nav-label">Workspace</p>{navItems.map(link)}</div>
      {person.role === 'admin' && <div className="nav-group admin-nav"><p className="nav-label">Administration</p>{adminItems.map(link)}</div>}
    </nav>
    <div className="side-bottom">
      <div className="private-card"><span className="private-icon"><LockKeyhole size={16} strokeWidth={1.65} /></span><div><strong>Private by default</strong><p>Notes stay off the public feed.</p></div></div>
      <div className="side-account">
        <ActionMenu label={`${person.name} account menu`} className="btn account-trigger" up entries={accountActions} trigger={<><Avatar person={person} /><span className="account-name"><strong>{person.name}</strong><small>{roleLabel(person.role)}</small></span><ChevronsUpDown size={15} strokeWidth={1.65} className="account-chevron" /></>} />
      </div>
    </div>
  </aside>;
}

function Topbar({ active, shortcut, drawer, onDrawer, onSearch, onHelp }: { active: Route; shortcut: string; drawer: boolean; onDrawer: () => void; onSearch: () => void; onHelp: () => void }) {
  return <header className="topbar">
    <div className="crumb-block">
      <button type="button" className="btn fn-icon mobile-nav-trigger" aria-label="Open navigation" aria-controls="workspace-navigation" aria-expanded={drawer} onClick={onDrawer}><Menu size={22} strokeWidth={1.8} /></button>
      <nav className="breadcrumbs fn-breadcrumbs" aria-label="Breadcrumb">
        <span className="crumb-home"><LayoutGrid size={15} strokeWidth={1.7} />Workspace</span><ChevronRight size={13} className="crumb-chevron" aria-hidden="true" /><span aria-current="page">{sections[active]}</span>
      </nav>
    </div>
    <div className="topbar-controls">
      <button className="btn quick-search-trigger" type="button" aria-label="Quick search" onClick={onSearch}><Search size={16} strokeWidth={1.8} /><span className="quick-label">Search workspace</span><kbd className="kbd fn-key">{shortcut} K</kbd></button>
      <span className="topbar-divider" />
      <button className="btn fn-icon help-trigger" type="button" onClick={onHelp} aria-label="Workspace guide" title="Workspace guide"><CircleHelp size={19} strokeWidth={1.7} /></button>
    </div>
  </header>;
}

export function FieldnoteApp() {
  const pathname = usePathname() ?? '/';
  const knownRoute = Object.hasOwn(sections, pathname);
  const route: Route = knownRoute ? pathname as Route : '/';
  const router = useRouter();
  const [data, setData] = useState<Workspace>(seed);
  const [session, setSession] = useState<string | null>(ADMIN_ID);
  const [layout, setLayout] = useState<NoteLayout>('grid');
  const [ready, setReady] = useState(false);
  const [panel, setPanel] = useState<Panel | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [author, setAuthor] = useState('');
  const [shortcut, setShortcut] = useState('Ctrl');
  const [feedback, setFeedback] = useState<{id: number; text: string} | null>(null);
  const activeUser = data.people.find(p => p.id === session);
  const isAdmin = activeUser?.role === 'admin';
  const myNotes = activeUser ? data.notes.filter(n => n.ownerId === activeUser.id) : [];
  const groups = useMemo(() => isAdmin ? getInterestGroups(data.people) : [], [isAdmin, data.people]);
  const closePanel = useCallback(() => setPanel(null), []);
  const closeDrawer = useCallback(() => {
    setDrawer(false);
    requestAnimationFrame(() => document.querySelector<HTMLButtonElement>('.mobile-nav-trigger')?.focus({preventScroll: true}));
  }, []);
  const notify = (text: string) => setFeedback({id: Date.now(), text});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const restored = JSON.parse(raw) as Workspace;
        if (Array.isArray(restored.people) && Array.isArray(restored.notes) && Array.isArray(restored.posts)) setData(restored);
      }
      const savedUser = localStorage.getItem(SESSION_KEY);
      if (savedUser) setSession(savedUser === 'signed-out' ? null : savedUser);
      const savedLayout = localStorage.getItem(LAYOUT_KEY);
      if (savedLayout === 'grid' || savedLayout === 'list') setLayout(savedLayout);
    } catch { /* The demo still works without browser storage. */ }
    if (/Mac|iPhone|iPad/i.test(navigator.platform)) setShortcut('⌘');
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem(SESSION_KEY, session ?? 'signed-out');
      localStorage.setItem(LAYOUT_KEY, layout);
    } catch { /* Storage may be blocked or full. */ }
  }, [data, session, layout, ready]);
  useEffect(() => { document.title = `Fieldnote — ${activeUser || route === '/posts' ? sections[route] : 'Sign in'}`; }, [route, activeUser]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [route, session]);
  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 900px)');
    const onResize = () => { if (!mobile.matches) setDrawer(false); };
    mobile.addEventListener('change', onResize);
    return () => mobile.removeEventListener('change', onResize);
  }, []);
  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 3400);
    return () => clearTimeout(timer);
  }, [feedback]);
  useEffect(() => {
    function keys(e: KeyboardEvent) {
      if (e.key === 'Escape' && drawer && !panel) closeDrawer();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k' && activeUser && route !== '/sign-in' && (!panel || panel.type === 'search')) {
        e.preventDefault();
        setDrawer(false);
        setPanel(panel?.type === 'search' ? null : {type: 'search'});
      }
    }
    window.addEventListener('keydown', keys);
    return () => window.removeEventListener('keydown', keys);
  }, [activeUser, route, drawer, panel, closeDrawer]);
  useEffect(() => {
    const onBack = () => { closePanel(); setDrawer(false); };
    window.addEventListener('popstate', onBack);
    return () => window.removeEventListener('popstate', onBack);
  }, [closePanel]);

  function navigate(href: Route) {
    if (href === '/posts') setAuthor('');
    setDrawer(false);
    closePanel();
  }
  function setDemo(id: string) {
    if (!data.people.some(p => p.id === id)) return;
    setSession(id); setDrawer(false); closePanel(); setAuthor('');
    router.push('/');
    notify(`Switched to ${data.people.find(p => p.id === id)?.name ?? 'demo account'}`);
  }
  function signOut() {
    setSession(null); closePanel(); setDrawer(false); setFeedback(null); router.push('/sign-in');
  }
  function viewAuthor(id: string) {
    setAuthor(id); closePanel(); router.push('/posts');
  }
  function saveNote(draft: NoteDraft, note?: Note) {
    if (!activeUser || (note && note.ownerId !== activeUser.id)) return;
    const date = new Date().toISOString();
    setData(prev => ({...prev, notes: note ? prev.notes.map(n => n.id === note.id ? {...n, ...draft, updatedAt: date} : n) : [{...draft, id: makeId(), ownerId: activeUser.id, createdAt: date, updatedAt: date}, ...prev.notes]}));
    closePanel(); notify(note ? 'Note updated' : 'Note created');
  }
  function pinNote(note: Note) {
    if (activeUser?.id !== note.ownerId) return;
    setData(prev => ({...prev, notes: prev.notes.map(n => n.id === note.id ? {...n, pinned: !n.pinned} : n)}));
    notify(note.pinned ? 'Note unpinned' : 'Note pinned');
  }
  function deleteNote(note: Note) {
    if (activeUser?.id !== note.ownerId) return;
    setData(prev => ({...prev, notes: prev.notes.filter(n => n.id !== note.id)}));
    closePanel(); notify('Note deleted');
  }
  function savePost(draft: PostDraft) {
    if (!activeUser) return;
    setData(prev => ({...prev, posts: [{...draft, id: makeId(), authorId: activeUser.id, publishedAt: new Date().toISOString()}, ...prev.posts]}));
    setAuthor(''); closePanel(); notify('Post published');
  }
  function savePerson(draft: PersonDraft, existing?: Person) {
    if (!activeUser || (!isAdmin && existing?.id !== activeUser.id)) return;
    if (data.people.some(p => p.id !== existing?.id && p.email.toLowerCase() === draft.email.toLowerCase())) return;
    const roleLocked = existing?.id === ADMIN_ID || existing?.id === MEMBER_ID || existing?.id === activeUser.id;
    const record: Person = existing ? {...existing, ...draft, role: roleLocked ? existing.role : draft.role} : {...draft, id: makeId(), tone: tones[data.people.length % tones.length], joined: new Date().toISOString()};
    setData(prev => ({...prev, people: existing ? prev.people.map(p => p.id === existing.id ? record : p) : [record, ...prev.people]}));
    closePanel(); notify(existing ? 'Profile updated' : 'User added');
  }
  function deletePerson(person: Person) {
    if (!isAdmin || person.id === activeUser?.id || person.id === ADMIN_ID || person.id === MEMBER_ID) return;
    setData(prev => ({people: prev.people.filter(p => p.id !== person.id), notes: prev.notes.filter(n => n.ownerId !== person.id), posts: prev.posts.filter(p => p.authorId !== person.id)}));
    closePanel(); notify('User removed');
  }

  if (!knownRoute) return null;
  if (!activeUser && route === '/posts') {
    const post = panel?.type === 'post' ? data.posts.find(p => p.id === panel.id) : undefined;
    return <MotionConfig reducedMotion="user">
      <div data-workspace-content>
        <header className="guest-header"><Link href="/sign-in" aria-label="Fieldnote sign in"><Brand /></Link><Link className="btn fn-btn guest-signin" href="/sign-in">Sign in</Link></header>
        <main className="main-content guest-content"><PostsView posts={data.posts} people={data.people} author={author} onAuthor={setAuthor} onOpen={p => setPanel({type: 'post', id: p.id})} /></main>
      </div>
      <Overlay open={!!post} kind="sheet" title={post?.title ?? ''} eyebrow="PUBLIC POSTS" onClose={closePanel}>{post && <PostReader post={post} author={data.people.find(p => p.id === post.authorId)} onAuthor={() => viewAuthor(post.authorId)} />}</Overlay>
    </MotionConfig>;
  }
  if (!activeUser || route === '/sign-in') return <MotionConfig reducedMotion="user"><SignInView people={data.people} onSignIn={setDemo} /></MotionConfig>;
  const blocked = adminRoutes.includes(route) && !isAdmin;
  const otherAccount = activeUser.id === ADMIN_ID ? MEMBER_ID : ADMIN_ID;
  const canSwitch = data.people.some(p => p.id === otherAccount);
  const accountActions: Action[] = [
    {label: 'My profile', icon: UserRound, onClick: () => { navigate('/profile'); router.push('/profile'); }},
    ...(canSwitch ? [{label: `Try the ${otherAccount === MEMBER_ID ? 'member' : 'admin'} view`, icon: ArrowLeftRight, onClick: () => setDemo(otherAccount)}] : []),
    {label: 'Sign out', icon: LogOut, onClick: signOut},
  ];

  let view: ReactNode;
  if (blocked) view = <><Heading title="Access restricted" eyebrow="PRIVATE WORKSPACE" description="This page is only available to workspace administrators." /><div className="subpage-content"><BlankState icon={ShieldCheck} title="Administrator access needed" description="You can still read and edit your own notes and browse the public feed." action={<Link className="btn fn-btn secondary-btn" href="/"><ArrowLeft size={16} />Back to my notes</Link>} /></div></>;
  else switch (route) {
    case '/posts': view = <PostsView posts={data.posts} people={data.people} author={author} onAuthor={setAuthor} onNew={() => setPanel({type: 'post'})} onOpen={p => setPanel({type: 'post', id: p.id})} />; break;
    case '/people': view = <PeopleView people={data.people} currentUser={activeUser} onNew={() => setPanel({type: 'edit-person'})} onRead={p => setPanel({type: 'person', id: p.id})} onEdit={p => setPanel({type: 'edit-person', id: p.id})} onDelete={p => setPanel({type: 'delete-person', id: p.id})} />; break;
    case '/all-notes': view = <AllNotesView notes={data.notes} people={data.people} onOpen={n => setPanel({type: 'read-note', id: n.id})} />; break;
    case '/interests': view = <InterestsView groups={groups} onGroup={g => setPanel({type: 'group', id: g.key})} />; break;
    case '/profile': view = <ProfileView person={activeUser} noteCount={myNotes.length} postCount={data.posts.filter(p => p.authorId === activeUser.id).length} onEdit={() => setPanel({type: 'edit-person', id: activeUser.id, self: true})} onPosts={() => viewAuthor(activeUser.id)} onSignOut={signOut} onSwitch={() => setDemo(otherAccount)} canSwitch={canSwitch} />; break;
    default: view = <NotesView notes={myNotes} layout={layout} setLayout={setLayout} onNew={() => setPanel({type: 'note'})} onOpen={n => setPanel({type: 'note', id: n.id})} onPin={pinNote} onDelete={n => setPanel({type: 'delete-note', id: n.id})} />;
  }

  let panelTitle = '';
  let panelEyebrow = '';
  let panelKind: 'sheet' | 'dialog' | 'search' = 'sheet';
  let panelContent: ReactNode;
  if (panel) switch (panel.type) {
    case 'note': {
      const note = panel.id ? myNotes.find(n => n.id === panel.id) : undefined;
      if (panel.id && !note) break;
      panelTitle = note ? 'Edit note' : 'New note'; panelEyebrow = 'MY NOTES';
      panelContent = <NoteEditor key={note?.id ?? 'new'} note={note} onSave={draft => saveNote(draft, note)} onClose={closePanel} onDelete={note ? () => setPanel({type: 'delete-note', id: note.id}) : undefined} />;
      break;
    }
    case 'read-note': {
      const note = isAdmin ? data.notes.find(n => n.id === panel.id) : undefined;
      if (!note) break;
      panelTitle = note.title; panelEyebrow = 'WORKSPACE NOTE';
      panelContent = <NoteReader note={note} owner={data.people.find(p => p.id === note.ownerId)} />;
      break;
    }
    case 'delete-note': {
      const note = myNotes.find(n => n.id === panel.id);
      if (!note) break;
      panelTitle = 'Delete note?'; panelKind = 'dialog';
      panelContent = <ConfirmPanel text={`“${note.title}” will be permanently removed from your library.`} action="Delete note" onConfirm={() => deleteNote(note)} onClose={closePanel} />;
      break;
    }
    case 'post': {
      const post = panel.id ? data.posts.find(p => p.id === panel.id) : undefined;
      if (panel.id && !post) break;
      panelTitle = post ? post.title : 'Write a post'; panelEyebrow = 'PUBLIC POSTS';
      panelContent = post ? <PostReader post={post} author={data.people.find(p => p.id === post.authorId)} onAuthor={() => viewAuthor(post.authorId)} /> : <PostEditor onSave={savePost} onClose={closePanel} />;
      break;
    }
    case 'person': {
      const person = isAdmin ? data.people.find(p => p.id === panel.id) : undefined;
      if (!person) break;
      panelTitle = 'User profile'; panelEyebrow = 'PEOPLE';
      panelContent = <PersonReader person={person} count={data.posts.filter(p => p.authorId === person.id).length} onPosts={() => viewAuthor(person.id)} />;
      break;
    }
    case 'edit-person': {
      const person = panel.id ? data.people.find(p => p.id === panel.id) : undefined;
      if ((!isAdmin && person?.id !== activeUser.id) || (panel.id && !person)) break;
      const locked = person && (person.id === activeUser.id || person.id === ADMIN_ID || person.id === MEMBER_ID);
      panelTitle = person ? panel.self ? 'Edit profile' : 'Edit user' : 'Add user'; panelEyebrow = panel.self ? 'MY PROFILE' : 'PEOPLE';
      panelContent = <PersonEditor key={person?.id ?? 'new'} person={person} people={data.people} canChangeRole={isAdmin && !locked} isSelf={panel.self} onSave={draft => savePerson(draft, person)} onClose={closePanel} />;
      break;
    }
    case 'delete-person': {
      const person = isAdmin ? data.people.find(p => p.id === panel.id) : undefined;
      if (!person) break;
      panelTitle = 'Remove user?'; panelKind = 'dialog';
      panelContent = <ConfirmPanel text={`${person.name} will be removed from this demo workspace, along with their notes and public posts.`} action="Remove user" onConfirm={() => deletePerson(person)} onClose={closePanel} />;
      break;
    }
    case 'group': {
      const group = groups.find(g => g.key === panel.id);
      if (!group) break;
      panelTitle = group.name; panelEyebrow = 'INTEREST GROUP';
      panelContent = <GroupReader key={group.key} group={group} onPerson={p => setPanel({type: 'person', id: p.id})} />;
      break;
    }
    case 'search': panelTitle = 'Quick search'; panelKind = 'search'; panelContent = <QuickSearch notes={myNotes} posts={data.posts} people={isAdmin ? data.people : []} onNote={n => setPanel({type: 'note', id: n.id})} onPost={p => setPanel({type: 'post', id: p.id})} onPerson={p => setPanel({type: 'person', id: p.id})} />; break;
    case 'help': panelTitle = 'Workspace guide'; panelKind = 'dialog'; panelContent = <WorkspaceGuide />; break;
  }
  return <MotionConfig reducedMotion="user">
    <div className="app-shell" data-workspace-content>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Sidebar active={route} person={activeUser} notesCount={myNotes.length} drawer={drawer} onCloseDrawer={closeDrawer} onNav={navigate} accountActions={accountActions} />
      <AnimatePresence>{drawer && <motion.button type="button" aria-label="Dismiss navigation" className="drawer-scrim" onClick={closeDrawer} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} />}</AnimatePresence>
      <div className="stage" inert={drawer ? true : undefined}>
        <Topbar active={route} shortcut={shortcut} drawer={drawer} onDrawer={() => setDrawer(!drawer)} onSearch={() => setPanel({type: 'search'})} onHelp={() => setPanel({type: 'help'})} />
        <main key={`${route}-${activeUser.id}`} id="main-content" className="main-content" tabIndex={-1}>{view}</main>
      </div>
    </div>
    <Overlay open={Boolean(panel && panelTitle)} kind={panelKind} title={panelTitle} eyebrow={panelEyebrow} onClose={closePanel}>{panelContent}</Overlay>
    <div className="toast toast-end fn-toast" role="status" aria-live="polite">
      <AnimatePresence>{feedback && <motion.div key={feedback.id} className="fn-toast-item" initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 7 }} transition={{ duration: 0.18 }}><CheckCircle2 size={19} /><span>{feedback.text}</span><button type="button" className="btn fn-icon" onClick={() => setFeedback(null)} aria-label="Dismiss message"><X size={16} /></button></motion.div>}</AnimatePresence>
    </div>
  </MotionConfig>;
}
