"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckSquare,
  Clock,
  ArrowRight,
  Calendar,
  AlertCircle,
} from "lucide-react";

type Action = {
  id: string;
  client_id: string;
  title: string;
  created_at: string;
};

export default function UpcomingActions() {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActions = async () => {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Erreur récupération utilisateur:", userError?.message);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("upcoming_actions")
        .select("*")
        .eq("client_id", user.id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Erreur récupération actions:", error.message);
      } else {
        setActions(data);
      }

      setLoading(false);
    };

    fetchActions();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getActionIcon = (index: number) => {
    // Alternate between different icons for visual variety
    const icons = [CheckSquare, Clock, ArrowRight, Calendar];
    const IconComponent = icons[index % icons.length];
    return <IconComponent className="w-4 h-4 text-blue-600" />;
  };

  if (loading) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Prochaines étapes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg border"
                >
                  <Skeleton className="w-4 h-4 rounded-full mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Prochaines étapes
          {actions.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {actions.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {actions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckSquare className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-slate-300 mb-2">
              Tout est à jour !
            </h3>
            <p className="text-slate-600 max-w-sm">
              Aucune action n&apos;est requise de votre part pour le moment.
              Nous vous tiendrons informé des prochaines étapes.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {actions.map((action, index) => (
              <div
                key={action.id}
                className="group flex items-start gap-3 p-4 border-b-[1px] border-slate-200 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <CheckSquare />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-300 font-medium leading-relaxed">
                    {action.title}
                  </p>
                </div>
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
