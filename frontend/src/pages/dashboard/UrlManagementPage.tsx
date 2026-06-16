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
          <h1 className="text-3xl font-extrabold text-white font-space-grotesk tracking-tight">
            URL Management
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Create, search, and manage your shortened links.
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
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filter Links</CardTitle>
          <CardDescription>
            Search by original URL path or shortcode alias.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by original URL or alias..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            icon={<Search className="w-4 h-4 text-gray-400" />}
          />
        </CardContent>
      </Card>
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-500/10 border border-red-500/25 rounded-xl p-4 text-red-400 text-sm"
        >
          Failed to load shortened URLs. Please reload or try again later.
        </motion.div>
      )}
      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : !data?.urls || data.urls.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0e0f14]/45 backdrop-blur-md border border-white/6 rounded-xl p-12 text-center"
        >
          <div className="space-y-4 max-w-sm mx-auto">
            <div className="p-4 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 inline-block">
              <Plus className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">No URLs found</h3>
              <p className="text-gray-400 text-sm">
                Get started by creating your very first shortened redirection
                link.
              </p>
            </div>
            <Button
              variant="default"
              size="default"
              onClick={() => setShowCreateModal(true)}
              className="mt-2 inline-flex items-center gap-2"
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
        <div className="flex items-center justify-between pt-4 border-t border-white/4">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            size="sm"
          >
            Previous
          </Button>
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
            Page {page} of {data.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
            size="sm"
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
