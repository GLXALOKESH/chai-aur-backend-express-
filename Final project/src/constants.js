import dotenv from "dotenv"

export const DB_NAME = "streamtube"
export const DOTENV_PATH = dotenv.config({
    path:"./.env"
})