import React from "react";
import { MdEmail } from "react-icons/md";
import { IoIosLock } from "react-icons/io";
import { FaMinus } from "react-icons/fa6";
// import { FaGoogle } from "react-icons/fa";
import { FaFacebookF } from "react-icons/fa";
// import { FaTwitter } from "react-icons/fa";
import GoogleIcon from "@/assets/googleIcon";
import TwitterIcon from "@/assets/twitterIcon";

export default function LoginPage() {
  return (
    <div className="px-10">
      <div className="pt-20 text-center pb-15">
        <h1 className="text-4xl font-semibold text-[#35F9D1]">TRANSME</h1>
        <p>PASSENGER BUS</p>
      </div>

      {/* Input */}
      <div className="pb-5">
        <h1 className="text-center pb-5">Login to your account</h1>

        {/* Input Email */}
        <div className="flex items-center pb-5">
          <div className="bg-[#35F9D1] py-3.5 px-4 rounded-l-xl border-1 border-[#35F9D1]">
            <MdEmail className="text-[#1A443B] text-xl" />
          </div>
          <input
            placeholder="Email"
            className="border-1 rounded-r-xl w-full py-3 px-5 border-[#4D4D4D]"
          />
        </div>

        {/* Input Password */}
        <div className="flex items-center pb-3">
          <div className="bg-[#35F9D1] py-3 px-3.5 rounded-l-xl border-1 border-[#35F9D1]">
            <IoIosLock className="text-[#1A443B] text-2xl" />
          </div>
          <input
            placeholder="Password"
            className="border-1 rounded-r-xl w-full py-3 px-5 border-[#4D4D4D]"
          />
        </div>

        {/* Forgot password */}
        <div className="text-end">
          <button className="text-sm text-[#35F9D1]">Forgot password?</button>
        </div>
      </div>

      {/* Button Login */}
      <div className="pb-10">
        <button className="w-full bg-[#35F9D1] font-semibold text-[#1A443B] py-3 rounded-xl">
          Login
        </button>
      </div>

      <div className="flex justify-center gap-x-3 items-center pb-5 text-sm">
        <FaMinus className="text-[#35F9D1]" />
        <p>Or login with</p>
        <FaMinus className="text-[#35F9D1]" />
      </div>

      {/* Logo sosmed */}
      <div className="flex justify-center items-center gap-x-10 text-3xl pb-5">
        <div className="border-1 p-4 rounded-lg border-[#35F9D1]">
          {/* <FaGoogle className="text-[#35F9D1]" /> */}
          <GoogleIcon size={30} />
        </div>
        <div className="border-1 p-4 rounded-lg border-[#35F9D1]">
          <FaFacebookF className="text-[#35F9D1]" />
        </div>
        <div className="border-1 p-4 rounded-lg border-[#35F9D1]">
          {/* <FaTwitter className="text-[#35F9D1]" /> */}
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
