"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";
import {
  getLoggedInUserProfile,
  type UserProfile,
} from "@/lib/getLoggedInUserProfile";
import {
  Download,
  FileText,
  ImageIcon,
  File,
  Search,
  FolderOpen,
  AlertCircle,
  CheckCircle,
  Eye,
  Calendar,
  HardDrive,
} from "lucide-react";

type FileItem = {
  name: string;
  url: string;
  size?: number;
  lastModified?: string;
  type?: string;
};

const getFileIcon = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "pdf":
      return <FileText className="w-5 h-5 text-red-500" />;
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "webp":
      return <ImageIcon className="w-5 h-5 text-blue-500" />;
    case "doc":
    case "docx":
      return <FileText className="w-5 h-5 text-blue-600" />;
    case "xls":
    case "xlsx":
      return <FileText className="w-5 h-5 text-green-600" />;
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

export default function DownloadDocuments() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await getLoggedInUserProfile();
        setProfile(result);
      } catch (err) {
        setError("Erreur lors du chargement du profil utilisateur");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      fetchFiles();
    }
  }, [profile]);

  useEffect(() => {
    const filtered = files.filter((file) =>
      file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFiles(filtered);
  }, [files, searchTerm]);

  const fetchFiles = async () => {
    if (!profile?.user_id) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: listError } = await supabase.storage
        .from("documents")
        .list(`clients/${profile.user_id}`, {
          limit: 100,
          sortBy: { column: "updated_at", order: "desc" },
        });

      if (listError) {
        throw new Error("Erreur lors de la récupération des fichiers");
      }

      if (!data || data.length === 0) {
        setFiles([]);
        setLoading(false);
        return;
      }

      // Génère les URLs signées pour chaque fichier
      const filesWithUrls = await Promise.all(
        data.map(async (file) => {
          const { data: urlData } = await supabase.storage
            .from("documents")
            .createSignedUrl(`clients/${profile.user_id}/${file.name}`, 4000); // 1h

          return {
            name: file.name,
            url: urlData?.signedUrl || "",
            size: file.metadata?.size,
            lastModified: file.updated_at,
            type: file.metadata?.mimetype,
          };
        })
      );

      setFiles(filesWithUrls.filter((file) => file.url)); // Filtrer les fichiers sans URL
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (file: FileItem) => {
    setDownloadingFiles((prev) => new Set(prev).add(file.name));

    try {
      // Simuler un délai de téléchargement pour l'UX
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Ouvrir le lien de téléchargement
      const link = document.createElement("a");
      link.href = file.url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Erreur lors du téléchargement:", err);
    } finally {
      setDownloadingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(file.name);
        return newSet;
      });
    }
  };

  const handlePreview = (file: FileItem) => {
    window.open(file.url, "_blank", "noopener,noreferrer");
  };

  if (loading && !files.length) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="w-6 h-6" />
            <Skeleton className="h-6 w-48" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
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
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={fetchFiles} className="mt-4" variant="outline">
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-primary" />
            <CardTitle className="text-xl sm:text-2xl">Mes documents</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <HardDrive className="w-3 h-3" />
              {files.length} fichier{files.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </div>

        {files.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un document..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        )}
      </CardHeader>

      <CardContent>
        {files.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Aucun document disponible
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Vos documents apparaîtront ici une fois qu&apos;ils seront
              disponibles.
            </p>
            <Button onClick={fetchFiles} variant="outline">
              Actualiser
            </Button>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-8">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Aucun résultat
            </h3>
            <p className="text-sm text-muted-foreground">
              Aucun document ne correspond à votre recherche &apos;{searchTerm}
              &apos;.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFiles.map((file) => {
              const isDownloading = downloadingFiles.has(file.name);

              return (
                <div
                  key={file.name}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {getFileIcon(file.name)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm sm:text-base truncate">
                        {file.name}
                      </h4>
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
                      onClick={() => handlePreview(file)}
                      variant="outline"
                      size="sm"
                      className="flex-1 sm:flex-none"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Voir
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {files.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Tous vos documents sont sécurisés et chiffrés</span>
              </div>
              <Button onClick={fetchFiles} variant="outline" size="sm">
                Actualiser la liste
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
