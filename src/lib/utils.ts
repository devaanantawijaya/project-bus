import { PrismaClient } from "../../generated/prisma";
import jwt from "jsonwebtoken";

export const prisma = new PrismaClient()

export default function JwtChecker(request: Request) {
  try {
    const requestHeaders = new Headers(request.headers);
    const token = requestHeaders.get("authorization")!.split(" ")[1];
    const res = jwt.verify(token, process.env.SECRET_KEY as string);
    return res;
  } catch (err) {
    return false;
  }
}