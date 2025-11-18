import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SettingsClient } from './settings-client';

export const metadata = {
  title: 'Settings - AI Voice Generator',
  description: 'Manage your account settings and preferences',
};

async function getSettingsData() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return {
    user,
    profile,
  };
}

export default async function SettingsPage() {
  const { user, profile } = await getSettingsData();

  return <SettingsClient user={user} profile={profile} />;
}
