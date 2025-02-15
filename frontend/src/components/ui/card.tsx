import * as React from "react";

export function Card({ children, className }: any) {
  return <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>{children}</div>;
}

export function CardHeader({ children }: any) {
  return <div className="mb-4">{children}</div>;
}

export function CardTitle({ children }: any) {
  return <h2 className="text-2xl font-bold">{children}</h2>;
}

export function CardContent({ children }: any) {
  return <div className="space-y-4">{children}</div>;
}
