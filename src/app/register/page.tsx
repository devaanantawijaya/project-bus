"use client";

import InputForm from "@/components/InputForm";
import React from "react";
import { MdEmail } from "react-icons/md";
import { IoMdPerson } from "react-icons/io";
import { useForm } from "react-hook-form";
import { MdLocalPhone } from "react-icons/md";
import { IoIosLock } from "react-icons/io";

interface TForm {
  name: string;
  phone: string;
  email: string;
  password: string;
}

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TForm>();

  const handleForm = (data: TForm) => {
    console.log("name:", data.name);
    console.log("phone:", data.phone);
    console.log("email:", data.email);
    console.log("password:", data.password);
    alert("Berhasil Register");
  };

  console.log("error:", errors);

  return (
    <div className="px-10">
      <div className="pt-20 text-center pb-15">
        <h1 className="text-4xl font-semibold text-[#35F9D1] pb-2">Trans-nyaBli</h1>
        <p>CUSTOMER</p>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit(handleForm)}>
        <div className="">
          <h1 className="text-center pb-5">Create your account</h1>

          {/* Input Name */}
          <div className="pb-5">
            <InputForm
              {...register("name", {
                required: {
                  message: "Name Kosong",
                  value: true,
                },
              })}
              title="Name"
              logo={<IoMdPerson className="text-[#1A443B] text-xl" />}
              className="py-3.5 px-4"
              error={errors?.name?.message}
            />
          </div>

          {/* Input Phone */}
          <div className="pb-5">
            <InputForm
              {...register("phone", {
                required: {
                  message: "Phone Kosong",
                  value: true,
                },
              })}
              title="Phone"
              logo={<MdLocalPhone className="text-[#1A443B] text-xl" />}
              className="py-3.5 px-4"
              error={errors?.phone?.message}
            />
          </div>

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
              logo={<MdEmail className="text-[#1A443B] text-xl" />}
              className="py-3.5 px-4"
              error={errors?.email?.message}
            />
          </div>

          {/* Input Password */}
          <div className="pb-10">
            <InputForm
              {...register("password", {
                required: {
                  message: "Password Kosong",
                  value: true,
                },
              })}
              title="Password"
              logo={<IoIosLock className="text-[#1A443B] text-2xl" />}
              className="py-3 px-3.5"
              error={errors?.password?.message}
            />
          </div>
        </div>

        <div className="pb-7">
          <h1 className="text-[#35F9D1]">{`Referral code (if have)`}</h1>
          <input
            type="number"
            placeholder="Input your referral code"
            className="border-b-2 w-full py-3 border-[#4D4D4D]"
          />
        </div>

        {/* Button Register */}
        <div className="pb-10">
          <button
            type="submit"
            className="w-full bg-[#35F9D1] font-semibold text-[#1A443B] py-3 rounded-xl"
          >
            Register
          </button>
        </div>
      </form>
    </div>
  );
}
