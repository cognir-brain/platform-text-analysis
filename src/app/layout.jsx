import "./globals.css";
import { AuthProvider } from "@/context/authContext";
import { METADATA } from "@/lib/headerData";
import { AuthRedirect } from "@/components/auth-redirect";

export const metadata = {
    metadataBase: new URL(METADATA.url),
    title: METADATA.name,
    description: METADATA.description,
    openGraph: {
        title: METADATA.name,
        description: METADATA.description,
        url: METADATA.url,
        siteName: METADATA.name,
        images: [
            {
                url: METADATA.img,
                width: 1200,
                height: 630,
                alt: METADATA.name,
                type: 'image/png', // Tambahkan type
            }
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: METADATA.name,
        description: METADATA.description,
        images: [METADATA.img],
        creator: '@CognirAI', // Tambahkan creator handle
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    verification: {
        google: 'your-google-verification-code',
        yandex: 'your-yandex-verification-code',
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <AuthProvider>
                    <AuthRedirect />
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}