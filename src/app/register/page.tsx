"use client";

import InputForm from "@/components/InputForm";
import React, { useState } from "react";
import { MdEmail } from "react-icons/md";
import { IoMdPerson } from "react-icons/io";
import { useForm } from "react-hook-form";
import { MdLocalPhone } from "react-icons/md";
import { IoIosLock } from "react-icons/io";
import axios from "axios";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
  email: z.string().min(1, "Email wajib diisi").email(),
  phone: z
    .string()
    .min(1, "Phone wajib diisi")
    .max(12, "Nomor Maksimun 12 angka"),
});

export type TRegister = z.infer<typeof schema>;

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TRegister>({
    resolver: zodResolver(schema),
  });
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(false);

  const handleForm = async (data: TRegister) => {
    setLoading(true);
    try {
      const res = await axios.post("/api/register", {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
      });

      axios.put("", {}, {
        headers: {
          Authorization: localStorage.get('Token')
        }
      })
      setUser(res.data);
      console.log(user);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  console.log("error:", errors);

  return (
    <div className="px-10">
      <div className="pt-20 text-center pb-15">
        <h1 className="text-4xl font-semibold text-[#35F9D1] pb-2">TransBli</h1>
        <p>CUSTOMER</p>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit(handleForm)}>
        <div className="">
          <h1 className="text-center pb-5">Create your account</h1>

          {/* Input Name */}
          <div className="pb-5">
            <InputForm
              {...register("name")}
              title="Name"
              logo={<IoMdPerson className="text-[#1A443B] text-xl" />}
              className="py-3.5 px-4"
              error={errors?.name?.message}
            />
          </div>

          {/* Input Phone */}
          <div className="pb-5">
            <InputForm
              {...register("phone")}
              title="Phone"
              logo={<MdLocalPhone className="text-[#1A443B] text-xl" />}
              className="py-3.5 px-4"
              error={errors?.phone?.message}
            />
          </div>

          {/* Input Email */}
          <div className="pb-5">
            <InputForm
              {...register("email")}
              title="Email"
              logo={<MdEmail className="text-[#1A443B] text-xl" />}
              className="py-3.5 px-4"
              error={errors?.email?.message}
            />
          </div>

          {/* Input Password */}
          <div className="pb-10">
            <InputForm
              {...register("password")}
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
            className={`w-full bg-[#35F9D1] font-semibold text-[#1A443B] py-3 rounded-xl ${
              loading && "opacity-50"
            }`}
            disabled={loading}
          >
            Register
          </button>
        </div>
      </form>
    </div>
  );
}
