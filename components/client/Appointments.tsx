"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

type Appointment = {
  type: string;
  date: string;
  status: string;
  location: string;
  action_text: string;
  action_url: string;
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
        .eq("client_id", user.id);

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
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Mes rendez-vous</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-full mb-2" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Mes rendez-vous</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (appointments.length === 0) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Mes rendez-vous</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Aucun rendez-vous trouvé.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Mes rendez-vous</CardTitle>
      </CardHeader>
      <CardContent>
        <table className="w-full table-auto border-collapse border border-gray-200">
          <thead>
            <tr>
              <th className="border border-gray-300 px-3 py-1 text-left">
                Type
              </th>
              <th className="border border-gray-300 px-3 py-1 text-left">
                Date
              </th>
              <th className="border border-gray-300 px-3 py-1 text-left">
                Statut
              </th>
              <th className="border border-gray-300 px-3 py-1 text-left">
                Lieu
              </th>
              <th className="border border-gray-300 px-3 py-1 text-left">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appt, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-3 py-1">
                  {appt.type}
                </td>
                <td className="border border-gray-300 px-3 py-1">
                  {new Date(appt.date).toLocaleString()}
                </td>
                <td className="border border-gray-300 px-3 py-1">
                  {appt.status}
                </td>
                <td className="border border-gray-300 px-3 py-1">
                  {appt.location}
                </td>
                <td className="border border-gray-300 px-3 py-1">
                  <Link href={appt.action_url}>{appt.action_text}</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
