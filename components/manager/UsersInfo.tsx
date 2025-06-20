"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ChevronDown,
  ChevronUp,
  Search,
  RefreshCw,
  AlertCircle,
  UsersIcon,
  Filter,
  User,
  Mail,
  Phone,
} from "lucide-react";
import { UserFormDialog } from "../admin/user-form-dialog";
import { useMediaQuery } from "@/hooks/use-media-query";
import Link from "next/link";
import { cn } from "@/lib/utils";

type UserProfile = {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  role: string | null;
  active: boolean | null;
};

type SortField = "first_name" | "last_name" | "email";
type SortDirection = "asc" | "desc";

export default function UsersInfo() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("last_name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const isDesktop = useMediaQuery("(min-width: 768px)");

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, email, phone, role, active")
        .eq("role", "client")
        .eq("active", true);

      if (error) {
        throw error;
      }

      setUsers(data || []);
      setFilteredUsers(data || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle search and filtering
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user.first_name?.toLowerCase().includes(query) ||
        user.last_name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.phone?.toLowerCase().includes(query)
    );

    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  // Handle sorting
  useEffect(() => {
    const sorted = [...filteredUsers].sort((a, b) => {
      const fieldA = a[sortField] || "";
      const fieldB = b[sortField] || "";

      if (sortDirection === "asc") {
        return String(fieldA).localeCompare(String(fieldB));
      } else {
        return String(fieldB).localeCompare(String(fieldA));
      }
    });

    setFilteredUsers(sorted);
  }, [sortField, sortDirection]);

  const getInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName?.charAt(0)?.toUpperCase() || "";
    const last = lastName?.charAt(0)?.toUpperCase() || "";
    return first + last || "?";
  };

  const getFullName = (firstName: string | null, lastName: string | null) => {
    const parts = [firstName, lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : "Nom non renseigné";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Clients</h1>
            <p className="text-slate-600">
              Liste des clients qui vous sont assignés
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-36" />
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Skeleton className="h-10 w-full md:w-64" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        <div
          className={cn(
            "grid gap-4",
            isDesktop
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1"
          )}
        >
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="border border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-36" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        variant="destructive"
        className="bg-rose-50 text-rose-800 border-rose-200"
      >
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>
          Impossible de charger les utilisateurs: {error}
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={handleRefresh}
          >
            Réessayer
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-200">Clients</h1>
          <p className="text-slate-300">
            Liste des clients qui vous sont assignés
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Rechercher un utilisateur..."
            className="pl-8 border-slate-200 focus-visible:ring-slate-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* User Cards */}
      {filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
          <UsersIcon className="h-12 w-12 mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Aucun utilisateur trouvé</h3>
          <p className="text-sm text-center mb-4">
            {searchQuery
              ? "Aucun utilisateur ne correspond à votre recherche."
              : "Il n'y a pas encore d'utilisateurs."}
          </p>
          {searchQuery && (
            <Button
              variant="outline"
              onClick={() => setSearchQuery("")}
              className="border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            >
              Effacer la recherche
            </Button>
          )}
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-4",
            isDesktop
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1"
          )}
        >
          {filteredUsers.map((user) => (
            <Link
              key={user.user_id}
              href={`/manager/utilisateurs/${user.user_id}/update`}
            >
              <Card className="border border-slate-200 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-medium text-sm group-hover:bg-slate-200 transition-colors">
                        {getInitials(user.first_name, user.last_name)}
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <h3 className="font-medium text-slate-100 truncate">
                          {getFullName(user.first_name, user.last_name)}
                        </h3>
                      </div>

                      {user.email && (
                        <div className="flex items-center gap-2 mb-2">
                          <Mail className="h-4 w-4 text-slate-400" />
                          <p className="text-sm text-slate-400 font-mono truncate">
                            {user.email}
                          </p>
                        </div>
                      )}

                      {user.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-slate-400" />
                          <p className="text-sm text-slate-600">{user.phone}</p>
                        </div>
                      )}

                      {!user.email && !user.phone && (
                        <p className="text-sm text-slate-400 italic">
                          Informations de contact manquantes
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
