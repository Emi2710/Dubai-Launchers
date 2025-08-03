import AssignedManager from "@/components/client/AssignedManager";
import { DashboardLayout } from "@/components/client/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Play,
  FileText,
  HelpCircle,
  Download,
  ExternalLink,
} from "lucide-react";

type Props = {};

export default function Page({}: Props) {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <Badge variant="secondary" className="mb-3 sm:mb-4">
            Guide d&apos;accès
          </Badge>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-3 sm:mb-4 px-2">
            Comment accéder à votre free-zone
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Suivez notre guide complet pour accéder facilement à votre espace
            free-zone. Regardez la vidéo explicative et consultez le guide PDF
            détaillé.
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-3">
          {/* Video Section */}
          <Card className="overflow-hidden lg:col-span-2">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <CardTitle className="text-lg sm:text-xl">
                  Tutoriel vidéo
                </CardTitle>
              </div>
              <CardDescription className="text-sm sm:text-base">
                Regardez notre guide vidéo étape par étape
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="aspect-video bg-muted">
                <video
                  className="w-full h-full object-cover rounded-b-lg"
                  controls
                  poster="/freezone/preview.png"
                >
                  <source src="/freezone/video.mp4" type="video/mp4" />
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground text-sm sm:text-base px-4 text-center">
                      Votre navigateur ne supporte pas la vidéo.
                    </p>
                  </div>
                </video>
              </div>
            </CardContent>
          </Card>

          {/* PDF Guide Section */}
          <Card className="h-fit">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <CardTitle className="text-lg sm:text-xl">Guide PDF</CardTitle>
              </div>
              <CardDescription className="text-sm sm:text-base">
                Documentation complète au format PDF
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-2">
                <Button asChild className="flex-1">
                  <a
                    href="/freezone/guide.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-sm"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Ouvrir le PDF
                  </a>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="flex-1 sm:flex-initial bg-transparent"
                >
                  <a
                    href="/freezone/guide.pdf"
                    download
                    className="flex items-center justify-center gap-2 text-sm"
                  >
                    <Download className="h-4 w-4" />
                    Télécharger
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Support Section */}
        <div className="mt-8 sm:mt-12">
          <Separator className="mb-6 sm:mb-8" />
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <CardTitle className="text-lg sm:text-xl">
                  Besoin d&apos;aide ?
                </CardTitle>
              </div>
              <CardDescription className="text-sm sm:text-base">
                Notre équipe est là pour vous accompagner
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Une question sur l&apos;accès à votre free-zone ?
                  </p>
                  <p className="text-sm">
                    Contactez votre manager assigné pour une assistance
                    personnalisée.
                  </p>
                </div>
                <div className="w-full sm:w-auto">
                  <AssignedManager />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
