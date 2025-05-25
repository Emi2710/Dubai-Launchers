"use client";

import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { supabase } from "@/lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  MapPin,
  Calendar,
  Flag,
} from "lucide-react";

type Gender = "Male" | "Female";

type FormData = {
  firstName: string;
  lastName: string;
  gender: Gender;
  dob: string;
  placeOfBirth: string;
  countryBirth: string;
  nationality: string;
  passportFile: File | null;
  idcardFile: File | null;
};

export default function UserProfileForm() {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    gender: "Male",
    dob: "",
    placeOfBirth: "",
    countryBirth: "",
    nationality: "",
    passportFile: null,
    idcardFile: null,
  });

  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [active, setActive] = useState<boolean | null>(null);
  const [comment, setComment] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const BUCKET_NAME = "documents";

  // Load user profile on mount
  useEffect(() => {
    async function loadUserProfile() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setMessage("User not authenticated.");
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from("users_profiles")
        .select(
          "first_name,last_name,gender,dob,place_of_birth,country_birth,nationality,active,comment"
        )
        .eq("user_id", user.id)
        .single();

      if (error) {
        setMessage("Failed to load user profile.");
      } else if (data) {
        setFormData((prev) => ({
          ...prev,
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          gender: data.gender || "Male",
          dob: data.dob || "",
          placeOfBirth: data.place_of_birth || "",
          countryBirth: data.country_birth || "",
          nationality: data.nationality || "",
          passportFile: null,
          idcardFile: null,
        }));
        setActive(data.active);
        setComment(data.comment);
      }
    }

    loadUserProfile();
  }, []);

  function handleInputChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSelectChange(name: string, value: string) {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, files } = e.target;
    if (!files || files.length === 0) return;

    setFormData((prev) => ({
      ...prev,
      [name]: files[0],
    }));
  }

  async function uploadFile(userId: string, file: File) {
    const fileName = uuidv4();
    const fileExt = file.name.split(".").pop();
    const filePath = `${userId}/${fileName}`;
    const metadata = {
      original_filename: file.name,
      file_extension: fileExt,
    };

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
        metadata,
      });

    if (error) throw error;
    return filePath;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setUploading(true);
    setMessage(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setMessage("User not authenticated.");
        setUploading(false);
        return;
      }

      let passport_path = null;
      let idcard_path = null;

      if (formData.passportFile) {
        passport_path = await uploadFile(user.id, formData.passportFile);
      }

      if (formData.idcardFile) {
        idcard_path = await uploadFile(user.id, formData.idcardFile);
      }

      const { error: upsertError } = await supabase
        .from("users_profiles")
        .upsert(
          {
            user_id: user.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            gender: formData.gender,
            dob: formData.dob,
            place_of_birth: formData.placeOfBirth,
            country_birth: formData.countryBirth,
            nationality: formData.nationality,
            ...(passport_path && { passport_path }),
            ...(idcard_path && { idcard_path }),
            updated_at: new Date().toISOString(),
            active: false, // ❗ set to false to trigger admin re-validation
          },
          { onConflict: "user_id" }
        );

      if (upsertError) {
        setMessage(`Failed to save profile: ${upsertError.message}`);
      } else {
        setMessage("Profile saved successfully!");
        setActive(false); // also update local state
        setFormData((prev) => ({
          ...prev,
          passportFile: null,
          idcardFile: null,
        }));
      }
    } catch (error) {
      setMessage("Unexpected error occurred.");
    }

    setUploading(false);
  }

  // Désactiver le formulaire si active est false
  const isDisabled = active !== true;

  const getStatusBadge = () => {
    if (active === null) {
      return (
        <Badge variant="secondary" className="gap-1">
          <Clock className="w-3 h-3" />
          En attente
        </Badge>
      );
    }
    if (active === true) {
      return (
        <Badge
          variant="default"
          className="gap-1 bg-green-500 hover:bg-green-600"
        >
          <CheckCircle className="w-3 h-3" />
          Approuvé
        </Badge>
      );
    }
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertTriangle className="w-3 h-3" />
        Refusé
      </Badge>
    );
  };

  const FileUploadField = ({
    name,
    label,
    file,
    disabled,
  }: {
    name: string;
    label: string;
    file: File | null;
    disabled: boolean;
  }) => (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={name}
          type="file"
          name={name}
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileChange}
          disabled={disabled}
          className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
        />
        {file && (
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="w-4 h-4" />
            <span className="truncate">{file.name}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profil Utilisateur
              </CardTitle>
              <CardDescription>
                Gérez vos informations personnelles et documents d&apos;identité
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Status Alert */}
          {active === true && comment && (
            <Alert className="mb-6 border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive">
              <AlertDescription className="space-y-2">
                <p className="font-medium">
                  ⚠️ Vos documents ont été refusés. Merci de corriger et
                  réessayer.
                </p>
                <div className="bg-destructive/10 p-3 rounded-md">
                  <p className="text-sm">
                    <strong>Commentaire :</strong> {comment}
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <User className="w-5 h-5" />
                Informations personnelles
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    disabled={isDisabled}
                    placeholder="Votre prénom"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    disabled={isDisabled}
                    placeholder="Votre nom"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Genre *</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) =>
                      handleSelectChange("gender", value)
                    }
                    disabled={isDisabled}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez votre genre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Homme</SelectItem>
                      <SelectItem value="Female">Femme</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob" className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Date de naissance *
                  </Label>
                  <Input
                    id="dob"
                    name="dob"
                    type="date"
                    value={formData.dob}
                    onChange={handleInputChange}
                    required
                    disabled={isDisabled}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Location Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <MapPin className="w-5 h-5" />
                Informations de naissance
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="placeOfBirth">Ville de naissance *</Label>
                  <Input
                    id="placeOfBirth"
                    name="placeOfBirth"
                    value={formData.placeOfBirth}
                    onChange={handleInputChange}
                    required
                    disabled={isDisabled}
                    placeholder="Ville de naissance"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="countryBirth">Pays de naissance *</Label>
                  <Input
                    id="countryBirth"
                    name="countryBirth"
                    value={formData.countryBirth}
                    onChange={handleInputChange}
                    required
                    disabled={isDisabled}
                    placeholder="Pays de naissance"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label
                    htmlFor="nationality"
                    className="flex items-center gap-1"
                  >
                    <Flag className="w-4 h-4" />
                    Nationalité *
                  </Label>
                  <Input
                    id="nationality"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    required
                    disabled={isDisabled}
                    placeholder="Votre nationalité"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Documents Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <FileText className="w-5 h-5" />
                Documents d&apos;identité
              </div>
              <p className="text-sm text-muted-foreground">
                Formats acceptés : PDF, DOC, DOCX, TXT
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FileUploadField
                  name="passportFile"
                  label="Passeport"
                  file={formData.passportFile}
                  disabled={isDisabled}
                />

                <FileUploadField
                  name="idcardFile"
                  label="Carte d'identité"
                  file={formData.idcardFile}
                  disabled={isDisabled}
                />
              </div>
            </div>

            <Separator />

            {/* Submit Button */}
            <div className="flex flex-col gap-4">
              <Button
                type="submit"
                disabled={uploading || isDisabled}
                className="w-full"
                size="lg"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Sauvegarde en cours...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Sauvegarder le profil
                  </>
                )}
              </Button>
            </div>

            {/* Success/Error Messages */}
            {message && (
              <Alert
                className={
                  message.includes("successfully")
                    ? "border-green-500 text-green-700"
                    : "border-destructive text-destructive"
                }
              >
                {message.includes("successfully") ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
