"use client";

import { MdEmail } from "react-icons/md";
import { IoIosLock } from "react-icons/io";
import { FaMinus } from "react-icons/fa6";
import GoogleIcon from "@/assets/googleIcon";
import TwitterIcon from "@/assets/twitterIcon";
import FacebookIcon from "@/assets/facebookIcon";
import { useForm } from "react-hook-form";
import InputForm from "@/components/InputForm";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const LoginSchema = z.object({
  email: z.string().email("Email salah"),
  password: z.string().min(12, "Password Minimal 12 Karakter"),
});

type LoginSchemaType = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(LoginSchema),
  });

  const handleForm = (data: LoginSchemaType) => {
    console.log("Email:", data.email);
    console.log("password:", data.password);
    alert("Berhasil submit");
  };

  console.log("Error", errors);

  return (
    <div className="px-10">
      <div className="pt-20 text-center pb-15">
        <h1 className="text-4xl font-semibold text-[#35F9D1] pb-2">TransBli</h1>
        <p>CUSTOMER</p>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit(handleForm)}>
        <div className="pb-5">
          <h1 className="text-center pb-5">Login to your account</h1>

          {/* Input Email */}
          <div className="pb-5">
            <InputForm
              {...register("email", {
                required: {
                  message: "Email Kosong",
                  value: true,
                },
              })}
              title="Email"
              className="py-3.5 px-4"
              error={errors?.email?.message}
              logo={<MdEmail className="text-[#1A443B] text-xl" />}
            />
          </div>

          {/* Input Password */}
          <div className="pb-3">
            <InputForm
              title="Password"
              logo={<IoIosLock className="text-[#1A443B] text-2xl" />}
              className="py-3 px-3.5"
              {...register("password", {
                required: {
                  message: "Password Kosong",
                  value: true,
                },
              })}
              error={errors?.password?.message}
            />
          </div>

          {/* Forgot password */}
          <div className="text-end">
            <button type="button" className="text-sm text-[#35F9D1]">
              Forgot password?
            </button>
          </div>
        </div>

        {/* Button Login */}
        <div className="pb-10">
          <button
            type="submit"
            className="w-full bg-[#35F9D1] font-semibold text-[#1A443B] py-3 rounded-xl"
          >
            Login
          </button>
        </div>
      </form>

      <div className="flex justify-center gap-x-3 items-center pb-5 text-sm">
        <FaMinus className="text-[#35F9D1]" />
        <p>Or login with</p>
        <FaMinus className="text-[#35F9D1]" />
      </div>

      {/* Logo sosmed */}
      <div className="flex justify-center items-center gap-x-10 text-3xl pb-5">
        <div className="border-1 p-4 rounded-lg border-[#35F9D1]">
          <GoogleIcon size={30} />
        </div>
        <div className="border-1 p-4 rounded-lg border-[#35F9D1]">
          <FacebookIcon size={30} />
        </div>
        <div className="border-1 p-4 rounded-lg border-[#35F9D1]">
          <TwitterIcon size={30} />
        </div>
      </div>

      <div className="flex justify-center text-sm gap-x-1">
        <p>{`Dont't have an account?`}</p>
        <button className="text-[#35F9D1]">Sign Up</button>
      </div>
    </div>
  );
}
