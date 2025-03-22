import React, { ReactNode } from "react";

interface IProps {
  title: string;
  logo: ReactNode;
  className?: string;
  error: string | undefined;
}

export default function InputForm(props: IProps) {
  const { title, logo, className, error } = props;
  return (
    <div>
      <div className="flex items-center">
        <div
          className={`bg-[#35F9D1] rounded-l-xl border-1 border-[#35F9D1] ${className}`}
        >
          {logo}
        </div>
        <input
          {...props}
          placeholder={title}
          className="border-1 rounded-r-xl w-full py-3 px-5 border-[#4D4D4D]"
        />
      </div>
      {error && <p className="text-sm pl-15 pt-1 text-red-400">{error}</p>}
    </div>
  );
}
