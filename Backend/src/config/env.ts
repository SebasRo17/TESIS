import 'dotenv/config';

function required(name: string): string {
    const v = process.env[name]; 
    if (!v) throw new Error(`Environment variable ${name} is required`);
    return v;
}

export const env = {
    node_env: process.env.NODE_ENV || "development",
    port: parseInt(process.env.PORT || "3000", 10),
    
    // JWT Configuration
    jwt: {
        accessSecret: process.env.JWT_ACCESS_SECRET || "your-access-secret-key",
        accessTtl: (process.env.JWT_ACCESS_TTL || "15m") as string,
        refreshSecret: process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key",
        refreshTtl: (process.env.JWT_REFRESH_TTL || "7d") as string,
    },

    // Base de datos
    database: {
        url: process.env.DATABASE_URL || "mysql://user:password@localhost:3306/base_tesis",
    },
};