"use client";

import { use } from "react";
import { ResultPage } from "@/components/ResultPage";

type ProfileRouteProps = {
  params: Promise<{ token: string }>;
};

export default function SharedProfileRoute({ params }: ProfileRouteProps) {
  const { token } = use(params);
  return <ResultPage shareToken={token} />;
}
