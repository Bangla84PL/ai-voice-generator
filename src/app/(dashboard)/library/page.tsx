import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LibraryClient } from './library-client';

export const metadata = {
  title: 'Voice Library - AI Voice Generator',
  description: 'Browse and preview our collection of AI voices',
};

async function getLibraryData() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  // Get all voices
  const { data: voices } = await supabase
    .from('voicegen_voices')
    .select('*')
    .eq('is_active', true)
    .order('name');

  return {
    voices: voices || [],
  };
}

export default async function LibraryPage() {
  const { voices } = await getLibraryData();

  return <LibraryClient voices={voices} />;
}
