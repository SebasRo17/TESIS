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

    mail: {
        host: process.env.MAIL_HOST || "smtp.example.com",
        port: parseInt(process.env.MAIL_PORT || "587", 10),
        secure: process.env.MAIL_SECURE === "true",
        user: process.env.MAIL_USER || "",
        pass: process.env.MAIL_PASS || "",
        from: process.env.MAIL_FROM || "no-reply@example.com",
    },
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:4200"
};