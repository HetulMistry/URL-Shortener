import { useQuery } from "@tanstack/react-query";
import { Download, Copy, QrCode } from "lucide-react";
import { urlService } from "@/services/api";
import api from "@/services/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/hooks/use-toast";

interface QrCodeDisplayProps {
  urlId: string;
}

export function QrCodeDisplay({ urlId }: QrCodeDisplayProps) {
  const { addToast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["qrCode", urlId],
    queryFn: () =>
      urlService.getQrCode(urlId, "base64").then((res) => res.data.data),
  });

  const handleDownload = async () => {
    try {
      const response = await api.get(`/urls/${urlId}/qr`, {
        params: { format: "png" },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", `qr-code-${urlId}.png`);

      document.body.appendChild(link);

      link.click();
      link.parentNode?.removeChild(link);

      addToast("QR code downloaded successfully", "success");
    } catch {
      addToast("Failed to download QR code", "error");
    }
  };

  const handleCopy = async () => {
    if (data?.shortUrl)
      try {
        await navigator.clipboard.writeText(data.shortUrl);
        addToast("Short URL copied to clipboard", "success");
      } catch {
        addToast("Failed to copy short URL", "error");
      }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <QrCode className="w-5 h-5 text-indigo-400" />
          <CardTitle>QR Code Generator</CardTitle>
        </div>
        <CardDescription>
          Scan or share the generated QR code to navigate to your destination.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-6 gap-6">
        {isLoading ? (
          <Skeleton className="w-56 h-56 rounded-xl" />
        ) : data?.qrCode ? (
          <div className="flex flex-col items-center gap-5 w-full">
            <div className="p-4 bg-white rounded-2xl border border-white/10 shadow-2xl shadow-black/20">
              <img
                src={data.qrCode}
                alt="QR Code"
                className="w-48 h-48 block"
              />
            </div>
            <div className="flex items-center gap-3 w-full max-w-xs">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy URL
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-gray-400 text-sm">Failed to generate QR code</p>
        )}
      </CardContent>
    </Card>
  );
}
