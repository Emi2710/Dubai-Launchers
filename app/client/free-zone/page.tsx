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
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            Guide d&apos;accès
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Comment accéder à votre free-zone
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Suivez notre guide complet pour accéder facilement à votre espace
            free-zone. Regardez la vidéo explicative et consultez le guide PDF
            détaillé.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Video Section */}
          <Card className="overflow-hidden lg:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Play className="h-5 w-5 text-primary" />
                <CardTitle>Tutoriel vidéo</CardTitle>
              </div>
              <CardDescription>
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
                    <p className="text-muted-foreground">
                      Votre navigateur ne supporte pas la vidéo.
                    </p>
                  </div>
                </video>
              </div>
            </CardContent>
          </Card>

          {/* PDF Guide Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle>Guide PDF</CardTitle>
              </div>
              <CardDescription>
                Documentation complète au format PDF
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center p-8 bg-muted rounded-lg">
                <div className="text-center">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">
                    Guide d&apos;accès Free-Zone
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Instructions détaillées avec captures d&apos;écran
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button asChild className="flex-1">
                  <a
                    href="/freezone/guide.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Ouvrir le PDF
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a
                    href="/freezone/guide.pdf"
                    download
                    className="flex items-center gap-2"
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
        <div className="mt-12">
          <Separator className="mb-8" />

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                <CardTitle>Besoin d&apos;aide ?</CardTitle>
              </div>
              <CardDescription>
                Notre équipe est là pour vous accompagner
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
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
