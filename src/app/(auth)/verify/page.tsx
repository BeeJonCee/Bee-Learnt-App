"use client";

import { Suspense } from "react";
import VerifyPageContent from "./verify-content";

function VerifyPageSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      Loading...
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<VerifyPageSkeleton />}>
      <VerifyPageContent />
    </Suspense>
  );
}
