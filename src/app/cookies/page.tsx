'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CookiesPage() {
    return (
        <main className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col">
            <Navbar />
            <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex-grow w-full">
                <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
                <div className="prose dark:prose-invert max-w-none space-y-6">
                    <p>Last updated: January 1, 2026</p>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">What Are Cookies</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            As is common practice with almost all professional websites, this site uses cookies, which are tiny files that are downloaded to your computer, to improve your experience.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">How We Use Cookies</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            We use cookies for a variety of reasons detailed below. Unfortunately, in most cases there are no industry standard options for disabling cookies without completely disabling the functionality and features they add to this site.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Disabling Cookies</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            You can prevent the setting of cookies by adjusting the settings on your browser (see your browser Help for how to do this).
                        </p>
                    </section>
                </div>
            </div>
            <Footer />
        </main>
    );
}
