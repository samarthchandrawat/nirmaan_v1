import * as React from "react";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary ${className}`}
    {...props}
  />
));
Input.displayName = "Input";
