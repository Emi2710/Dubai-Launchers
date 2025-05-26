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
  const clientId = params?.id;

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `Le fichier est trop volumineux. Taille maximale: ${formatFileSize(MAX_FILE_SIZE)}`;
    }

    if (!Object.keys(ACCEPTED_FILE_TYPES).includes(file.type)) {
      return "Type de fichier non supporté. Formats acceptés: PDF";
    }

    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setMessage("");
    setFileError("");

    if (selectedFile) {
      const error = validateFile(selectedFile);
      if (error) {
        setFileError(error);
        setFile(null);
      }
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
    if (!file || !clientId) {
      setMessage("Veuillez sélectionner un fichier.");
      setMessageType("error");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = file.name.split(".").pop();
      const timestamp = Date.now();
      const filePath = `clients/${clientId}/${timestamp}.${fileExt}`;

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const { error } = await supabase.storage
        .from("documents")
        .upload(filePath, file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (error) {
        throw new Error(error.message);
      }

      setMessage("Fichier téléchargé avec succès !");
      setMessageType("success");
      setFile(null);
      await fetchFiles();

      // Reset file input
      const fileInput = document.getElementById("file") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Échec du téléchargement."
      );
      setMessageType("error");
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
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
            <Upload className="w-5 h-5" />
            Télécharger un document
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drag and Drop Area */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-primary bg-primary/5"
                : file
                  ? "border-green-300 bg-black"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  {getFileIcon(file.name, file.type)}
                  <div className="text-left">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFile(null);
                      setFileError("");
                      const fileInput = document.getElementById(
                        "file"
                      ) as HTMLInputElement;
                      if (fileInput) fileInput.value = "";
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 mx-auto bg-black rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-muted-foreground bg-black" />
                  </div>
                  <div>
                    <p className="text-lg font-medium">
                      Glissez-déposez votre fichier ici
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ou cliquez pour sélectionner
                    </p>
                  </div>
                </>
              )}
            </div>

            <Input
              id="file"
              type="file"
              accept={Object.keys(ACCEPTED_FILE_TYPES).join(",")}
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          {/* File Error */}
          {fileError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{fileError}</AlertDescription>
            </Alert>
          )}

          {/* Accepted Formats */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">
              Formats acceptés:
            </span>
            {Object.entries(ACCEPTED_FILE_TYPES).map(
              ([type, { label, color }]) => (
                <Badge key={type} variant="outline" className="text-xs">
                  {label}
                </Badge>
              )
            )}
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Téléchargement en cours...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={uploading || !file || !!fileError}
            className="w-full"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Téléchargement...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Télécharger le fichier
              </>
            )}
          </Button>

          {/* Message */}
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
              Documents transmis
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
