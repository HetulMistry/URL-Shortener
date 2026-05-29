import "./env.js";
import { createRequire } from "module";
import { PrismaPg } from "@prisma/adapter-pg";
const require = createRequire(import.meta.url);
const gen = require("../generated/prisma");
const { PrismaClient } = gen;

const adapter = new PrismaPg(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

export default prisma;
