import { Suspense } from "react";
import PlanoOcupacion from "@/components/PlanoOcupacion/PlanoOcupacion";

export default function PlanoPage() {
  return (
    <Suspense fallback={null}>
      <PlanoOcupacion />
    </Suspense>
  );
}
