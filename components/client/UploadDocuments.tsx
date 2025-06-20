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
  Briefcase,
} from "lucide-react";
import { da } from "date-fns/locale";

type Gender = "Homme" | "Femme";

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
  activity: string;
  trade_name1: string;
  trade_name2: string;
  trade_name3: string;
  residenceAddress: string;
  email: string;
  mobileNumber: string;
  lastDiploma: string;
  dadName: string;
  momName: string;
  religion: string;
  maritalStatus: string;
  arrivalDateDubai: string;
};

export default function UserProfileForm() {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    gender: "Homme",
    dob: "",
    placeOfBirth: "",
    countryBirth: "",
    nationality: "",
    passportFile: null,
    idcardFile: null,
    activity: "",
    trade_name1: "",
    trade_name2: "",
    trade_name3: "",
    residenceAddress: "",
    email: "",
    mobileNumber: "",
    lastDiploma: "",
    dadName: "",
    momName: "",
    religion: "",
    maritalStatus: "",
    arrivalDateDubai: "",
  });

  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [active, setActive] = useState<boolean | null>(null);
  const [comment, setComment] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [passportUrl, setPassportUrl] = useState<string | null>(null);
  const [idcardUrl, setIdcardUrl] = useState<string | null>(null);

  const BUCKET_NAME = "documents";

  // Load user profile on mount
  useEffect(() => {
    async function loadUserProfile() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setMessage("L'utilisateur n'est pas authentifié.");
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from("users_profiles")
        .select(
          "first_name,last_name,gender,dob,place_of_birth, passport_path, idcard_path, country_birth,nationality,active,comment,activity,trade_name1, trade_name2,trade_name3, residence_address, email,mobile_number, last_diploma,dadName,momName,religion, marital_status,arrival_date_dubai"
        )
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.log("Failed to load user profile.", error);
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
          activity: data.activity || "",
          trade_name1: data.trade_name1 || "",
          trade_name2: data.trade_name2 || "",
          trade_name3: data.trade_name3 || "",
          residenceAddress: data.residence_address || "",
          email: data.email || "",
          mobileNumber: data.mobile_number || "",
          lastDiploma: data.last_diploma || "",
          dadName: data.dadName || "",
          momName: data.momName || "",
          religion: data.religion || "",
          maritalStatus: data.marital_status || "",
          arrivalDateDubai: data.arrival_date_dubai || "",
        }));
        setPassportUrl(data.passport_path);
        setIdcardUrl(data.idcard_path);
        setActive(data.active);
        setComment(data.comment);
      }

      if (data?.passport_path) {
        const { data: passportData } = await supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(data.passport_path);
        setPassportUrl(passportData?.publicUrl || null);
      }

      if (data?.idcard_path) {
        const { data: idcardData } = await supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(data.idcard_path);
        setIdcardUrl(idcardData?.publicUrl || null);
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
        setMessage("L'utilisateur n'est pas authentifié.");
        setUploading(false);
        return;
      }

      let passport_path = null;
      let idcard_path = null;

      if (formData.passportFile) {
        if (passportUrl) {
          const oldPath = passportUrl.split(`${BUCKET_NAME}/`)[1];
          await supabase.storage.from(BUCKET_NAME).remove([oldPath]);
        }
        passport_path = await uploadFile(user.id, formData.passportFile);
      }

      if (formData.idcardFile) {
        if (idcardUrl) {
          const oldPath = idcardUrl.split(`${BUCKET_NAME}/`)[1];
          await supabase.storage.from(BUCKET_NAME).remove([oldPath]);
        }
        idcard_path = await uploadFile(user.id, formData.idcardFile);
      }

      const { error: upsertError } = await supabase
        .from("users_profiles")
        .upsert({
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
          active: false,
          activity: formData.activity,
          trade_name1: formData.trade_name1,
          trade_name2: formData.trade_name2,
          trade_name3: formData.trade_name3,
          residence_address: formData.residenceAddress,
          email: formData.email,
          mobile_number: formData.mobileNumber,
          last_diploma: formData.lastDiploma,
          dadName: formData.dadName,
          momName: formData.momName,
          religion: formData.religion,
          marital_status: formData.maritalStatus,
          arrival_date_dubai: formData.arrivalDateDubai,
        });

      if (upsertError) {
        setMessage(
          "Il semble y avoir eu une erreur. Veuillez remplir tout les champs"
        );
        /*console.log(`Failed to save profile: ${upsertError.message}`);*/
      } else {
        setMessage("Votre profil a été sauvegardé avec succès");
        setActive(false); // also update local state
        setFormData((prev) => ({
          ...prev,
          passportFile: null,
          idcardFile: null,
        }));
      }
    } catch (error) {
      setMessage("Il semble y avoir eu une erreur");
      console.log(error);
    }

    setUploading(false);
  }

  // Désactiver le formulaire si active est false
  const isDisabled = active === false;

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
    fileUrl,
    disabled,
  }: {
    name: string;
    label: string;
    file: File | null;
    fileUrl?: string | null;
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
          className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 min-h-[50px]"
        />
        {file && (
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="w-4 h-4" />
            <span className="truncate">{file.name}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeFile(name as "passportFile" | "idcardFile")}
              className="text-gray-500 hover:text-red-700"
            >
              ✕
            </Button>

            {!file && fileUrl && (
              <div className="mt-2 text-sm text-muted-foreground">
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-600 hover:text-blue-800"
                >
                  Voir le fichier existant
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const removeFile = (
    name: keyof Pick<FormData, "passportFile" | "idcardFile">
  ) => {
    setFormData((prev) => ({
      ...prev,
      [name]: null,
    }));
  };

  return (
    <div className="max-w-2xl mx-a p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profil Utilisateur
              </CardTitle>
              <CardDescription className="pt-3">
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
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Briefcase className="w-5 h-5" />
                Informations de l&apos;entreprise
              </div>

              <div className="space-y-2">
                <Label htmlFor="activity">Activité principale *</Label>
                <Select
                  value={formData.activity}
                  onValueChange={(value) =>
                    handleSelectChange("activity", value)
                  }
                  disabled={isDisabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une activité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consulting">Consulting</SelectItem>
                    <SelectItem value="commerce">Commerce</SelectItem>
                    <SelectItem value="import_export">
                      Import / Export
                    </SelectItem>
                    <SelectItem value="it_services">Services IT</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="trade_name1">Nom commercial 1 *</Label>
                  <Input
                    id="trade_name1"
                    name="trade_name1"
                    value={formData.trade_name1}
                    onChange={handleInputChange}
                    disabled={isDisabled}
                    required
                    placeholder="Premier choix"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trade_name2">Nom commercial 2*</Label>
                  <Input
                    id="trade_name2"
                    name="trade_name2"
                    value={formData.trade_name2}
                    onChange={handleInputChange}
                    disabled={isDisabled}
                    required
                    placeholder="Deuxième choix"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trade_name3">Nom commercial 3*</Label>
                  <Input
                    id="trade_name3"
                    name="trade_name3"
                    value={formData.trade_name3}
                    onChange={handleInputChange}
                    disabled={isDisabled}
                    required
                    placeholder="Troisième choix"
                  />
                </div>
              </div>
              <p className="text-xs opacity-80 py-3">
                *Remplissez en fonction de votre ordre de préférence
              </p>
            </div>
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
                  <Label htmlFor="dob" className="flex items-center gap-1 mt-2">
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
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="residenceAddress">
                    Adresse postale (pays de résidence)*
                  </Label>
                  <Input
                    id="residenceAddress"
                    name="residenceAddress"
                    value={formData.residenceAddress}
                    onChange={handleInputChange}
                    disabled={isDisabled}
                    required
                    placeholder="Adresse complète"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Adresse email*</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isDisabled}
                    required
                    placeholder="votre@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobileNumber">Numéro de téléphone*</Label>
                  <Input
                    id="mobileNumber"
                    name="mobileNumber"
                    type="tel"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    disabled={isDisabled}
                    required
                    placeholder="+971..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastDiploma">Dernier diplôme obtenu*</Label>
                  <Input
                    id="lastDiploma"
                    name="lastDiploma"
                    value={formData.lastDiploma}
                    onChange={handleInputChange}
                    disabled={isDisabled}
                    required
                    placeholder="Ex. Licence, Master..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dadName">Nom du père*</Label>
                  <Input
                    id="dadName"
                    name="dadName"
                    value={formData.dadName}
                    onChange={handleInputChange}
                    disabled={isDisabled}
                    required
                    placeholder="Nom du père"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="momName">Nom de la mère*</Label>
                  <Input
                    id="momName"
                    name="momName"
                    value={formData.momName}
                    onChange={handleInputChange}
                    disabled={isDisabled}
                    required
                    placeholder="Nom de la mère"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="religion">Religion*</Label>
                  <Input
                    id="religion"
                    name="religion"
                    value={formData.religion}
                    onChange={handleInputChange}
                    required
                    disabled={isDisabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maritalStatus">Statut marital*</Label>
                  <Select
                    value={formData.maritalStatus}
                    onValueChange={(value) =>
                      handleSelectChange("maritalStatus", value)
                    }
                    required
                    disabled={isDisabled}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="célibataire">Célibataire</SelectItem>
                      <SelectItem value="marié(e)">Marié(e)</SelectItem>
                      <SelectItem value="divorcé(e)">Divorcé(e)</SelectItem>
                      <SelectItem value="veuf(ve)">Veuf(ve)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="arrivalDateDubai">
                    Date approximative d&apos;arrivée à Dubai*
                  </Label>
                  <Input
                    id="arrivalDateDubai"
                    name="arrivalDateDubai"
                    type="date"
                    value={formData.arrivalDateDubai}
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
                  fileUrl={passportUrl}
                  disabled={isDisabled}
                />

                <FileUploadField
                  name="idcardFile"
                  label="Carte d'identité"
                  file={formData.idcardFile}
                  fileUrl={idcardUrl}
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
                  message.includes("succès")
                    ? "border-green-500 text-green-700"
                    : "border-destructive text-destructive"
                }
              >
                {message.includes("succès") ? (
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
