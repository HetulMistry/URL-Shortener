import { useQuery } from "@tanstack/react-query";
import { Download, Copy } from "lucide-react";
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
        <CardTitle>QR Code</CardTitle>
        <CardDescription>Scan to access your shortened URL</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        {isLoading ? (
          <Skeleton className="w-64 h-64" />
        ) : data?.qrCode ? (
          <>
            <img
              src={data.qrCode}
              alt="QR Code"
              className="w-64 h-64 border-2 border-gray-700 rounded-lg p-4 bg-white"
            />
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="default"
                onClick={handleCopy}
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy URL
              </Button>
              <Button
                variant="secondary"
                size="default"
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          </>
        ) : (
          <p className="text-gray-400">Failed to load QR code</p>
        )}
      </CardContent>
    </Card>
  );
}
