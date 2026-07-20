import Link from "next/link";

import { getHomeDescription } from "../config/converters";
import type { Converter } from "../config/converters";

type ConverterCardProps = Readonly<{
  converter: Converter;
}>;

export function ConverterCard({ converter }: ConverterCardProps) {
  return (
    <Link
      href={converter.route}
      className="group flex aspect-square flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white p-8 shadow-lg transition-all duration-300 hover:border-indigo-200 hover:shadow-xl"
    >
      <span
        aria-hidden="true"
        className="mb-4 text-6xl transition-transform group-hover:scale-110"
      >
        {converter.icon}
      </span>
      <h2 className="mb-2 text-center text-xl font-bold text-slate-800">
        {converter.title}
      </h2>
      <p className="text-center text-sm text-slate-500">
        {getHomeDescription(converter)}
      </p>
      <span className="mt-4 font-semibold text-indigo-600 transition-transform group-hover:translate-x-1">
        Converter →
      </span>
    </Link>
  );
}
