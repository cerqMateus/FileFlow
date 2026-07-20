import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  ConverterPage,
  listConverters,
  resolveConverter,
} from "@/features/conversion";

type ConverterRouteParams = Readonly<{
  fromFormat: string;
  toFormat: string;
}>;

type ConverterRouteProps = Readonly<{
  params: Promise<ConverterRouteParams>;
}>;

export function generateStaticParams(): ConverterRouteParams[] {
  return listConverters().map(({ fromFormat, toFormat }) => ({
    fromFormat,
    toFormat,
  }));
}

export async function generateMetadata({
  params,
}: ConverterRouteProps): Promise<Metadata> {
  const { fromFormat, toFormat } = await params;
  const converter = resolveConverter(fromFormat, toFormat);

  if (converter === undefined) {
    return {};
  }

  return {
    title: `${converter.title} - FileFlow`,
    description: converter.description,
  };
}

export default async function ConverterRoute({ params }: ConverterRouteProps) {
  const { fromFormat, toFormat } = await params;
  const converter = resolveConverter(fromFormat, toFormat);

  if (converter === undefined) {
    notFound();
  }

  return <ConverterPage converter={converter} />;
}
