"use client";

import type React from "react";

import { useEffect, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/lib/supabaseClient";
import { useParams } from "next/navigation";
import {
  Upload,
  FileText,
  ImageIcon,
  File,
  Trash2,
  Download,
  Eye,
  CheckCircle,
  AlertCircle,
  X,
  HardDrive,
  Calendar,
} from "lucide-react";

type FileItem = {
  name: string;
  url: string;
  size?: number;
  lastModified?: string;
  type?: string;
};

const ACCEPTED_FILE_TYPES = {
  "application/pdf": { icon: FileText, color: "text-red-500", label: "PDF" },
};

const DOCUMENT_TYPES = [
  { key: "license", label: "License" },
  { key: "lease_agreement", label: "Lease Agreement" },
  { key: "formation_certificate", label: "Formation Certificate" },
  { key: "shares_certificate", label: "Shares Certificate" },
  { key: "moa", label: "MOA" },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const getFileIcon = (fileName: string, mimeType?: string) => {
  if (
    mimeType &&
    ACCEPTED_FILE_TYPES[mimeType as keyof typeof ACCEPTED_FILE_TYPES]
  ) {
    const { icon: Icon, color } =
      ACCEPTED_FILE_TYPES[mimeType as keyof typeof ACCEPTED_FILE_TYPES];
    return <Icon className={`w-5 h-5 ${color}`} />;
  }

  const extension = fileName.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "pdf":
      return <FileText className="w-5 h-5 text-red-500" />;
    case "jpg":
    case "jpeg":
    case "png":
    case "webp":
      return <ImageIcon className="w-5 h-5 text-blue-500" />;
    default:
      return <File className="w-5 h-5 text-gray-500" />;
  }
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return "Taille inconnue";
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "Date inconnue";
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function UploadDocument() {
  const [selectedType, setSelectedType] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">(
    "info"
  );
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState("");

  const params = useParams();

  const rawId = params?.id;
  const clientId = Array.isArray(rawId) ? rawId[0] : rawId;

  const validateFile = (file: File): string | null => {
    if (file.size > 10 * 1024 * 1024) return "Taille maximale : 10MB.";
    if (!file.type.includes("pdf"))
      return "Seuls les fichiers PDF sont acceptés.";
    return null;
  };

  const getClientEmail = async (clientId: string): Promise<string | null> => {
    const { data, error } = await supabase
      .from("profiles")
      .select("email")
      .eq("user_id", clientId)
      .single();

    if (error || !data) {
      console.error("Erreur récupération email:", error);
      return null;
    }

    return data.email;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    const error = validateFile(selected);
    if (error) {
      setFileError(error);
      setFile(null);
    } else {
      setFile(selected);
      setFileError("");
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const error = validateFile(droppedFile);

      if (error) {
        setFileError(error);
        setFile(null);
      } else {
        setFile(droppedFile);
        setFileError("");
        setMessage("");
      }
    }
  }, []);

  const handleUpload = async () => {
    if (!clientId || !file || !selectedType) {
      setMessage("Veuillez sélectionner un type et un fichier PDF.");
      setMessageType("error");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    const filePath = `clients/${clientId}/${selectedType}.pdf`;

    try {
      await supabase.storage.from("documents").remove([filePath]); // Supprimer l'ancien si existant
      const { error } = await supabase.storage
        .from("documents")
        .upload(filePath, file);

      if (error) throw error;
      setMessage("Document téléchargé avec succès !");

      const email = await getClientEmail(clientId);
      if (email) {
        await fetch("/api/users/document-submission", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            type:
              DOCUMENT_TYPES.find((d) => d.key === selectedType)?.label ||
              selectedType,
          }),
        });
      }

      setMessageType("success");
      setFile(null);
      setSelectedType("");
    } catch (err) {
      setMessage("Erreur lors du téléchargement.");
      setMessageType("error");
    } finally {
      setUploading(false);
    }
  };

  const fetchFiles = async () => {
    if (!clientId) return;

    setLoadingFiles(true);

    try {
      const { data, error } = await supabase.storage
        .from("documents")
        .list(`clients/${clientId}`, {
          limit: 100,
          sortBy: { column: "updated_at", order: "desc" },
        });

      if (error) throw new Error(error.message);

      if (!data || data.length === 0) {
        setFiles([]);
        setLoadingFiles(false);
        return;
      }

      const filesWithUrls = await Promise.all(
        data.map(async (file) => {
          const { data: urlData } = await supabase.storage
            .from("documents")
            .createSignedUrl(`clients/${clientId}/${file.name}`, 4000);

          return {
            name: file.name,
            url: urlData?.signedUrl || "#",
            size: file.metadata?.size,
            lastModified: file.updated_at,
            type: file.metadata?.mimetype,
          };
        })
      );

      setFiles(filesWithUrls.filter((file) => file.url !== "#"));
    } catch (error) {
      console.error("Erreur lors du chargement des fichiers:", error);
      setFiles([]);
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleDelete = async (filename: string) => {
    if (!clientId) return;
    setDeleting(filename);

    try {
      const filePath = `clients/${clientId}/${filename}`;
      const { error } = await supabase.storage
        .from("documents")
        .remove([filePath]);

      if (error) throw new Error(error.message);

      setMessage("Fichier supprimé avec succès.");
      setMessageType("success");
      await fetchFiles();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression."
      );
      setMessageType("error");
    } finally {
      setDeleting(null);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [clientId]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" /> Téléverser un document spécifique
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium">
              Type de document
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="mt-1 block w-full border rounded-md p-2 bg-black mt-2"
            >
              <option className="" value="">
                -- Choisir un document --
              </option>
              {DOCUMENT_TYPES.map((doc) => (
                <option key={doc.key} value={doc.key}>
                  {doc.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
            />
            {fileError && (
              <p className="text-sm text-red-500 mt-1">{fileError}</p>
            )}
          </div>

          {uploading && <Progress value={uploadProgress} />}

          <Button
            onClick={handleUpload}
            disabled={uploading || !file || !selectedType}
          >
            {uploading ? "Téléchargement..." : "Téléverser"}
          </Button>

          {message && (
            <Alert
              variant={messageType === "error" ? "destructive" : "default"}
            >
              {messageType === "success" ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Files List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Documents que vous avez transmis
            </CardTitle>
            <Badge variant="outline">
              {files.length} fichier{files.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loadingFiles ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              ))}
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Aucun document
              </h3>
              <p className="text-sm text-muted-foreground">
                Commencez par télécharger votre premier document ci-dessus.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file.name}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {getFileIcon(file.name, file.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{file.name}</h4>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <HardDrive className="w-3 h-3" />
                          <span>{formatFileSize(file.size)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(file.lastModified)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="flex-1 sm:flex-none"
                    >
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Voir
                      </a>
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={deleting === file.name}
                          className="flex-shrink-0"
                        >
                          {deleting === file.name ? (
                            <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Confirmer la suppression
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer {file.name} ?
                            Cette action est irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(file.name)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
