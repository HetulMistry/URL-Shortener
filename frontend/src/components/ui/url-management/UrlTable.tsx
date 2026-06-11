import { Link } from "react-router-dom";
import { Copy, Trash2, Eye } from "lucide-react";
import type { ShortUrl } from "@/types";
import { getShortUrl } from "@/lib/config";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useToast } from "@/hooks/use-toast";

interface UrlTableProps {
  urls: ShortUrl[];
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export function UrlTable({ urls, onDelete, isDeleting }: UrlTableProps) {
  const { addToast } = useToast();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      addToast("Copied to clipboard!", "success");
    } catch {
      addToast("Failed to copy", "error");
    }
  };

  return (
    <div className="space-y-2">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">
                Short Code
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">
                Original URL
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">
                Clicks
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">
                Created
              </th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-400 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {urls.map((url) => (
              <tr
                key={url.id}
                className="border-b border-gray-700 hover:bg-gray-900/30 transition"
              >
                <td className="py-3 px-4">
                  <code className="text-sm font-mono text-blue-400">
                    {url.shortCode}
                  </code>
                </td>
                <td className="py-3 px-4">
                  <p
                    className="text-sm text-gray-300 truncate max-w-xs"
                    title={url.originalUrl}
                  >
                    {url.originalUrl}
                  </p>
                </td>
                <td className="py-3 px-4 text-sm text-white">{url.clicks}</td>
                <td className="py-3 px-4 text-sm text-gray-400">
                  {new Date(url.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        copyToClipboard(getShortUrl(url.shortCode))
                      }
                      title="Copy short URL"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Link to={`/dashboard/urls/${url.id}`}>
                      <Button
                        size="sm"
                        variant="secondary"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDelete(url.id)}
                      disabled={isDeleting}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-2">
        {urls.map((url) => (
          <Card key={url.id}>
            <CardContent className="pt-4 space-y-3">
              <div>
                <p className="text-xs text-gray-400 uppercase">Short Code</p>
                <p className="text-white font-mono mt-1">{url.shortCode}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase">Original URL</p>
                <p className="text-gray-300 text-sm break-all mt-1">
                  {url.originalUrl}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-400">Clicks</p>
                  <p className="text-lg font-bold text-white">{url.clicks}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Created</p>
                  <p className="text-sm text-white">
                    {new Date(url.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => copyToClipboard(getShortUrl(url.shortCode))}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </Button>
                <Link to={`/dashboard/urls/${url.id}`} className="flex-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete(url.id)}
                  disabled={isDeleting}
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
