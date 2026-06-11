import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { motion } from "framer-motion";
import { urlService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { CreateUrlModal } from "@/components/ui/url-management/CreateUrlModal";
import { UrlTable } from "@/components/ui/url-management/UrlTable";

export function UrlManagementPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ["urls", page, search],
    queryFn: () =>
      urlService.getUserUrls(page, 10, search).then((res) => res.data.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => urlService.deleteUrl(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["urls"] });
      queryClient.invalidateQueries({ queryKey: ["urlStats"] });
      addToast("URL deleted successfully", "success");
    },
    onError: () => {
      addToast("Failed to delete URL", "error");
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this URL?"))
      deleteMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">URL Management</h1>
          <p className="text-gray-400 mt-1">
            Create and manage your shortened URLs
          </p>
        </div>
        <Button
          variant="default"
          size="lg"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          Create URL
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Search URLs</CardTitle>
          <CardDescription>Find your shortened URLs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by original URL or alias..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-red-100"
        >
          Failed to load URLs. Please try again.
        </motion.div>
      )}
      {isLoading ? (
        <div className="space-y-2">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : !data?.urls || data.urls.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-surface-card border border-gray-700 rounded-lg p-12 text-center"
        >
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-white">No URLs yet</h3>
            <p className="text-gray-400">
              Create your first shortened URL to get started
            </p>
            <Button
              variant="default"
              size="default"
              onClick={() => setShowCreateModal(true)}
              className="mt-4 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create URL
            </Button>
          </div>
        </motion.div>
      ) : (
        <UrlTable
          urls={data.urls}
          onDelete={handleDelete}
          isDeleting={deleteMutation.isPending}
        />
      )}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-gray-400">
            Page {page} of {data.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
          >
            Next
          </Button>
        </div>
      )}
      <CreateUrlModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />
    </div>
  );
}
