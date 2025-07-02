import { prisma } from "@/lib/utils";
import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcrypt";

const schema = z.object({
  name: z.string(),
  password: z.string(),
  email: z.string().email(),
  phone: z.string(),
  photo: z.string().optional(),
});

export type TRegister = z.infer<typeof schema>;

export const POST = async (req: Request) => {
  const body: TRegister = await req.json();
  if (!schema.safeParse(body).success) {
    return NextResponse.json(
      { error: "Invalid data", message: schema.safeParse(body).error },
      { status: 400 }
    );
  }

  const isEmailExist = await prisma.user.findUnique({
    where: {
      email: body.email
    }
  })

  const isPhoneExist = await prisma.user.findUnique({
    where: {
      phone: body.phone
    }
  })

  if (isEmailExist || isPhoneExist) {
    return NextResponse.json({ error: `${isEmailExist && "Email"} ${isPhoneExist ? "Phone" : ""} sudah ada` }, {status: 500});    
  }

  const hashPassword = bcrypt.hashSync(body.password, 10);

  try {
    const result = await prisma.user.create({
      data: {
        name: body.name,
        password: hashPassword,
        email: body.email,
        phone: body.phone,
      },
    });
    return NextResponse.json({
      success: true,
      message: "berhasil menyimpan",
      data: result,
    });
  } catch (error) {
    console.log("error", error);
    return NextResponse.json({ error }, {status: 500});
  }
};
