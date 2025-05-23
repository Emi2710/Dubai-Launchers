"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Plus,
  Edit,
  Trash2,
  Save,
  Loader2,
  CalendarDays,
  CheckCircle,
  AlertCircle,
  Clock3,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const statusOptions = ["confirmé", "à confirmer", "à venir"];

type Appointment = {
  id: string;
  type: string;
  date: string;
  status: string;
  location: string;
  action_text?: string;
  action_url?: string;
  client_id: string;
};

export default function AppointmentList({ clientId }: { clientId: string }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    type: "",
    date: "",
    status: "à venir",
    location: "",
    action_text: "",
    action_url: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, [clientId]);

  const fetchAppointments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("client_id", clientId)
      .order("date", { ascending: true });

    if (!error) setAppointments(data);
    setLoading(false);
  };

  const handleChange = (field: string, value: string) => {
    setNewAppointment((prev) => ({ ...prev, [field]: value }));
  };

  const addAppointment = async () => {
    setSaving(true);
    if (editingId) {
      const { error } = await supabase
        .from("appointments")
        .update(newAppointment)
        .eq("id", editingId);

      if (!error) {
        setEditingId(null);
        resetForm();
        fetchAppointments();
        setModalOpen(false);
      }
    } else {
      const { error } = await supabase
        .from("appointments")
        .insert([{ ...newAppointment, client_id: clientId }]);

      if (!error) {
        resetForm();
        fetchAppointments();
        setModalOpen(false);
      }
    }
    setSaving(false);
  };

  const editAppointment = (appt: Appointment) => {
    setNewAppointment({
      type: appt.type,
      date: appt.date,
      status: appt.status,
      location: appt.location,
      action_text: appt.action_text || "",
      action_url: appt.action_url || "",
    });
    setEditingId(appt.id);
    setModalOpen(true);
  };

  const resetForm = () => {
    setNewAppointment({
      type: "",
      date: "",
      status: "à venir",
      location: "",
      action_text: "",
      action_url: "",
    });
    setEditingId(null);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    setModalOpen(open);
  };

  const deleteAppointment = async (id: string) => {
    const { error } = await supabase.from("appointments").delete().eq("id", id);
    if (!error) fetchAppointments();
    setDeleteConfirm(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmé":
        return (
          <Badge className="bg-green-300">
            <CheckCircle className="mr-1 h-3 w-3" />
            Confirmé
          </Badge>
        );
      case "à confirmer":
        return (
          <Badge className="bg-orange-300">
            <AlertCircle className="mr-1 h-3 w-3" />À confirmer
          </Badge>
        );
      case "à venir":
        return (
          <Badge className="bg-blue-300">
            <Clock3 className="mr-1 h-3 w-3" />À venir
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr });
    } catch {
      return dateString;
    }
  };

  const isFormValid = () => {
    return (
      newAppointment.type.trim() &&
      newAppointment.date &&
      newAppointment.location.trim()
    );
  };

  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Rendez-vous
          </CardTitle>
          <Button
            onClick={() => {
              resetForm();
              setModalOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouveau rendez-vous
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex gap-2">
                      <Skeleton className="h-9 w-20" />
                      <Skeleton className="h-9 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <Alert>
            <Calendar className="h-4 w-4" />
            <AlertDescription>
              Aucun rendez-vous programmé. Cliquez sur &quot;Nouveau
              rendez-vous&quot; pour en ajouter un.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {appointments.map((appt) => (
              <Card
                key={appt.id}
                className="overflow-hidden hover:shadow-md transition-shadow"
              >
                <CardContent className="p-0">
                  <div className="p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">
                          {appt.type}
                        </h3>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span>{formatDate(appt.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-red-500" />
                            <span>{appt.location}</span>
                          </div>
                        </div>
                        {appt.action_text && appt.action_url && (
                          <div className="mt-3">
                            <a
                              href={appt.action_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              <ExternalLink className="h-3 w-3" />
                              {appt.action_text}
                            </a>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col sm:items-end gap-3 w-full sm:w-auto">
                        {getStatusBadge(appt.status)}
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => editAppointment(appt)}
                          >
                            <Edit className="mr-1 h-3 w-3" />
                            Modifier
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDeleteConfirm(appt.id)}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="mr-1 h-3 w-3" />
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Modal for Add/Edit Form */}
        <Dialog open={modalOpen} onOpenChange={handleOpenChange}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Modifier le rendez-vous" : "Nouveau rendez-vous"}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Modifiez les détails du rendez-vous ci-dessous."
                  : "Remplissez les informations pour créer un nouveau rendez-vous."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type de rendez-vous *</Label>
                <Input
                  id="type"
                  placeholder="Ex: Consultation, Réunion..."
                  value={newAppointment.type}
                  onChange={(e) => handleChange("type", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date et heure *</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={newAppointment.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <Select
                  value={newAppointment.status}
                  onValueChange={(value) => handleChange("status", value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        <div className="flex items-center gap-2">
                          {status === "confirmé" && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          {status === "à confirmer" && (
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                          )}
                          {status === "à venir" && (
                            <Clock3 className="h-4 w-4 text-blue-500" />
                          )}
                          {status}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Lieu *</Label>
                <Input
                  id="location"
                  placeholder="Ex: Bureau, Visioconférence..."
                  value={newAppointment.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="action_text">Texte du lien (optionnel)</Label>
                <Input
                  id="action_text"
                  placeholder="Ex: Rejoindre la réunion"
                  value={newAppointment.action_text}
                  onChange={(e) => handleChange("action_text", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="action_url">URL (optionnel)</Label>
                <Input
                  id="action_url"
                  placeholder="https://..."
                  value={newAppointment.action_url}
                  onChange={(e) => handleChange("action_url", e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setModalOpen(false)}
                disabled={saving}
              >
                Annuler
              </Button>
              <Button
                onClick={addAppointment}
                disabled={!isFormValid() || saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingId ? "Mise à jour..." : "Ajout..."}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {editingId ? "Mettre à jour" : "Ajouter"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!deleteConfirm}
          onOpenChange={(open) => !open && setDeleteConfirm(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer ce rendez-vous ? Cette action
                ne peut pas être annulée.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  deleteConfirm && deleteAppointment(deleteConfirm)
                }
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
