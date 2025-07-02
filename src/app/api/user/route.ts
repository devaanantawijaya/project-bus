import JwtChecker, { prisma } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const res = JwtChecker(request);

  if (!res) {
    return NextResponse.json({
      error: "Unauthorize"
    }, {status: 401})
  }

  try {
    const result = await prisma.user.findMany();
    return NextResponse.json({
      success: true,
      message: "berhasil dapat data user",
      data: result,
    });
  } catch (error) {
    console.log("error", error);
     return NextResponse.json({
      success: false,
      message: "error dapat data user",
    });
  }
}