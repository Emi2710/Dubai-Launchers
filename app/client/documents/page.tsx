import { DashboardLayout } from "@/components/client/dashboard-layout";
import DownloadDocuments from "@/components/client/DownloadDocuments";
import UploadDocuments from "@/components/client/UploadDocuments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileText,
  Upload,
  Download,
  Shield,
  CheckCircle,
  Info,
  FolderOpen,
} from "lucide-react";

type Props = {};

export default function Documents({}: Props) {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Gestion des documents
              </h1>
              <p className="text-muted-foreground pt-3">
                Téléchargez vos documents requis et accédez à vos fichiers
                disponibles
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Sécurisé
              </Badge>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-5">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Upload className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Documents requis</p>
                <p className="text-xs text-muted-foreground">
                  Téléchargez vos pièces justificatives
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Validation</p>
                <p className="text-xs text-muted-foreground">
                  Vérification par votre chargé de compte
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Mes fichiers</p>
                <p className="text-xs text-muted-foreground">
                  Accès à vos documents
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Responsive Layout */}
        <div className="space-y-6">
          {/* Desktop: Side by side layout */}
          <div className=" lg:grid lg:grid-cols-1 lg:gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">
                  Télécharger des documents
                </h2>
              </div>
              <UploadDocuments />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
