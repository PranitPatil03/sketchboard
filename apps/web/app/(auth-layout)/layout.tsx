import Link from "next/link";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <div className="sketchboard min-h-screen relative w-full overflow-hidden bg-white dark:bg-gray-950 flex items-center justify-center">
                <div className="w-full max-w-[30rem] mx-auto px-6 py-10 flex flex-col items-center">
                    <div className="relative z-10 mb-4">
                        <Link href="/" className="Logo flex items-center select-none is-normal is-plain underline-none text-current">
                            <h1 className="brand-title SketchboardLogo-text font-sketchboardfont">Sketchboard</h1>
                        </Link>
                    </div>
                    <div className="w-full">
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
};
