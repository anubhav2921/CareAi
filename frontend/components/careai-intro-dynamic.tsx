"use client";

import dynamic from "next/dynamic";

export const CareAIIntro = dynamic(
  () => import("@/components/careai-intro").then((mod) => mod.CareAIIntro),
  {
    ssr: false,
  }
);
