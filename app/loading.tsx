import { LoadingOverlay } from "@/components/ui/skeleton"

export default function Loading() {
  return <LoadingOverlay fullscreen={false} message="Memuat halaman..." />
}
