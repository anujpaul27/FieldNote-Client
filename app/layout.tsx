import type { Metadata } from 'next';
import '@fontsource-variable/dm-sans';
import '@fontsource-variable/newsreader';
import '@fontsource-variable/newsreader/wght-italic.css';
import './globals.css';
import { FieldnoteApp } from '@/components/workspace';

export const metadata: Metadata = {
  title: 'Fieldnote — My workspace',
  description: 'A calm, personal space for everything worth keeping.',
  icons: { icon: '/fieldnote.svg' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-theme="fieldnote"><body><FieldnoteApp />{children}</body></html>;
}
