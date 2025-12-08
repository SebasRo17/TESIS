import 'dotenv/config';

function required(name: string): string {
    const v = process.env[name]; 
    if (!v) throw new Error(`Environment variable ${name} is required`);
    return v;
}

export const env = {
    nodeEnv: process.env.NODE_ENV || 'development', 
    port: parseInt(process.env.PORT || '3000', 10),
    dbUrl: required('DATABASE_URL'),
    jwt: {
        accessSecret: required('JWT_ACCESS_SECRET'),
        refreshSecret: required('JWT_REFRESH_SECRET'),
        accessTtl: process.env.JWT_ACCESS_TTL || '15m',
        refreshTtl: process.env.JWT_REFRESH_TTL || '7d',
    },
};