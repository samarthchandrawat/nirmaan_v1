import * as React from "react";

export const Button = ({ className, children, ...props }: any) => (
  <button
    className={`w-full p-3 bg-primary text-white rounded-lg hover:bg-blue-700 transition ${className}`}
    {...props}
  >
    {children}
  </button>
);
