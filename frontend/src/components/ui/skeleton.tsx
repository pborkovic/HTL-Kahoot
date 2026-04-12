import { cn } from "@/lib/utils"

/**
 * Skeleton
 *
 * Displays the Skeleton component or handles Skeleton logic.
 * @param { className, ...props } - The component or hook props/parameters.
 * @returns The rendered component or hook result.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-accent", className)}
      {...props}
    />
  )
}

export { Skeleton }
