import { Link } from "react-router-dom";
import { Copy, Trash2, Eye, ExternalLink } from "lucide-react";
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
    <div className="space-y-4">
      <div className="hidden md:block overflow-hidden rounded-xl border border-white/6 bg-[#0c0d12]/45 backdrop-blur-md">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-white/6 bg-white/2">
              <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Short Link
              </th>
              <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Destination URL
              </th>
              <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Clicks
              </th>
              <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Created
              </th>
              <th className="text-right py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/4">
            {urls.map((url) => {
              const fullShort = getShortUrl(url.shortCode);
              return (
                <tr
                  key={url.id}
                  className="hover:bg-white/2 transition-colors group"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-indigo-400 font-semibold bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/15">
                        {url.shortCode}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="max-w-xs xl:max-w-md">
                      <p
                        className="text-sm text-gray-300 truncate"
                        title={url.originalUrl}
                      >
                        {url.originalUrl}
                      </p>
                      <a
                        href={url.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-gray-500 hover:text-indigo-400 transition-colors mt-0.5"
                      >
                        Visit site
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm font-bold text-white bg-white/4 px-2.5 py-0.5 rounded-full border border-white/4">
                      {url.clicks}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-400">
                    {new Date(url.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => copyToClipboard(fullShort)}
                        title="Copy short URL"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                      <Link to={`/dashboard/urls/${url.id}`}>
                        <Button
                          size="sm"
                          variant="secondary"
                          title="View analytics"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onDelete(url.id)}
                        disabled={isDeleting}
                        title="Delete URL"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="md:hidden space-y-4">
        {urls.map((url) => {
          const fullShort = getShortUrl(url.shortCode);
          return (
            <Card key={url.id}>
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-center justify-between border-b border-white/4 pb-2.5">
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                      Short Code
                    </span>
                    <span className="font-mono text-sm font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/15 mt-1 inline-block">
                      {url.shortCode}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                      Clicks
                    </span>
                    <span className="text-sm font-extrabold text-white mt-1 inline-block bg-white/4 px-2 py-0.5 rounded border border-white/4">
                      {url.clicks}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                    Original Link
                  </span>
                  <p className="text-gray-300 text-sm break-all mt-1 pr-2">
                    {url.originalUrl}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 border-t border-white/4 pt-2">
                  <span>
                    Created: {new Date(url.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-2 pt-1.5">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => copyToClipboard(fullShort)}
                    className="flex-1 flex items-center justify-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </Button>
                  <Link to={`/dashboard/urls/${url.id}`} className="flex-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-full flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(url.id)}
                    disabled={isDeleting}
                    className="px-3"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
