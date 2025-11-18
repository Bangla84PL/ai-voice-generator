'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  User,
  Key,
  Bell,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
} from 'lucide-react';

interface SettingsClientProps {
  user: any;
  profile: any;
}

export function SettingsClient({ user, profile }: SettingsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Profile form
  const [profileForm, setProfileForm] = useState({
    full_name: profile?.full_name || '',
    email: user?.email || '',
  });

  // Preferences form
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    generationComplete: true,
    creditLowAlert: true,
    weeklyReport: false,
  });

  // API Key
  const [apiKey, setApiKey] = useState(profile?.api_key || '');
  const [showGenerateKeyDialog, setShowGenerateKeyDialog] = useState(false);

  const handleUpdateProfile = async () => {
    setIsSubmitting(true);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: profileForm.full_name,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setSuccessMessage('Profile updated successfully');
      router.refresh();
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePreferences = async () => {
    setIsSubmitting(true);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preferences }),
      });

      if (!response.ok) {
        throw new Error('Failed to update preferences');
      }

      setSuccessMessage('Preferences updated successfully');
      router.refresh();
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateApiKey = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/user/api-key', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to generate API key');
      }

      const data = await response.json();
      setApiKey(data.apiKey);
      setShowGenerateKeyDialog(false);
      setSuccessMessage('API key generated successfully');
      router.refresh();
    } catch (err) {
      console.error('Generate API key failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setSuccessMessage('API key copied to clipboard');
  };

  const handleDeleteAccount = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/user/account', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      // Redirect to home page
      window.location.href = '/';
    } catch (err) {
      console.error('Delete account failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPro = profile?.role === 'pro' || profile?.role === 'enterprise';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="mb-2 text-3xl font-bold text-white">Settings</h1>
        <p className="text-white/70">Manage your account and preferences</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <Card className="border-green-500/50 bg-green-500/10 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            <p className="text-green-400">{successMessage}</p>
          </div>
        </Card>
      )}

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="api">
            <Key className="mr-2 h-4 w-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Bell className="mr-2 h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6 space-y-6">
          <Card className="border-white/10 p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">
              Profile Information
            </h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={profileForm.full_name}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, full_name: e.target.value })
                  }
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileForm.email}
                  disabled
                  className="mt-2"
                />
                <p className="mt-1 text-xs text-white/60">
                  Email cannot be changed. Contact support if needed.
                </p>
              </div>

              <div>
                <Label>Account Type</Label>
                <div className="mt-2">
                  <Badge
                    variant={isPro ? 'default' : 'secondary'}
                    className="text-sm"
                  >
                    {profile?.role?.toUpperCase() || 'USER'}
                  </Badge>
                </div>
              </div>

              <Button
                variant="primary"
                onClick={handleUpdateProfile}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api" className="mt-6 space-y-6">
          <Card className="border-white/10 p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="mb-2 text-xl font-semibold text-white">
                  API Key Management
                </h2>
                <p className="text-sm text-white/60">
                  {isPro
                    ? 'Use API keys to integrate voice generation into your applications'
                    : 'Upgrade to Pro or Enterprise to access API keys'}
                </p>
              </div>
              {!isPro && (
                <Badge className="bg-gradient-to-r from-accent-warm to-orange-600">
                  Pro Feature
                </Badge>
              )}
            </div>

            {isPro ? (
              <div className="space-y-4">
                {apiKey ? (
                  <>
                    <div>
                      <Label>Your API Key</Label>
                      <div className="mt-2 flex gap-2">
                        <Input
                          type={showApiKey ? 'text' : 'password'}
                          value={apiKey}
                          readOnly
                          className="font-mono"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setShowApiKey(!showApiKey)}
                        >
                          {showApiKey ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleCopyApiKey}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="mt-2 text-xs text-white/60">
                        Keep your API key secure. Do not share it publicly.
                      </p>
                    </div>

                    <Button
                      variant="destructive"
                      onClick={() => setShowGenerateKeyDialog(true)}
                    >
                      Regenerate API Key
                    </Button>
                  </>
                ) : (
                  <div>
                    <p className="mb-4 text-sm text-white/70">
                      You haven't generated an API key yet.
                    </p>
                    <Button
                      variant="primary"
                      onClick={handleGenerateApiKey}
                      disabled={isSubmitting}
                    >
                      Generate API Key
                    </Button>
                  </div>
                )}

                <Separator />

                <div>
                  <h3 className="mb-2 font-semibold text-white">
                    API Documentation
                  </h3>
                  <p className="mb-2 text-sm text-white/70">
                    Learn how to integrate the AI Voice Generator API into your
                    applications.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href="/docs/api"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Documentation
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <Key className="mx-auto mb-3 h-12 w-12 text-white/30" />
                <p className="mb-4 text-white/70">
                  Upgrade your account to access API keys
                </p>
                <Button variant="primary" asChild>
                  <a href="/pricing">Upgrade Now</a>
                </Button>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="mt-6 space-y-6">
          <Card className="border-white/10 p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">
              Notification Preferences
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-white/60">
                    Receive email notifications for important updates
                  </p>
                </div>
                <Switch
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, emailNotifications: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Generation Complete</Label>
                  <p className="text-sm text-white/60">
                    Notify when voice generation is complete
                  </p>
                </div>
                <Switch
                  checked={preferences.generationComplete}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, generationComplete: checked })
                  }
                  disabled={!preferences.emailNotifications}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Low Credit Alert</Label>
                  <p className="text-sm text-white/60">
                    Alert when credit balance is low
                  </p>
                </div>
                <Switch
                  checked={preferences.creditLowAlert}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, creditLowAlert: checked })
                  }
                  disabled={!preferences.emailNotifications}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Weekly Report</Label>
                  <p className="text-sm text-white/60">
                    Receive weekly usage summary
                  </p>
                </div>
                <Switch
                  checked={preferences.weeklyReport}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, weeklyReport: checked })
                  }
                  disabled={!preferences.emailNotifications}
                />
              </div>

              <Button
                variant="primary"
                onClick={handleUpdatePreferences}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Preferences'}
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-6 space-y-6">
          <Card className="border-white/10 p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">
              Change Password
            </h2>
            <p className="mb-4 text-sm text-white/70">
              Update your password to keep your account secure
            </p>
            <Button variant="outline" asChild>
              <a href="/auth/reset-password">Change Password</a>
            </Button>
          </Card>

          <Card className="border-red-500/50 bg-red-500/5 p-6">
            <div className="mb-4 flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 flex-shrink-0 text-red-400" />
              <div>
                <h2 className="mb-2 text-xl font-semibold text-red-400">
                  Danger Zone
                </h2>
                <p className="text-sm text-white/70">
                  Permanently delete your account and all associated data. This
                  action cannot be undone.
                </p>
              </div>
            </div>

            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete Account
            </Button>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Regenerate API Key Dialog */}
      <Dialog
        open={showGenerateKeyDialog}
        onOpenChange={setShowGenerateKeyDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Regenerate API Key</DialogTitle>
            <DialogDescription>
              This will invalidate your current API key. Any applications using
              the old key will stop working. Are you sure?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowGenerateKeyDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleGenerateApiKey}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Regenerating...' : 'Regenerate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you absolutely sure? This will permanently delete your account,
              all your projects, generations, and data. This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Delete My Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
