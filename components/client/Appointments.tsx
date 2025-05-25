"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Clock,
  ExternalLink,
  CalendarDays,
  AlertCircle,
  CheckCircle,
  XCircle,
  Hourglass,
} from "lucide-react";
import Link from "next/link";

type Appointment = {
  type: string;
  date: string;
  status: string;
  location: string;
  action_text: string;
  action_url: string;
};

const getStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case "confirmé":
    case "confirmed":
      return "default";
    case "en attente":
    case "pending":
      return "secondary";
    case "annulé":
    case "cancelled":
      return "destructive";
    case "terminé":
    case "completed":
      return "outline";
    default:
      return "secondary";
  }
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "confirmé":
    case "confirmed":
      return <CheckCircle className="w-3 h-3" />;
    case "en attente":
    case "pending":
      return <Hourglass className="w-3 h-3" />;
    case "annulé":
    case "cancelled":
      return <XCircle className="w-3 h-3" />;
    case "terminé":
    case "completed":
      return <CheckCircle className="w-3 h-3" />;
    default:
      return <Clock className="w-3 h-3" />;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    time: date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};

export default function UserAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      setError(null);

      // Get logged-in user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError(
          "Erreur utilisateur: " +
            (userError?.message || "Utilisateur non connecté")
        );
        setLoading(false);
        return;
      }

      // Fetch appointments where client_id = logged-in user id
      const { data, error: appointmentsError } = await supabase
        .from("appointments")
        .select("type, date, status, location, action_text, action_url")
        .eq("client_id", user.id)
        .order("date", { ascending: true });

      if (appointmentsError) {
        setError(
          "Erreur récupération des rendez-vous: " + appointmentsError.message
        );
        setLoading(false);
        return;
      }

      setAppointments(data || []);
      setLoading(false);
    };

    fetchAppointments();
  }, []);

  if (loading) {
    return (
      <Card className="mt-6 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg sm:text-xl">
              Mes rendez-vous
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 p-3 sm:p-4 border rounded-lg"
            >
              <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-full mx-auto sm:mx-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-full sm:w-[250px]" />
                <Skeleton className="h-3 w-3/4 sm:w-[200px] mx-auto sm:mx-0" />
              </div>
              <Skeleton className="h-8 w-full sm:w-[100px]" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mt-6 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            <CardTitle className="text-xl">Mes rendez-vous</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (appointments.length === 0) {
    return (
      <Card className="mt-6 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg sm:text-xl">
              Mes rendez-vous
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="text-center py-8 sm:py-12">
            <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-muted-foreground mb-2">
              Aucun rendez-vous
            </h3>
            <p className="text-sm text-muted-foreground px-4">
              Vous n&apos;avez aucun rendez-vous programmé pour le moment.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg sm:text-xl">
              Mes rendez-vous
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-xs w-fit">
            {appointments.length} rendez-vous
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div className="space-y-3 sm:space-y-4">
          {appointments.map((appt, i) => {
            const { date, time } = formatDate(appt.date);
            return (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-3 sm:gap-4"
              >
                {/* Mobile: Stacked layout, Desktop: Horizontal layout */}
                <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Title and Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                      <h3 className="font-medium text-foreground text-sm sm:text-base truncate">
                        {appt.type}
                      </h3>
                      <Badge
                        variant={getStatusVariant(appt.status)}
                        className="flex items-center gap-1 text-xs w-fit"
                      >
                        {getStatusIcon(appt.status)}
                        {appt.status}
                      </Badge>
                    </div>

                    {/* Date/Time and Location - Stacked on mobile */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        <span>
                          {date} à {time}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{appt.location}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Button - Full width on mobile */}
                <div className="flex-shrink-0 w-full sm:w-auto sm:ml-4">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto h-9 sm:h-8"
                  >
                    <Link
                      href={appt.action_url}
                      className="flex items-center justify-center gap-1 text-xs sm:text-sm"
                    >
                      {appt.action_text}
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
