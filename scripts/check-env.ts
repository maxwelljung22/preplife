import { getAuthEnv, getDatabaseEnv } from "../lib/env";

getAuthEnv();
getDatabaseEnv();

console.log("Environment looks valid.");
