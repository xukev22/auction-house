import { GoogleButton } from './GoogleButton';

export default async function LoginPage({ searchParams }: PageProps<'/auth/login'>) {
  const { message } = await searchParams;

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold">Auction House</h1>
      {typeof message === 'string' && <p className="text-red-500">{message}</p>}
      <GoogleButton />
    </main>
  );
}
