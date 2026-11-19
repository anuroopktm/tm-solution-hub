import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/input-group";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useUsers, useRestoreUser } from "@/hooks/use-users";
import { useDebounce } from "@/hooks/use-debounce";
import type { User } from "@/types/user.types";

import { UserFormDialog } from "./user-form-dialog";
import { UserDeleteDialog } from "./user-delete-dialog";

import { Plus, Pencil, RotateCcw, Trash2, UserX } from "lucide-react";

import { toast } from "sonner";

export function UsersView() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const { data: users = [], isLoading } = useUsers(debouncedSearch);
  const restoreUserMutation = useRestoreUser();

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteMode, setDeleteMode] = useState<"soft" | "permanent">("soft");

  const handleOpenCreate = () => {
    setUserToEdit(null);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setUserToEdit(user);
    setFormDialogOpen(true);
  };

  const handleOpenDelete = (user: User, mode: "soft" | "permanent") => {
    setUserToDelete(user);
    setDeleteMode(mode);
    setDeleteDialogOpen(true);
  };

  const handleRestore = async (user: User) => {
    try {
      await restoreUserMutation.mutateAsync(user.id);
      toast.success(`User ${user.username} restored successfully`);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Failed to restore user";

      toast.error(errorMsg);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          Manage system users, credentials, and access permissions.
        </p>
      </div>

      {/* Filter and Actions */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Filter users by username or email..."
          className="max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Button onClick={handleOpenCreate}>
          <Plus />
          Add User
        </Button>
      </div>

      {/* Users Table */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary">
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Password</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-7 w-36" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  {search.trim()
                    ? "No users found matching your search."
                    : "No users found."}
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>

                  <TableCell>{user.email}</TableCell>

                  <TableCell>
                    <div className="w-36 sm:w-44">
                      <PasswordInput
                        value={user.password || "••••••••••••"}
                        readOnly
                        className="font-mono bg-muted/30"
                      />
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant={user.is_deleted ? "secondary" : "default"}>
                      {user.is_deleted ? "Deactivated" : "Active"}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      {!user.is_deleted ? (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(user)}
                            title="Edit user"
                          >
                            <Pencil />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDelete(user, "soft")}
                            title="Deactivate user"
                          >
                            <UserX />
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRestore(user)}
                          disabled={restoreUserMutation.isPending}
                          title="Restore user"
                        >
                          <RotateCcw />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDelete(user, "permanent")}
                        title="Delete user"
                        className="text-destructive"
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      {!isLoading && (
        <p className="text-sm text-muted-foreground">
          Showing {users.length} {users.length === 1 ? "user" : "users"}
        </p>
      )}

      {/* Dialogs */}
      <UserFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        userToEdit={userToEdit}
      />

      <UserDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        user={userToDelete}
        {...{ mode: deleteMode }}
      />
    </div>
  );
}
