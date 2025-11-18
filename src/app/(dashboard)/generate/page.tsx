import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { GenerateClient } from './generate-client';

export const metadata = {
  title: 'Generate Voice - AI Voice Generator',
  description: 'Convert text to speech with AI-powered voices',
};

async function getGeneratePageData() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  // Get user profile for credit balance
  const { data: profile } = await supabase
    .from('profiles')
    .select('credit_balance')
    .eq('id', user.id)
    .single();

  // Get all active voices
  const { data: voices } = await supabase
    .from('voicegen_voices')
    .select('*')
    .eq('is_active', true)
    .order('name');

  // Get user's projects
  const { data: projects } = await supabase
    .from('voicegen_projects')
    .select('id, name')
    .eq('user_id', user.id)
    .order('name');

  return {
    creditBalance: profile?.credit_balance || 0,
    voices: voices || [],
    projects: projects || [],
  };
}

export default async function GeneratePage() {
  const { creditBalance, voices, projects } = await getGeneratePageData();

  return <GenerateClient creditBalance={creditBalance} voices={voices} projects={projects} />;
}
