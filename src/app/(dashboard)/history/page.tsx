import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { HistoryClient } from './history-client';

export const metadata = {
  title: 'Generation History - AI Voice Generator',
  description: 'View and manage your voice generation history',
};

async function getHistoryData(searchParams: {
  page?: string;
  status?: string;
  voice?: string;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  const page = parseInt(searchParams.page || '1');
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  // Build query
  let query = supabase
    .from('voicegen_generations')
    .select(
      `
      *,
      voice:voicegen_voices(name, provider, gender),
      project:voicegen_projects(name)
    `,
      { count: 'exact' }
    )
    .eq('user_id', user.id);

  // Apply filters
  if (searchParams.status) {
    query = query.eq('status', searchParams.status);
  }

  if (searchParams.voice) {
    query = query.eq('voice_id', searchParams.voice);
  }

  // Get generations with pagination
  const { data: generations, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  // Get all voices for filter
  const { data: voices } = await supabase
    .from('voicegen_voices')
    .select('id, name')
    .eq('is_active', true)
    .order('name');

  return {
    generations: generations || [],
    voices: voices || [],
    totalCount: count || 0,
    currentPage: page,
    pageSize,
  };
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: { page?: string; status?: string; voice?: string };
}) {
  const { generations, voices, totalCount, currentPage, pageSize } =
    await getHistoryData(searchParams);

  return (
    <HistoryClient
      generations={generations}
      voices={voices}
      totalCount={totalCount}
      currentPage={currentPage}
      pageSize={pageSize}
    />
  );
}
