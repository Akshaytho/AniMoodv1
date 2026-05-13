import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function Index() {
  const c = await cookies();
  const session = c.get('animood_session');
  redirect(session ? '/dashboard' : '/login');
}
