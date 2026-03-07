'use client';

import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

export function SignOutButton() {
    const router = useRouter();
    return (
        <Button size="sm" onClick={async () => {
            await signOut();
            router.push('/');
            router.refresh();
        }} className="w-full text-left">
            Sign Out
        </Button>
    );
}