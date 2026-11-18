import { notFound } from 'next/navigation';
import { sections } from '@/lib/workspace';

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(sections).map(path => ({ section: path.split('/').filter(Boolean) }));
}

export default async function Page({ params }: { params: Promise<{ section?: string[] }> }) {
  const { section = [] } = await params;
  const path = `/${section.join('/')}`;
  if (!Object.hasOwn(sections, path)) notFound();
  return null;
}
