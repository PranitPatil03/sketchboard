'use client'

import { signIn, signUp } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod"
import { SignupSchema } from "@repo/common/types";
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from "@/hooks/use-toast";
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState, useTransition } from "react";

type SignUpFormValues = z.infer<typeof SignupSchema>;

export function SignUpForm() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isGooglePending, setIsGooglePending] = useState(false);
    const [isGithubPending, setIsGithubPending] = useState(false);
    const anyPending = isPending || isGooglePending || isGithubPending;

    const form = useForm<SignUpFormValues>({
        resolver: zodResolver(SignupSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    })

    async function onSubmit(values: SignUpFormValues) {
        startTransition(async () => {
            try {
                const { error } = await signUp.email({
                    name: values.name,
                    email: values.email,
                    password: values.password,
                });

                if (error) {
                    toast({ title: error.message || "Error creating account", variant: "destructive" });
                    return;
                }

                toast({ title: "Account created successfully" });
                router.push("/");
                router.refresh();
            } catch (error) {
                toast({ title: "Something went wrong. Please try again.", variant: "destructive" });
                const errorMessage = error instanceof Error ? error.message : "Something went wrong. Please try again.";
                console.error(errorMessage)
            }
        })
    };

    async function handleGoogleSignUp() {
        setIsGooglePending(true);
        try {
            await signIn.social({
                provider: "google",
                callbackURL: "/",
            });
        } catch {
            toast({ title: "Failed to sign up with Google", variant: "destructive" });
            setIsGooglePending(false);
        }
    }

    async function handleGithubSignUp() {
        setIsGithubPending(true);
        try {
            await signIn.social({
                provider: "github",
                callbackURL: "/",
            });
        } catch {
            toast({ title: "Failed to sign up with GitHub", variant: "destructive" });
            setIsGithubPending(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="sr-only">Full Name</FormLabel>
                            <FormControl>
                                <Input {...field}
                                    disabled={anyPending}
                                    placeholder="Full name"
                                    className="h-12 bg-white/50 dark:bg-white/10 p-3 border rounded-lg border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 !ring-0 !outline-0 focus:border-purple-500 focus:border-[2px] placeholder:text-gray-400" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="sr-only">Email</FormLabel>
                            <FormControl>
                                <Input {...field}
                                    disabled={anyPending}
                                    placeholder="Email address"
                                    className="h-12 bg-white/50 dark:bg-white/10 p-3 border rounded-lg border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 !ring-0 !outline-0 focus:border-purple-500 focus:border-[2px] placeholder:text-gray-400" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="sr-only">Password</FormLabel>
                            <FormControl>
                                <Input type="password" {...field}
                                    disabled={anyPending}
                                    placeholder="Password"
                                    className="h-12 bg-white/50 dark:bg-white/10 p-3 border rounded-lg border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 !ring-0 !outline-0 focus:border-purple-500 focus:border-[2px] placeholder:text-gray-400" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button disabled={anyPending}
                    type="submit"
                    className="!mt-[10px] w-full h-12 rounded-lg text-sm font-semibold text-white bg-color-primary hover:bg-brand-hover active:bg-brand-active active:scale-[.98] transition-all duration-200">
                    {isPending ? "Creating account..." : "Sign Up"}
                </Button>
            </form>

            <div className="relative flex items-center justify-center gap-3 my-4">
                <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">or authorize with</span>
                <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
            </div>

            <div className="flex gap-3">
                <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-12 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-all duration-200"
                    disabled={anyPending}
                    onClick={handleGoogleSignUp}
                >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    {isGooglePending ? "Connecting..." : "Google"}
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-12 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-all duration-200"
                    disabled={anyPending}
                    onClick={handleGithubSignUp}
                >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    {isGithubPending ? "Connecting..." : "GitHub"}
                </Button>
            </div>
        </Form>
    )
}