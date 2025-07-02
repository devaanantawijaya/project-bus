import { prisma } from "@/lib/utils";
import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

const schema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type TLogin = z.infer<typeof schema>;

export const POST = async (req: Request) => {
  const body: TLogin = await req.json();
  if (!schema.safeParse(body).success) {
    return NextResponse.json(
      { error: "Invalid data", message: schema.safeParse(body).error },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });
    if (!user) {
      return NextResponse.json({ error: "User Not Found" }, { status: 401 });
    }

    const password = await bcrypt.compare(body.password, user.password);

    if (!password) {
      return NextResponse.json({ error: "Passwaord Wrong" }, { status: 401 });
    }

    const token = jwt.sign({
        user,
    },
        process.env.SECRET_KEY as string
    )

    return NextResponse.json({
      success: true,
      message: "login berhasil",
      user,
      token
    });
  } catch (error) {
    console.log("error", error);
    return NextResponse.json({ error });
  }
};
