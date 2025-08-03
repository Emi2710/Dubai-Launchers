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
  X,
  ExternalLink,
} from "lucide-react";

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
      } else {
        setMessage("Votre profil a été sauvegardé avec succès");
        setActive(false);
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

  const isDisabled = active === false;

  const getStatusBadge = () => {
    if (active === true && comment !== null) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="w-3 h-3" />
          Refusé
        </Badge>
      );
    }
  };

  const removeFile = (
    name: keyof Pick<FormData, "passportFile" | "idcardFile">
  ) => {
    setFormData((prev) => ({
      ...prev,
      [name]: null,
    }));
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
    <div className="space-y-3">
      <Label
        htmlFor={name}
        className="text-sm font-medium flex items-center gap-2"
      >
        <FileText className="w-4 h-4" />
        {label}
      </Label>

      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg px-3 py-4 sm:p-4 transition-colors hover:border-muted-foreground/50">
        <Input
          id={name}
          type="file"
          name={name}
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileChange}
          disabled={disabled}
          className="file:mr-4 file:py-2 file:px-4 py-0 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 h-10 sm:h-11"
        />

        {file && (
          <div className="mt-3 p-3 border rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium truncate">{file.name}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  removeFile(name as "passportFile" | "idcardFile")
                }
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const SectionHeader = ({
    icon: Icon,
    title,
  }: {
    icon: any;
    title: string;
  }) => (
    <div className="flex items-center gap-3 pb-4">
      <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg border">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
  );

  return (
    <div className="min-h-screen py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 space-y-4 sm:space-y-8">
        {/* Header Card */}
        <Card className="border">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl border">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  Profil Utilisateur
                </CardTitle>
                <CardDescription className="text-base">
                  Gérez vos informations personnelles et documents
                  d&apos;identité
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">{getStatusBadge()}</div>
            </div>
          </CardHeader>
        </Card>

        {/* Status Alert */}
        {active === true && comment && (
          <Alert className="border-destructive/50">
            <AlertDescription className="space-y-3">
              <p className="font-medium text-destructive">
                ⚠️ Vos documents ont été refusés. Merci de corriger et
                réessayer.
              </p>
              <div className="p-4 rounded-lg border border-destructive/20">
                <p className="text-sm">
                  <strong>Commentaire :</strong> {comment}
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-8">
          {/* Business Information */}
          <Card className="border">
            <CardHeader className="p-4 sm:p-6">
              <SectionHeader
                icon={Briefcase}
                title="Informations de l'entreprise"
              />
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              <div className="space-y-3">
                <Label htmlFor="activity" className="text-sm font-medium">
                  Activité principale *
                </Label>
                <Select
                  value={formData.activity}
                  onValueChange={(value) =>
                    handleSelectChange("activity", value)
                  }
                  disabled={isDisabled}
                >
                  <SelectTrigger className="h-10 sm:h-11">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[
                  {
                    id: "trade_name1",
                    label: "Nom commercial 1 *",
                    placeholder: "Premier choix",
                  },
                  {
                    id: "trade_name2",
                    label: "Nom commercial 2 *",
                    placeholder: "Deuxième choix",
                  },
                  {
                    id: "trade_name3",
                    label: "Nom commercial 3 *",
                    placeholder: "Troisième choix",
                  },
                ].map((field) => (
                  <div key={field.id} className="space-y-3">
                    <Label htmlFor={field.id} className="text-sm font-medium">
                      {field.label}
                    </Label>
                    <Input
                      id={field.id}
                      name={field.id}
                      value={formData[field.id as keyof FormData] as string}
                      onChange={handleInputChange}
                      disabled={isDisabled}
                      required
                      placeholder={field.placeholder}
                      className="h-10 sm:h-11"
                    />
                  </div>
                ))}
              </div>

              <div className="p-3 sm:p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">
                  💡 Remplissez en fonction de votre ordre de préférence
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card className="border">
            <CardHeader className="p-4 sm:p-6">
              <SectionHeader icon={User} title="Informations personnelles" />
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-3">
                  <Label htmlFor="firstName" className="text-sm font-medium">
                    Prénom *
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    disabled={isDisabled}
                    placeholder="Votre prénom"
                    className="h-10 sm:h-11"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="lastName" className="text-sm font-medium">
                    Nom *
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    disabled={isDisabled}
                    placeholder="Votre nom"
                    className="h-10 sm:h-11"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="gender" className="text-sm font-medium">
                    Genre *
                  </Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) =>
                      handleSelectChange("gender", value)
                    }
                    disabled={isDisabled}
                  >
                    <SelectTrigger className="h-10 sm:h-11">
                      <SelectValue placeholder="Sélectionnez votre genre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Homme</SelectItem>
                      <SelectItem value="Female">Femme</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="dob"
                    className="text-sm font-medium flex items-center gap-2"
                  >
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
                    className="h-10 sm:h-11"
                  />
                </div>

                <div className="space-y-3 lg:col-span-2">
                  <Label
                    htmlFor="residenceAddress"
                    className="text-sm font-medium"
                  >
                    Adresse postale (pays de résidence) *
                  </Label>
                  <Input
                    id="residenceAddress"
                    name="residenceAddress"
                    value={formData.residenceAddress}
                    onChange={handleInputChange}
                    disabled={isDisabled}
                    required
                    placeholder="Adresse complète"
                    className="h-10 sm:h-11"
                  />
                </div>

                {[
                  {
                    id: "email",
                    label: "Adresse email *",
                    type: "email",
                    placeholder: "votre@email.com",
                  },
                  {
                    id: "mobileNumber",
                    label: "Numéro de téléphone *",
                    type: "tel",
                    placeholder: "+971...",
                  },
                  {
                    id: "lastDiploma",
                    label: "Dernier diplôme obtenu *",
                    type: "text",
                    placeholder: "Ex. Licence, Master...",
                  },
                  {
                    id: "dadName",
                    label: "Nom du père *",
                    type: "text",
                    placeholder: "Nom du père",
                  },
                  {
                    id: "momName",
                    label: "Nom de la mère *",
                    type: "text",
                    placeholder: "Nom de la mère",
                  },
                  {
                    id: "religion",
                    label: "Religion *",
                    type: "text",
                    placeholder: "Votre religion",
                  },
                ].map((field) => (
                  <div key={field.id} className="space-y-3">
                    <Label htmlFor={field.id} className="text-sm font-medium">
                      {field.label}
                    </Label>
                    <Input
                      id={field.id}
                      name={field.id}
                      type={field.type}
                      value={formData[field.id as keyof FormData] as string}
                      onChange={handleInputChange}
                      disabled={isDisabled}
                      required
                      placeholder={field.placeholder}
                      className="h-10 sm:h-11"
                    />
                  </div>
                ))}

                <div className="space-y-3">
                  <Label
                    htmlFor="maritalStatus"
                    className="text-sm font-medium"
                  >
                    Statut marital *
                  </Label>
                  <Select
                    value={formData.maritalStatus}
                    onValueChange={(value) =>
                      handleSelectChange("maritalStatus", value)
                    }
                    required
                    disabled={isDisabled}
                  >
                    <SelectTrigger className="h-10 sm:h-11">
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

                <div className="space-y-3">
                  <Label
                    htmlFor="arrivalDateDubai"
                    className="text-sm font-medium"
                  >
                    Date approximative d&apos;arrivée à Dubai *
                  </Label>
                  <Input
                    id="arrivalDateDubai"
                    name="arrivalDateDubai"
                    type="date"
                    value={formData.arrivalDateDubai}
                    onChange={handleInputChange}
                    required
                    disabled={isDisabled}
                    className="h-10 sm:h-11"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Birth Information */}
          <Card className="border">
            <CardHeader className="p-4 sm:p-6">
              <SectionHeader icon={MapPin} title="Informations de naissance" />
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-3">
                  <Label htmlFor="placeOfBirth" className="text-sm font-medium">
                    Ville de naissance *
                  </Label>
                  <Input
                    id="placeOfBirth"
                    name="placeOfBirth"
                    value={formData.placeOfBirth}
                    onChange={handleInputChange}
                    required
                    disabled={isDisabled}
                    placeholder="Ville de naissance"
                    className="h-10 sm:h-11"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="countryBirth" className="text-sm font-medium">
                    Pays de naissance *
                  </Label>
                  <Input
                    id="countryBirth"
                    name="countryBirth"
                    value={formData.countryBirth}
                    onChange={handleInputChange}
                    required
                    disabled={isDisabled}
                    placeholder="Pays de naissance"
                    className="h-10 sm:h-11"
                  />
                </div>

                <div className="space-y-3 lg:col-span-2">
                  <Label
                    htmlFor="nationality"
                    className="text-sm font-medium flex items-center gap-2"
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
                    className="h-10 sm:h-11"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card className="border">
            <CardHeader className="p-4 sm:p-6">
              <SectionHeader icon={FileText} title="Documents d'identité" />
              <div className="p-3 sm:p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">
                  📄 Formats acceptés : PDF, DOC, DOCX, TXT
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
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
            </CardContent>
          </Card>

          {/* Submit Section */}
          <Card className="border">
            <CardContent className="pt-6 p-4 sm:p-6">
              <div className="space-y-6">
                <Button
                  type="submit"
                  disabled={uploading || isDisabled}
                  className="w-full h-11 sm:h-12 text-sm sm:text-base font-medium"
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

                {message && (
                  <Alert
                    className={
                      message.includes("succès")
                        ? "border-green-500/50"
                        : "border-destructive/50"
                    }
                  >
                    {message.includes("succès") ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    )}
                    <AlertDescription
                      className={
                        message.includes("succès")
                          ? "text-green-600"
                          : "text-destructive"
                      }
                    >
                      {message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
