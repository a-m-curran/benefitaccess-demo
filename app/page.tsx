import Chat from '@/components/Chat';

interface Props {
  searchParams: Promise<{ demo?: string }>;
}

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const demoMode = params.demo === '1';
  return <Chat demoMode={demoMode} />;
}
