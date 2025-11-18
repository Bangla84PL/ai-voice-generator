import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProjectsClient } from './projects-client';

export const metadata = {
  title: 'Projects - AI Voice Generator',
  description: 'Manage your voice generation projects',
};

async function getProjectsData() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  // Get projects with generation count
  const { data: projects } = await supabase
    .from('voicegen_projects')
    .select(
      `
      *,
      generations:voicegen_generations(count)
    `
    )
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  return {
    projects: projects || [],
  };
}

export default async function ProjectsPage() {
  const { projects } = await getProjectsData();

  return <ProjectsClient projects={projects} />;
}
