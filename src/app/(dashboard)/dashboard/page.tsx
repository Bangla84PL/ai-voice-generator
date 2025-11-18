import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AudioPlayer } from '@/components/voice/audio-player';
import {
  Sparkles,
  FolderOpen,
  Coins,
  FileAudio,
  TrendingUp,
  Clock,
  Download,
  Play,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const metadata = {
  title: 'Dashboard - AI Voice Generator',
  description: 'Overview of your voice generation activity',
};

async function getDashboardData() {
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

  // Get stats
  const { count: totalGenerations } = await supabase
    .from('voicegen_generations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const { count: totalProjects } = await supabase
    .from('voicegen_projects')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  // Get recent generations
  const { data: recentGenerations } = await supabase
    .from('voicegen_generations')
    .select(
      `
      *,
      voice:voicegen_voices(name, provider, gender),
      project:voicegen_projects(name)
    `
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  // Get credit usage stats
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: recentUsage } = await supabase
    .from('voicegen_generations')
    .select('credits_used, created_at')
    .eq('user_id', user.id)
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: true });

  const totalCreditsUsed = recentUsage?.reduce(
    (sum, gen) => sum + (gen.credits_used || 0),
    0
  );

  return {
    profile,
    stats: {
      totalGenerations: totalGenerations || 0,
      totalProjects: totalProjects || 0,
      creditsUsed: totalCreditsUsed || 0,
      creditBalance: profile?.credit_balance || 0,
    },
    recentGenerations: recentGenerations || [],
  };
}

export default async function DashboardPage() {
  const { profile, stats, recentGenerations } = await getDashboardData();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="mb-2 text-3xl font-bold text-white">
          Welcome back, {profile?.full_name || 'there'}!
        </h1>
        <p className="text-white/70">
          Here's an overview of your voice generation activity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Credits Balance */}
        <Card className="border-white/10 bg-gradient-to-br from-primary-500/10 to-primary-600/10 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="mb-1 text-sm font-medium text-white/70">
                Credit Balance
              </p>
              <h3 className="text-3xl font-bold text-white">
                {stats.creditBalance.toLocaleString()}
              </h3>
            </div>
            <div className="rounded-lg bg-primary-500/20 p-3">
              <Coins className="h-6 w-6 text-primary-400" />
            </div>
          </div>
          <Link href="/pricing">
            <Button variant="link" className="mt-2 h-auto p-0 text-sm">
              Buy more credits
            </Button>
          </Link>
        </Card>

        {/* Total Generations */}
        <Card className="border-white/10 bg-gradient-to-br from-accent-warm/10 to-orange-600/10 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="mb-1 text-sm font-medium text-white/70">
                Total Generations
              </p>
              <h3 className="text-3xl font-bold text-white">
                {stats.totalGenerations}
              </h3>
            </div>
            <div className="rounded-lg bg-orange-500/20 p-3">
              <FileAudio className="h-6 w-6 text-orange-400" />
            </div>
          </div>
        </Card>

        {/* Projects */}
        <Card className="border-white/10 bg-gradient-to-br from-blue-500/10 to-blue-600/10 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="mb-1 text-sm font-medium text-white/70">
                Projects
              </p>
              <h3 className="text-3xl font-bold text-white">
                {stats.totalProjects}
              </h3>
            </div>
            <div className="rounded-lg bg-blue-500/20 p-3">
              <FolderOpen className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </Card>

        {/* Credits Used (30 days) */}
        <Card className="border-white/10 bg-gradient-to-br from-green-500/10 to-green-600/10 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="mb-1 text-sm font-medium text-white/70">
                Used (30 days)
              </p>
              <h3 className="text-3xl font-bold text-white">
                {stats.creditsUsed}
              </h3>
            </div>
            <div className="rounded-lg bg-green-500/20 p-3">
              <TrendingUp className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-white/10 p-6">
        <h2 className="mb-4 text-xl font-semibold text-white">
          Quick Actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/dashboard/generate">
            <Button variant="primary" className="h-auto w-full flex-col p-6">
              <Sparkles className="mb-2 h-8 w-8" />
              <span className="text-lg font-semibold">Generate Voice</span>
              <span className="text-xs opacity-80">
                Create a new audio file
              </span>
            </Button>
          </Link>

          <Link href="/dashboard/projects">
            <Button variant="secondary" className="h-auto w-full flex-col p-6">
              <FolderOpen className="mb-2 h-8 w-8" />
              <span className="text-lg font-semibold">New Project</span>
              <span className="text-xs opacity-80">
                Organize your generations
              </span>
            </Button>
          </Link>

          <Link href="/dashboard/library">
            <Button variant="accent" className="h-auto w-full flex-col p-6">
              <Play className="mb-2 h-8 w-8" />
              <span className="text-lg font-semibold">Browse Voices</span>
              <span className="text-xs opacity-80">
                Explore 100+ voices
              </span>
            </Button>
          </Link>
        </div>
      </Card>

      {/* Recent Generations */}
      <Card className="border-white/10 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            Recent Generations
          </h2>
          <Link href="/dashboard/history">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>

        {recentGenerations.length === 0 ? (
          <div className="py-12 text-center">
            <FileAudio className="mx-auto mb-3 h-12 w-12 text-white/30" />
            <p className="mb-2 text-white/70">No generations yet</p>
            <p className="mb-4 text-sm text-white/50">
              Start by creating your first voice generation
            </p>
            <Link href="/dashboard/generate">
              <Button variant="primary">
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Now
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentGenerations.map((generation: any) => (
              <Card
                key={generation.id}
                className="border-white/10 p-4 transition-all hover:border-white/20"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <Badge
                        variant={
                          generation.status === 'completed'
                            ? 'default'
                            : generation.status === 'failed'
                              ? 'destructive'
                              : 'secondary'
                        }
                      >
                        {generation.status}
                      </Badge>
                      <span className="text-sm text-white/60">
                        {generation.voice?.name || 'Unknown Voice'}
                      </span>
                      {generation.project && (
                        <Badge variant="outline" className="text-xs">
                          {generation.project.name}
                        </Badge>
                      )}
                    </div>

                    <p className="mb-2 line-clamp-2 text-sm text-white/80">
                      {generation.text}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-white/60">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(generation.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                      <span>{generation.character_count} characters</span>
                      <span>{generation.credits_used} credits</span>
                    </div>
                  </div>

                  {generation.status === 'completed' && generation.audio_url && (
                    <div className="ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a
                          href={generation.audio_url}
                          download
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
