interface IProps {
  size: number;
}

import * as React from "react";
const TwitterIcon = ({ size }: IProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 -4 48 48"
  >
    <title>{"Twitter-color"}</title>
    <path
      fill="#00AAEC"
      fillRule="evenodd"
      d="M48 4.735a19.235 19.235 0 0 1-5.655 1.59A10.076 10.076 0 0 0 46.675.74a19.395 19.395 0 0 1-6.257 2.447C38.627 1.225 36.066 0 33.231 0c-5.435 0-9.844 4.521-9.844 10.098 0 .791.085 1.56.254 2.3C15.456 11.974 8.2 7.96 3.34 1.842A10.281 10.281 0 0 0 2.01 6.925c0 3.502 1.738 6.593 4.38 8.405a9.668 9.668 0 0 1-4.462-1.26v.124c0 4.894 3.395 8.977 7.903 9.901a9.39 9.39 0 0 1-2.595.356c-.634 0-1.254-.061-1.854-.18 1.254 4.01 4.888 6.932 9.199 7.01-3.37 2.71-7.618 4.325-12.23 4.325-.795 0-1.58-.047-2.35-.139C4.359 38.327 9.537 40 15.096 40c18.115 0 28.019-15.385 28.019-28.73 0-.439-.009-.878-.026-1.308A20.211 20.211 0 0 0 48 4.735"
    />
  </svg>
);
export default TwitterIcon;
