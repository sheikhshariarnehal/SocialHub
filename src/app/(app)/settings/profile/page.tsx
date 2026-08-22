"use client";

import { useState } from "react";
import { toast } from "sonner";
import { User, Mail, Lock, ShieldCheck, Bell, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar } from "@/components/ui/avatar";
import { useUser } from "@/hooks/use-user";

export default function ProfileSettingsPage() {
  const { user } = useUser();
  const [fullName, setFullName] = useState(
    user?.user_metadata?.full_name || "Alex Smith"
  );
  const [email] = useState(user?.email || "alex@example.com");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile changes saved successfully!");
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    toast.success("Password updated successfully!");
    setCurrentPassword("");
    setNewPassword("");
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in-50">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          User Profile & Security
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your personal account credentials and security preferences.
        </p>
      </div>

      {/* Profile Details */}
      <Card glass>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Personal Information</CardTitle>
          <CardDescription>
            Update your photo and personal contact details
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSaveProfile}>
          <CardContent className="space-y-6">
            {/* Avatar Row */}
            <div className="flex items-center gap-4">
              <Avatar name={fullName} size="xl" />
              <div>
                <Button variant="outline" size="sm" type="button" className="text-xs gap-1.5">
                  <Camera className="h-3.5 w-3.5" />
                  Change Avatar
                </Button>
                <p className="text-[11px] text-muted-foreground mt-1">
                  JPG, GIF or PNG. Max size 2MB.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="profName">Full Name</Label>
                <Input
                  id="profName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  leftIcon={<User className="h-4 w-4" />}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profEmail">Email Address</Label>
                <Input
                  id="profEmail"
                  value={email}
                  disabled
                  leftIcon={<Mail className="h-4 w-4" />}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t border-border/40 py-4">
            <Button type="submit" variant="brand" size="sm">
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Password Update */}
      <Card glass>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Change Password</CardTitle>
          <CardDescription>
            Ensure your account is using a secure, long password
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleUpdatePassword}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currPass">Current Password</Label>
                <Input
                  id="currPass"
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  leftIcon={<Lock className="h-4 w-4" />}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPass">New Password</Label>
                <Input
                  id="newPass"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  leftIcon={<Lock className="h-4 w-4" />}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t border-border/40 py-4">
            <Button type="submit" variant="outline" size="sm">
              Update Password
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
