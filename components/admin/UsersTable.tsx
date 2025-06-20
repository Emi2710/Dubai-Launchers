"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Search,
  RefreshCw,
  UserCog,
  UserX,
  AlertCircle,
  UsersIcon,
  Filter,
  Eye,
} from "lucide-react";
import { UserFormDialog } from "../admin/user-form-dialog";
import { useMediaQuery } from "@/hooks/use-media-query";
import Link from "next/link";

type UserProfile = {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  role: string | null;
  active: boolean | null;
};

type SortField = "first_name" | "last_name" | "email" | "role" | "active";
type SortDirection = "asc" | "desc";

export default function UsersTable() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("last_name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const isDesktop = useMediaQuery("(min-width: 768px)");
  const usersPerPage = isDesktop ? 10 : 5;

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, email, role, active");

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
      setCurrentPage(1);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user.first_name?.toLowerCase().includes(query) ||
        false ||
        user.last_name?.toLowerCase().includes(query) ||
        false ||
        user.email?.toLowerCase().includes(query) ||
        false ||
        user.role?.toLowerCase().includes(query) ||
        false
    );

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchQuery, users]);

  // Handle sorting
  useEffect(() => {
    const sorted = [...filteredUsers].sort((a, b) => {
      const fieldA = a[sortField] || "";
      const fieldB = b[sortField] || "";

      if (typeof fieldA === "boolean" && typeof fieldB === "boolean") {
        return sortDirection === "asc"
          ? Number(fieldA) - Number(fieldB)
          : Number(fieldB) - Number(fieldA);
      }

      if (sortDirection === "asc") {
        return String(fieldA).localeCompare(String(fieldB));
      } else {
        return String(fieldB).localeCompare(String(fieldA));
      }
    });

    setFilteredUsers(sorted);
  }, [sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    );
  };

  const getRoleBadge = (role: string | null) => {
    if (!role) return <Badge variant="outline">-</Badge>;

    switch (role.toLowerCase()) {
      case "admin":
        return (
          <Badge className="border-red-400 text-red-300 bg-black hover:bg-black">
            Admin
          </Badge>
        );
      case "charge_de_compte":
        return (
          <Badge className="border-blue-400 text-blue-300 bg-black hover:bg-black">
            Chargé de compte
          </Badge>
        );
      case "client":
        return (
          <Badge className="border-green-400 text-green-300 bg-black hover:bg-black">
            Client
          </Badge>
        );
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getStatusBadge = (active: boolean | null) => {
    if (active === null) return <Badge variant="outline">-</Badge>;

    return active ? (
      <Badge
        variant="default"
        className="border-green-400 text-green-300 bg-black hover:bg-black"
      >
        Actif
      </Badge>
    ) : (
      <Badge
        variant="secondary"
        className="border-gray-400 text-gray-300 bg-black hover:bg-black"
      >
        Inactif
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs</CardTitle>
          <CardDescription>
            Liste des utilisateurs de la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div className="relative w-full md:w-64">
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-36" />
            </div>
          </div>
          {isDesktop ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Skeleton className="h-4 w-20" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-20" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-40" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-20" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-20" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-10" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-40" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-10" />
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="space-y-4">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-5 w-20" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <div className="flex justify-between">
                          <Skeleton className="h-5 w-20" />
                          <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
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
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle>Utilisateurs</CardTitle>
            <CardDescription>
              Liste des utilisateurs de la plateforme
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              <span className="sr-only">Rafraîchir</span>
            </Button>
            <UserFormDialog onUserAdded={handleRefresh} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un utilisateur..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="text-sm text-muted-foreground">
              {filteredUsers.length} utilisateur
              {filteredUsers.length !== 1 ? "s" : ""} trouvé
              {filteredUsers.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {isDesktop ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("first_name")}
                  >
                    <div className="flex items-center">
                      Prénom
                      {renderSortIcon("first_name")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("last_name")}
                  >
                    <div className="flex items-center">
                      Nom
                      {renderSortIcon("last_name")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("email")}
                  >
                    <div className="flex items-center">
                      Email
                      {renderSortIcon("email")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("role")}
                  >
                    <div className="flex items-center">
                      Rôle
                      {renderSortIcon("role")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("active")}
                  >
                    <div className="flex items-center">
                      Statut
                      {renderSortIcon("active")}
                    </div>
                  </TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <UsersIcon className="h-8 w-8 mb-2 opacity-50" />
                        <p>Aucun utilisateur trouvé</p>
                        {searchQuery && (
                          <Button
                            variant="link"
                            onClick={() => setSearchQuery("")}
                            className="mt-2 h-auto p-0"
                          >
                            Effacer la recherche
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user) => (
                    <TableRow key={user.user_id} className="hover:bg-muted/50">
                      <TableCell>{user.first_name || "-"}</TableCell>
                      <TableCell>{user.last_name || "-"}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {user.email || "-"}
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getStatusBadge(user.active)}</TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/utilisateurs/${user.user_id}/update`}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedUsers.length === 0 ? (
              <div className="rounded-md border p-8 text-center">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <UsersIcon className="h-8 w-8 mb-2 opacity-50" />
                  <p>Aucun utilisateur trouvé</p>
                  {searchQuery && (
                    <Button
                      variant="link"
                      onClick={() => setSearchQuery("")}
                      className="mt-2 h-auto p-0"
                    >
                      Effacer la recherche
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              paginatedUsers.map((user) => (
                <Card key={user.user_id} className="overflow-hidden">
                  <Link
                    className="pb-3"
                    href={`/admin/utilisateurs/${user.user_id}/update`}
                  >
                    <CardContent className="p-0">
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">
                              {user.first_name || ""} {user.last_name || ""}
                            </h3>
                            <p className="text-sm text-muted-foreground font-mono">
                              {user.email || ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              Rôle:
                            </span>
                            {getRoleBadge(user.role)}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              Statut:
                            </span>
                            {getStatusBadge(user.active)}
                          </div>
                        </div>
                      </div>
                    </CardContent>{" "}
                  </Link>
                </Card>
              ))
            )}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-4 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    aria-disabled={currentPage === 1}
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>

                {!isDesktop ? (
                  <PaginationItem>
                    <PaginationLink isActive>{currentPage}</PaginationLink>
                  </PaginationItem>
                ) : (
                  Array.from({ length: Math.min(5, totalPages) }).map(
                    (_, i) => {
                      let pageNumber: number;

                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }

                      if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 &&
                          pageNumber <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={pageNumber}>
                            <PaginationLink
                              onClick={() => setCurrentPage(pageNumber)}
                              isActive={currentPage === pageNumber}
                            >
                              {pageNumber}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      } else if (
                        pageNumber === 2 ||
                        pageNumber === totalPages - 1
                      ) {
                        return (
                          <PaginationItem key={pageNumber}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      return null;
                    }
                  )
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    aria-disabled={currentPage === totalPages}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
