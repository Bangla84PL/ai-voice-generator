import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProjectDetailClient } from './project-detail-client';

export const metadata = {
  title: 'Project Details - AI Voice Generator',
  description: 'View and manage project generations',
};

async function getProjectData(projectId: string) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  // Get project
  const { data: project, error: projectError } = await supabase
    .from('voicegen_projects')
    .select('*')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single();

  if (projectError || !project) {
    notFound();
  }

  // Get generations in this project
  const { data: generations } = await supabase
    .from('voicegen_generations')
    .select(
      `
      *,
      voice:voicegen_voices(name, provider, gender)
    `
    )
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  // Calculate stats
  const totalCreditsUsed = generations?.reduce(
    (sum, gen) => sum + (gen.credits_used || 0),
    0
  );

  const totalDuration = generations?.reduce(
    (sum, gen) => sum + (gen.audio_duration || 0),
    0
  );

  return {
    project,
    generations: generations || [],
    stats: {
      totalGenerations: generations?.length || 0,
      totalCreditsUsed: totalCreditsUsed || 0,
      totalDuration: totalDuration || 0,
      completedGenerations:
        generations?.filter((g) => g.status === 'completed').length || 0,
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { project, generations, stats } = await getProjectData(params.id);

  return (
    <ProjectDetailClient
      project={project}
      generations={generations}
      stats={stats}
    />
  );
}
