import { SignInForm } from "@/components/auth/signin-form";
import ScreenLoading from "@/components/ScreenLoading";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Suspense } from "react";

export default function SignInPage() {
    return (
        <Card className="border-0 shadow-none rounded-2xl m-0 mx-auto px-6 relative z-10 max-w-[440px] bg-transparent">
            <CardHeader className="p-0 pb-2">
                <CardTitle className="text-2xl font-normal text-center text-gray-900 dark:text-gray-100">Welcome back</CardTitle>
                <CardDescription className="text-sm text-center text-gray-500 dark:text-gray-400">Enter your credentials to sign in</CardDescription>
            </CardHeader>
            <CardContent className="p-0 !my-0">
                <Suspense fallback={<ScreenLoading />}>
                    <SignInForm />
                </Suspense>
            </CardContent>
            <CardFooter className="px-0 pt-6 pb-0 flex-col !mt-0 gap-2">
                <div className="flex w-full flex-col items-center gap-3">
                    <Link className="text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors" href="/auth/signup">Don&apos;t have an account? <span className="font-semibold text-purple-600 dark:text-purple-400">Sign Up</span></Link>
                </div>
            </CardFooter>
        </Card>
    );
}