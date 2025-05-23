"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus } from "lucide-react";
import AddUserForm from "./AddUser";

interface UserFormDialogProps {
  onUserAdded?: () => void;
  trigger?: React.ReactNode;
}

export function UserFormDialog({ onUserAdded, trigger }: UserFormDialogProps) {
  const [open, setOpen] = useState(false);

  const handleUserAdded = () => {
    setOpen(false);
    if (onUserAdded) {
      onUserAdded();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Ajouter un utilisateur
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajouter un nouvel utilisateur</DialogTitle>
          <DialogDescription>
            Remplissez le formulaire ci-dessous pour créer un nouvel
            utilisateur. Un email sera envoyé à l&apos;adresse indiquée.
          </DialogDescription>
        </DialogHeader>
        <AddUserForm onSuccess={handleUserAdded} />
        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setOpen(false)}
          >
            Annuler
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
