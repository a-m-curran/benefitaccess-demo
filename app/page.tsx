import Chat from '@/components/Chat';

interface Props {
  searchParams: Promise<{ demo?: string }>;
}

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  // demo=1 → Maya (WA), demo=2 → Deja (IL), demo=3 → Tomás (TX), omit → live mode
  const demoNum = parseInt(params.demo ?? '0', 10);
  const demoMode = demoNum >= 1 && demoNum <= 3 ? demoNum : undefined;
  return <Chat demoMode={demoMode} />;
}
