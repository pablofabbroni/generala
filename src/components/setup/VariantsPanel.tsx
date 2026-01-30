"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Switch } from "@/components/ui/Switch";
import type { Variants } from "@/types/game";

function Row({ title, desc, checked, onChange }: { title: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="min-w-0">
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-white/60 leading-relaxed">{desc}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export function VariantsPanel({ value, onChange }: { value: Variants; onChange: (patch: Partial<Variants>) => void }) {
  return (
    <Card>
      <CardHeader>
        <div className="text-sm font-semibold">Variantes</div>
        <div className="text-xs text-white/60">Por defecto jugás Clásico. Activá extras si querés.</div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Row
          title="Escalera menor"
          desc="Agrega la categoría de escalera de 4 dados (15 puntos)."
          checked={value.minorStraight}
          onChange={(v) => onChange({ minorStraight: v })}
        />
        <Row
          title="Generala doble"
          desc="Agrega una fila extra 'Generala doble' (100 puntos)."
          checked={value.doubleGenerala}
          onChange={(v) => onChange({ doubleGenerala: v })}
        />
        <Row
          title="Bonus 63"
          desc="Si la suma de 1..6 alcanza 63 o más, suma 35 puntos."
          checked={value.upperBonus63}
          onChange={(v) => onChange({ upperBonus63: v })}
        />
        <div className="text-[11px] text-white/45 px-1">
          Nota: “Servido +5” está disponible como chip dentro del contador (no como variante).
        </div>
      </CardContent>
    </Card>
  );
}
