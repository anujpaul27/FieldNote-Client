export type Role = 'admin' | 'member';
export const categories = ['Work', 'Personal', 'Ideas'] as const;
export type Category = typeof categories[number];
export type Tone = 'olive' | 'sand' | 'lilac' | 'fern' | 'rose' | 'blue';

export interface Person {
  id: string;
  name: string;
  email: string;
  role: Role;
  interests: string[];
  joined: string;
  tone: Tone;
}
export interface Note {
  id: string;
  ownerId: string;
  title: string;
  body: string;
  category: Category;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface Post {
  id: string;
  authorId: string;
  title: string;
  body: string;
  publishedAt: string;
}
export interface Workspace {
  people: Person[];
  notes: Note[];
  posts: Post[];
}

export const ADMIN_ID = 'maya';
export const MEMBER_ID = 'samira';
export const STORAGE_KEY = 'fieldnote.workspace.1';
export const SESSION_KEY = 'fieldnote.session.1';
export const LAYOUT_KEY = 'fieldnote.layout.1';
export const tones: Tone[] = ['olive', 'sand', 'lilac', 'fern', 'rose', 'blue'];
export const sections = {
  '/': 'My notes', '/posts': 'Public posts', '/people': 'People', '/all-notes': 'All user notes',
  '/interests': 'Interest groups', '/profile': 'My profile', '/sign-in': 'Sign in',
} as const;
export type Route = keyof typeof sections;
export const adminRoutes: Route[] = ['/people', '/all-notes', '/interests'];
const day = (d: string) => `${d}T12:00:00.000Z`;

const people: Person[] = [
  { id: ADMIN_ID, name: 'Maya Chen', email: 'maya@fieldnote.example', role: 'admin', interests: ['Design', 'Reading', 'Photography'], joined: day('2026-10-01'), tone: 'olive' },
  { id: MEMBER_ID, name: 'Samira Rahman', email: 'samira@fieldnote.example', role: 'member', interests: ['Gardening', 'Reading', 'Chess'], joined: day('2026-10-03'), tone: 'sand' },
  { id: 'leo', name: 'Leo Martins', email: 'leo@fieldnote.example', role: 'member', interests: ['Design', 'Hiking', 'Photography'], joined: day('2026-10-05'), tone: 'blue' },
  { id: 'nina', name: 'Nina Patel', email: 'nina@fieldnote.example', role: 'member', interests: ['Writing', 'Reading', 'Cooking'], joined: day('2026-10-06'), tone: 'lilac' },
  { id: 'jules', name: 'Jules Avery', email: 'jules@fieldnote.example', role: 'member', interests: ['Design', 'Writing', 'Chess'], joined: day('2026-10-12'), tone: 'fern' },
  { id: 'amina', name: 'Amina Khan', email: 'amina@fieldnote.example', role: 'member', interests: ['Gardening', 'Cooking'], joined: day('2026-10-16'), tone: 'rose' },
  { id: 'noah', name: 'Noah Ellis', email: 'noah@fieldnote.example', role: 'member', interests: ['Hiking', 'Photography'], joined: day('2026-10-18'), tone: 'olive' },
  { id: 'lina', name: 'Lina Park', email: 'lina@fieldnote.example', role: 'member', interests: ['Design', 'Reading'], joined: day('2026-10-22'), tone: 'lilac' },
  { id: 'arif', name: 'Arif Hasan', email: 'arif@fieldnote.example', role: 'member', interests: ['Writing', 'Chess'], joined: day('2026-10-25'), tone: 'blue' },
];

function note(id: string, title: string, body: string, category: Category, date: string, pinned = false, ownerId = ADMIN_ID): Note {
  return { id, title, body, category, pinned, ownerId, createdAt: day(date), updatedAt: day(date) };
}
const notes: Note[] = [
  note('studio', 'Studio planning', 'Focus areas, milestones, and the small things we can get right before the next review.\n\nThis week: clarify the first-run experience, check keyboard navigation, and test with someone who hasn’t seen the sketches.\n\nBring three directions to Friday’s review, then write down what we decided and why.', 'Work', '2026-11-18', true),
  note('sylhet', 'A weekend in Sylhet', 'Tea gardens in the morning, a walk by the water, and a reminder to leave some plans open.\n\nPack the small camera. Find a place to stop for tea. Leave Sunday morning free.', 'Personal', '2026-11-16', true),
  note('ideas', 'Ideas worth keeping', 'A running list of things to make, places to go, and questions to come back to later.\n\nTry a shared recipe zine. Draw a map of the neighborhood by sound. Ask what makes a space feel familiar.', 'Ideas', '2026-11-15'),
  note('reading', 'Reading notes', 'Passages to remember from this month’s books, and a few thoughts in the margins.\n\nOne thing to try: write a single sentence after each chapter instead of underlining everything.', 'Personal', '2026-11-12'),
  note('checklist', 'Design review checklist', 'Before sharing a flow, check the empty states, the button labels, and how it works with a keyboard.\n\nLook at the screen with no data and with an unusually long name. End by describing one thing you’d still like to test.', 'Work', '2026-11-10'),
  note('sunday', 'Tiny experiments', 'A collection of low-effort experiments: one sketch, one photo, or one page at a time.\n\nStart with an index card and give it ten minutes.', 'Ideas', '2026-11-08'),
  note('interviews', 'Interview questions', 'Prompts for our next round of conversations, with room for follow-up questions.\n\nWhen was the last time you tried this? What did you do first?', 'Work', '2026-11-06'),
  note('meals', 'Weeknight favorites', 'Quick dinners that don’t require a second trip to the market.\n\nGinger lentils, roast squash with yogurt, and crispy rice with whatever greens are left.', 'Personal', '2026-11-04'),
  note('paper', 'A paper prototype', 'Sketch the smallest useful version on paper before opening any design tools.', 'Ideas', '2026-11-02'),
  note('handoff', 'Project handoff', 'Decisions, open questions, and links for the next person picking this up.', 'Work', '2026-10-30'),
  note('music', 'On repeat', 'A place to remember songs, radio shows, and records friends send my way.', 'Personal', '2026-10-26'),
  note('list', 'Things to learn', 'Repair a book spine, propagate rosemary, and make a better pot of tea.', 'Ideas', '2026-10-22'),
  note('garden', 'Winter garden', 'Check which herbs can stay on the windowsill through the cooler months.', 'Personal', '2026-11-16', true, MEMBER_ID),
  note('chess', 'Chess opening notes', 'Spend less time memorizing moves and more time noticing which pieces are doing nothing.', 'Ideas', '2026-11-12', false, MEMBER_ID),
  note('s-work', 'Thursday check-in', 'Share the revised schedule and ask if there’s anything blocking the next step.', 'Work', '2026-11-08', false, MEMBER_ID),
  note('film', 'First roll of film', 'Try the side streets just before dark; keep a note of the exposure to compare later.', 'Ideas', '2026-11-13', false, 'leo'),
  note('draft', 'Newsletter draft', 'An opening about what changes when we take the slower route.', 'Work', '2026-11-09', false, 'nina'),
  note('menu', 'Dinner on Friday', 'Make the orange cake the day before so there’s one less thing to do.', 'Personal', '2026-11-05', false, 'amina'),
];

function post(id: string, authorId: string, title: string, body: string, date: string): Post {
  return { id, authorId, title, body, publishedAt: day(date) };
}
const posts: Post[] = [
  post('noticing', ADMIN_ID, 'A small practice of noticing', 'On my walk home, I’ve started picking one thing to pay attention to: doorways, plants growing in cracks, or the first light in a shop window.\n\nThe route hasn’t changed, but it feels different when I have something to look for. This week I’m looking for handwritten signs.', '2026-11-17'),
  post('balcony', MEMBER_ID, 'What’s growing on my balcony', 'The mint has taken over its pot, the first basil leaves are finally big enough to pick, and there’s a new shoot on the rosemary I thought I’d lost.\n\nI’d recommend starting with mint in its own pot. It seems happy whether I fuss over it or forget it for a few days.', '2026-11-15'),
  post('walk', 'leo', 'The long way home', 'A few things I didn’t expect to find by giving myself an extra hour and leaving my headphones at home.', '2026-11-14'),
  post('shelf', 'nina', 'Three books to pass along', 'Three books I finished lately that would be better off on someone else’s shelf than mine.', '2026-11-11'),
  post('drafts', ADMIN_ID, 'In praise of first drafts', 'The first version doesn’t have to solve everything. It’s useful if it gives you something concrete to change.\n\nLately I’ve been writing the roughest version I can before I open the file where the real work lives.', '2026-11-08'),
  post('sketches', 'jules', 'One page a day', 'Keeping a sketchbook open on the table worked better than setting a reminder ever did.', '2026-11-06'),
  post('cooking', 'amina', 'A soup for the end of the week', 'On Fridays I roast the last vegetables with a little oil, add stock, and blend. It’s never quite the same soup twice.', '2026-11-02'),
  post('chess-club', MEMBER_ID, 'Starting a tiny chess club', 'Two friends, one board, and a standing Sunday afternoon date. Keeping it small made it much easier to start.', '2026-10-29'),
];

export const seed: Workspace = { people, notes, posts };
export const roleLabel = (role: Role) => role === 'admin' ? 'Administrator' : 'Member';
export const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map(n => n[0]).join('').toUpperCase();
export const formatDate = (date: string, full = false) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', ...(full ? {year: 'numeric'} : {}), timeZone: 'UTC' }).format(new Date(date));
export const makeId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
export const compactText = (text: string) => text.trim().replace(/\s+/g, ' ');
export const matches = (query: string, ...fields: string[]) => {
  const text = fields.join(' ').toLowerCase();
  return query.trim().toLowerCase().split(/\s+/).every(part => text.includes(part));
};
export const cleanInterests = (text: string) => {
  const seen = new Set<string>();
  return text.split(',').map(x => x.trim().replace(/\s+/g, ' ').slice(0, 32)).filter(x => {
    if (!x || seen.has(x.toLowerCase())) return false;
    seen.add(x.toLowerCase());
    return true;
  }).slice(0, 10);
};
