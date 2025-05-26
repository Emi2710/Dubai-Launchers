"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle,
  Clock,
  Calendar,
  FileText,
  Building,
  CreditCard,
  UserCheck,
  Package,
} from "lucide-react";

type ProgressItem = {
  step: string;
  status: string;
  date: string | null;
};

const steps = [
  "Analyse et Préparation",
  "Création de société",
  "Visa & Emirates ID",
  "Compte Bancaire",
  "Livraison des documents finaux",
];

const stepIcons = {
  "Analyse et Préparation": FileText,
  "Création de société": Building,
  "Visa & Emirates ID": UserCheck,
  "Compte Bancaire": CreditCard,
  "Livraison des documents finaux": Package,
};

export default function Progression() {
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("User not found or error:", userError?.message);
        return;
      }

      const { data, error } = await supabase
        .from("business_progress")
        .select("step, status, date")
        .eq("client_id", user.id);

      if (error) {
        console.error("Erreur de récupération des données:", error.message);
      } else {
        // Make sure all steps exist (fill missing with defaults)
        const completeData: ProgressItem[] = steps.map((step) => {
          const existing = data.find((d) => d.step === step);
          return {
            step,
            status: existing?.status || "à venir",
            date: existing?.date || null,
          };
        });
        setProgress(completeData);
      }

      setLoading(false);
    };

    fetchProgress();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "validé":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Validé
          </Badge>
        );
      case "en cours":
        return (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
            <Clock className="w-3 h-3 mr-1" />
            En cours
          </Badge>
        );
      default:
        return (
          <Badge
            variant="secondary"
            className="bg-slate-100 text-slate-600 border-slate-200"
          >
            <Calendar className="w-3 h-3 mr-1" />À venir
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Non définie";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getStepIcon = (step: string) => {
    const IconComponent = stepIcons[step as keyof typeof stepIcons];
    return IconComponent ? (
      <IconComponent className="w-4 h-4 mr-2 text-slate-600" />
    ) : null;
  };

  if (loading) {
    return (
      <Card className="w-full mt-8">
        <CardHeader>
          <CardTitle>Progression</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop skeleton */}
          <div className="hidden md:block">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Étape</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date prévue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="flex items-center">
                            <Skeleton className="h-4 w-4 mr-2" />
                            <Skeleton className="h-4 w-40" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Mobile skeleton */}
          <div className="md:hidden space-y-4">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Skeleton className="h-4 w-4 mr-2" />
                        <Skeleton className="h-5 w-40" />
                      </div>
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full mt-8 bg-black/20">
      <CardHeader>
        <CardTitle>Progression</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Desktop Table */}
        <div className="hidden md:block">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-black/30">
                  <TableHead className="font-semibold text-white">
                    Étape
                  </TableHead>
                  <TableHead className="font-semibold text-white">
                    Statut
                  </TableHead>
                  <TableHead className="font-semibold text-white">
                    Date prévue
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {progress.map(({ step, status, date }, index) => (
                  <TableRow key={step} className="hover:bg-slate-50/50">
                    <TableCell>
                      <div className="flex items-center">
                        {getStepIcon(step)}
                        <span className="font-medium">{step}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(status)}</TableCell>
                    <TableCell className="text-slate-600">
                      {formatDate(date)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {progress.map(({ step, status, date }, index) => (
            <Card key={step} className="border-l-4 border-l-slate-200">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    {getStepIcon(step)}
                    <h3 className="font-medium text-slate-300">{step}</h3>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500">Statut:</span>
                      {getStatusBadge(status)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500">Date:</span>
                      <span className="text-sm text-slate-600">
                        {formatDate(date)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
