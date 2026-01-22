// Main landing page - redirects to merchant landing
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/merchant');
}
