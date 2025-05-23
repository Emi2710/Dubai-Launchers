"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, Clock, Loader, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  "Analyse et Préparation",
  "Création de société",
  "Visa & Emirates ID",
  "Compte Bancaire",
  "Livraison des documents finaux",
];

const statusOptions = ["à venir", "en cours", "validé"];

export default function ClientProgress({ clientId }: { clientId: string }) {
  const [progress, setProgress] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProgress = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("business_progress")
        .select("step, status")
        .eq("client_id", clientId);

      if (error) {
        console.error("Erreur récupération:", error.message);
        return;
      }

      const formatted = Object.fromEntries(data.map((d) => [d.step, d.status]));
      setProgress(formatted);
      setLoading(false);
    };

    fetchProgress();
  }, [clientId]);

  const updateStatus = async (step: string, status: string) => {
    const { error } = await supabase
      .from("business_progress")
      .upsert(
        { client_id: clientId, step, status },
        { onConflict: "client_id,step" }
      );

    if (error) {
      alert("Erreur mise à jour: " + error.message);
    } else {
      setProgress((prev) => ({ ...prev, [step]: status }));
    }
  };

  // Get status color class
  const getStatusColorClass = (status: string) => {
    switch (status) {
      default:
        return "";
    }
  };

  // Get status icon and color
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "validé":
        return <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />;
      case "en cours":
        return <Loader2 className="mr-2 h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="mr-2 h-4 w-4 text-slate-500" />;
    }
  };

  // Get status trigger color
  const getStatusTriggerClass = (status: string) => {
    switch (status) {
      case "validé":
        return "border-green-300 text-green-700 hover:bg-green-50 focus:ring-green-500";
      case "en cours":
        return "border-blue-300 text-blue-700 hover:bg-blue-50 focus:ring-blue-500";
      default:
        return "border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-slate-500";
    }
  };

  return (
    <Card className="w-full mt-8">
      <CardHeader>
        <CardTitle>Étapes de création</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step) => {
            const currentStatus = progress[step] || "à venir";
            const statusColorClass = getStatusColorClass(currentStatus);

            return (
              <div
                key={step}
                className={cn("rounded-md border p-4", statusColorClass)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{step}</h3>
                  <Select
                    value={currentStatus}
                    onValueChange={(value) => updateStatus(step, value)}
                  >
                    <SelectTrigger
                      className={cn(
                        "w-[140px] border",
                        getStatusTriggerClass(currentStatus)
                      )}
                      aria-label={`Statut pour ${step}`}
                    >
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          <div className="flex items-center">
                            {getStatusIcon(status)}
                            <span>{status}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
