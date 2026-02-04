"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold">
          Code Challenge
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/challenges" className="text-sm hover:underline">
            챌린지
          </Link>
          {session ? (
            <div className="flex items-center gap-4">
              <Link href="/profile" className="text-sm hover:underline">
                {session.user?.name}
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut()}
              >
                로그아웃
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="outline" size="sm">
                  로그인
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">회원가입</Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
