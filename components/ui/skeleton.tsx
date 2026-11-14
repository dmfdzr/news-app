import { cn } from "cn"
import { Loader2Icon } from "lucide-react"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-xl bg-muted", className)}
      {...props}
    />
  )
}

function LoadingOverlay({
  open = true,
  message = "Memproses permintaan...",
  fullscreen = true,
}: {
  open?: boolean
  message?: string
  fullscreen?: boolean
}) {
  if (!open) return null

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        fullscreen
          ? "fixed inset-0 z-[100] bg-background/70 backdrop-blur-xs animate-in fade-in-0 duration-150"
          : "min-h-[55vh] w-full py-16"
      )}
    >
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-slate-200/80 bg-card/95 px-7 py-6 shadow-xl ring-1 ring-black/5 dark:border-white/10">
        <div className="relative flex size-12 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-600">
          <Loader2Icon className="size-6 animate-spin" />
        </div>
        <div className="flex flex-col items-center gap-0.5 text-center">
          <p className="font-heading text-sm font-extrabold tracking-tight text-foreground">
            Climate<span className="text-emerald-600">Stories</span>
          </p>
          <p className="text-xs font-medium text-muted-foreground">{message}</p>
        </div>
      </div>
    </div>
  )
}

export { Skeleton, LoadingOverlay }

