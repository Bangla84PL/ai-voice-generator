import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';

export const metadata = {
  title: 'Dashboard',
  description: 'Manage your AI voice generation projects',
};

async function getUserData() {
  const supabase = createClient();

  // Check if user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/signin');
  }

  // Fetch user profile and credit balance
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('Error fetching profile:', profileError);
  }

  return {
    user,
    profile,
    creditBalance: profile?.credit_balance || 0,
  };
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, creditBalance } = await getUserData();

  return (
    <div className="min-h-screen">
      {/* Navbar with credit balance */}
      <Navbar
        creditBalance={creditBalance}
        userEmail={user.email}
      />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex gap-6">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content */}
          <main className="flex-1">
            <div className="glass-card min-h-[calc(100vh-12rem)] rounded-xl border border-white/10 p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
