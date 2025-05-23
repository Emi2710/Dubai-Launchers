"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Loader2,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Action = {
  id: string;
  title: string;
};

export default function UpcomingActions({ clientId }: { clientId: string }) {
  const [actions, setActions] = useState<Action[]>([]);
  const [newAction, setNewAction] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const newInputRef = useRef<HTMLInputElement>(null);

  const fetchActions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("upcoming_actions")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setActions(data || []);
    } catch (error) {
      console.error("Error fetching actions:", error);
    } finally {
      setLoading(false);
    }
  };

  const addAction = async () => {
    if (!newAction.trim()) return;

    setActionLoading("new");
    try {
      const { error } = await supabase.from("upcoming_actions").insert({
        client_id: clientId,
        title: newAction,
      });

      if (error) throw error;
      setNewAction("");
      fetchActions();
    } catch (error) {
      console.error("Error adding action:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteAction = async (id: string) => {
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from("upcoming_actions")
        .delete()
        .eq("id", id);
      if (error) throw error;
      fetchActions();
    } catch (error) {
      console.error("Error deleting action:", error);
    } finally {
      setActionLoading(null);
      setDeleteConfirm(null);
    }
  };

  const startEditing = (action: Action) => {
    setEditingId(action.id);
    setEditText(action.title);
    // Focus the edit input after rendering
    setTimeout(() => {
      if (editInputRef.current) {
        editInputRef.current.focus();
      }
    }, 0);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText("");
  };

  const saveEdit = async () => {
    if (!editText.trim() || !editingId) return;

    setActionLoading(editingId);
    try {
      const { error } = await supabase
        .from("upcoming_actions")
        .update({ title: editText })
        .eq("id", editingId);
      if (error) throw error;
      setEditingId(null);
      setEditText("");
      fetchActions();
    } catch (error) {
      console.error("Error updating action:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, type: "new" | "edit") => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (type === "new") {
        addAction();
      } else {
        saveEdit();
      }
    } else if (e.key === "Escape" && type === "edit") {
      cancelEditing();
    }
  };

  useEffect(() => {
    fetchActions();
  }, [clientId]);

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Actions à venir
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-6">
          <div className="relative flex-grow">
            <Input
              ref={newInputRef}
              type="text"
              value={newAction}
              onChange={(e) => setNewAction(e.target.value)}
              placeholder="Nouvelle action (ex: Télécharger ta photo biométrique)"
              onKeyDown={(e) => handleKeyDown(e, "new")}
              disabled={actionLoading === "new"}
              className="pr-10"
            />
            {actionLoading === "new" && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
          <Button
            onClick={addAction}
            disabled={!newAction.trim() || actionLoading === "new"}
          >
            <Plus className="mr-1 h-4 w-4" /> Ajouter
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-8 flex-grow" />
                <Skeleton className="h-9 w-16" />
                <Skeleton className="h-9 w-16" />
              </div>
            ))}
          </div>
        ) : actions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
            <ClipboardList className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-medium">Aucune action</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Ajoutez votre première action en utilisant le formulaire
              ci-dessus.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {actions.map((action) => (
              <li
                key={action.id}
                className={cn(
                  "flex items-center gap-2 rounded-md border p-3 transition-all",
                  editingId === action.id
                    ? "border-blue-200 bg-blue-50"
                    : "hover:bg-muted/50"
                )}
              >
                {editingId === action.id ? (
                  <div className="flex flex-grow items-center gap-2">
                    <div className="relative flex-grow">
                      <Input
                        ref={editInputRef}
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, "edit")}
                        disabled={actionLoading === action.id}
                        className="pr-10"
                      />
                      {actionLoading === action.id && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={saveEdit}
                      disabled={!editText.trim() || actionLoading === action.id}
                      className="h-9"
                    >
                      <Save className="mr-1 h-4 w-4" /> Enregistrer
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={cancelEditing}
                      disabled={actionLoading === action.id}
                      className="h-9"
                    >
                      <X className="mr-1 h-4 w-4" /> Annuler
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="flex-grow">{action.title}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEditing(action)}
                      disabled={!!actionLoading}
                      className="h-9"
                    >
                      <Pencil className="mr-1 h-4 w-4" /> Modifier
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteConfirm(action.id)}
                      disabled={!!actionLoading}
                      className="h-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      {actionLoading === action.id ? (
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="mr-1 h-4 w-4" />
                      )}{" "}
                      Supprimer
                    </Button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}

        <AlertDialog
          open={!!deleteConfirm}
          onOpenChange={(open: any) => !open && setDeleteConfirm(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action ne peut pas être annulée. Cette action sera
                définitivement supprimée.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteConfirm && deleteAction(deleteConfirm)}
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
