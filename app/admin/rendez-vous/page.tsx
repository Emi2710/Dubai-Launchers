import { DashboardLayout } from "@/components/admin/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CalendarPlus, Search } from "lucide-react";

export default function RendezVousPage() {
  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Rendez-vous</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher..."
              className="w-full rounded-md pl-8 md:w-[200px] lg:w-[300px]"
            />
          </div>
          <Button>
            <CalendarPlus className="mr-2 h-4 w-4" />
            Nouveau rendez-vous
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Rendez-vous à venir</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => {
              const date = new Date(Date.now() + i * 86400000);
              const hours = 9 + Math.floor(Math.random() * 8);
              const minutes = Math.random() > 0.5 ? "00" : "30";

              return (
                <div
                  key={i}
                  className="flex items-center justify-between gap-4 rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center rounded-md border p-2 text-center">
                      <span className="text-sm font-medium">
                        {date.toLocaleDateString("fr-FR", { month: "short" })}
                      </span>
                      <span className="text-2xl font-bold">
                        {date.getDate()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {`${hours}:${minutes}`} - Rendez-vous {i + 1}
                      </p>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>{`U${i + 1}`}</AvatarFallback>
                        </Avatar>
                        <p className="text-sm text-muted-foreground">
                          Client {i + 1}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      Modifier
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
