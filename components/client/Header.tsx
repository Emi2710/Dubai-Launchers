"use client";

import { useEffect, useState } from "react";
import {
  getLoggedInUserProfile,
  UserProfile,
} from "@/lib/getLoggedInUserProfile";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, TrendingUp } from "lucide-react";

export default function Header() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const result = await getLoggedInUserProfile();
      setProfile(result);
      setLoading(false);
    };

    fetchProfile();
  }, []);

  return (
    <Card className="w-full overflow-hidden border-0 bg-transparent">
      <CardContent className="pt-8 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-white/20 rounded-lg backdrop-blur-sm p-2" />
          <h1 className="text-2xl md:text-3xl font-bold">
            Bienvenue{" "}
            {loading ? (
              <Skeleton className="inline-block h-6 w-24 bg-white/20" />
            ) : (
              profile?.first_name || "cher entrepreneur"
            )}
            🙌🏻
          </h1>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Check className="h-5 w-5 text-white-300" />
          <h2 className="text-lg text-blue-100 md:text-xl font-semibold">
            Espace Client Dubai Launchers
          </h2>
        </div>

        <div className="flex items-start gap-2">
          <TrendingUp className="h-5 w-5 text-green-300 mt-0.5 flex-shrink-0" />
          <p className="text-blue-100 text-base md:text-lg leading-relaxed">
            Suivez ici l&apos;état d&apos;avancement de votre création
            d&apos;entreprise à Dubai.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
