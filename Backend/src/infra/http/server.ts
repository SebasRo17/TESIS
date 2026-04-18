import express from "express";
import cors from "cors";

export function makeServer() {
    const app = express();
    app.use(cors());
    app.use(express.json());
    return app;
}