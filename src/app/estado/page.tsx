import { Suspense } from "react";
import EstadoHabitaciones from "@/components/EstadoHabitaciones/EstadoHabitaciones";

export default function EstadoPage() {
  return (
    <Suspense fallback={null}>
      <EstadoHabitaciones />
    </Suspense>
  );
}
