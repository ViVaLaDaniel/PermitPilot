"use client";

import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { CreditCard, LogIn, LogOut, Settings, User as UserIcon } from "lucide-react";
import { useAuth, useUser } from "@/firebase";
import {
  initiateAnonymousSignIn,
  initiateEmailSignIn,
} from "@/firebase/non-blocking-login";
import { signOut } from "firebase/auth";

export function UserNav() {
  const userAvatar = PlaceHolderImages.find((img) => img.id === "user-avatar");
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  const handleLogin = () => {
    // For simplicity, this uses anonymous sign-in.
    // In a real app, you'd have a form for email/password.
    initiateAnonymousSignIn(auth);
  };

  const handleLogout = () => {
    signOut(auth);
  };

  if (isUserLoading) {
    return <Button variant="ghost" className="relative h-9 w-9 rounded-full animate-pulse bg-muted"></Button>;
  }

  if (!user) {
    return (
      <Button onClick={handleLogin} variant="outline">
        <LogIn className="mr-2 h-4 w-4" />
        Log In
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            {user.photoURL ? (
              <AvatarImage
                src={user.photoURL}
                alt={user.displayName || "User Avatar"}
                width={36}
                height={36}
              />
            ) : (
              userAvatar && (
                <AvatarImage
                  src={userAvatar.imageUrl}
                  alt="User Avatar"
                  width={36}
                  height={36}
                  data-ai-hint={userAvatar.imageHint}
                />
              )
            )}
            <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.displayName || "Anonymous User"}
            </p>
            {user.email && (
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Billing</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
