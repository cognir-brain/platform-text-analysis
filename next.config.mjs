/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
            allowedOrigins: ["localhost:3000", "platform.cognir.ai"],
            bodySizeLimit: "10mb",
        },
    },

    serverExternalPackages: ['pdf-parse'],

    httpAgentOptions: {
        keepAlive: true,
    },

    images: {
        domains: ['platform.cognir.ai', 'lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },

    async headers() {
        return [
            {
                source: '/api/:path*',
                headers: [
                    {
                        key: 'Transfer-Encoding',
                        value: 'chunked',
                    },
                    {
                        key: 'Access-Control-Allow-Origin',
                        value: 'https://platform.cognir.ai',
                    },
                    {
                        key: 'Access-Control-Allow-Methods',
                        value: 'GET, POST, PUT, DELETE, OPTIONS',
                    },
                    {
                        key: 'Access-Control-Allow-Headers',
                        value: 'X-Requested-With, Content-Type, Authorization',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
