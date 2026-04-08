import { Suspense } from "react";
import GestionView from "@/components/Gestion/GestionView";

export default function GestionPage() {
  return (
    <Suspense fallback={null}>
      <GestionView />
    </Suspense>
  );
}
