import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { urlService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  validateOriginalUrl,
  validateCustomAlias,
  formatExpirationDate,
  normalizeOriginalUrl,
} from "@/lib/url-validation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

interface CreateUrlModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateUrlModal({ open, onOpenChange }: CreateUrlModalProps) {
  const [originalUrl, setOriginalUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const mutation = useMutation({
    mutationFn: () => {
      const normalizedUrl = normalizeOriginalUrl(originalUrl);
      const formattedExpiresAt = expiresAt
        ? formatExpirationDate(expiresAt)
        : undefined;

      return urlService.createUrl(
        normalizedUrl,
        customAlias.trim() || undefined,
        formattedExpiresAt,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["urls"] });
      queryClient.invalidateQueries({ queryKey: ["urlStats"] });
      addToast("URL created successfully!", "success");
      handleClose();
    },
    onError: (error: Error) => {
      addToast(getApiErrorMessage(error, "Failed to create URL"), "error");
    },
  });

  const handleClose = () => {
    setOriginalUrl("");
    setCustomAlias("");
    setExpiresAt("");
    setErrors({});
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const urlError = validateOriginalUrl(originalUrl);
    const aliasError = validateCustomAlias(customAlias);

    const nextErrors: Record<string, string> = {};
    if (urlError) nextErrors.originalUrl = urlError;
    if (aliasError) nextErrors.customAlias = aliasError;

    if (expiresAt) {
      const expiration = new Date(`${expiresAt}T23:59:59`);
      if (expiration <= new Date())
        nextErrors.expiresAt = "Expiration must be a future date";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    mutation.mutate();
  };

  const minDate = new Date().toISOString().split("T")[0];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="pointer-events-auto w-full max-w-md"
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Create Short URL</CardTitle>
                    <CardDescription>
                      Generate a new shortened link
                    </CardDescription>
                  </div>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      label="Original URL"
                      type="url"
                      placeholder="https://example.com"
                      value={originalUrl}
                      onChange={(e) => setOriginalUrl(e.target.value)}
                      error={errors.originalUrl}
                      disabled={mutation.isPending}
                    />
                    <Input
                      label="Custom Alias (Optional)"
                      type="text"
                      placeholder="my-link"
                      value={customAlias}
                      onChange={(e) => setCustomAlias(e.target.value)}
                      error={errors.customAlias}
                      disabled={mutation.isPending}
                    />
                    <Input
                      label="Expiration Date (Optional)"
                      type="date"
                      min={minDate}
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      error={errors.expiresAt}
                      disabled={mutation.isPending}
                    />
                    <div className="flex gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={mutation.isPending}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="default"
                        disabled={mutation.isPending}
                        className="flex-1"
                      >
                        {mutation.isPending ? "Creating..." : "Create"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
