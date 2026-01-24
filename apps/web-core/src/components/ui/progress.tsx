import * as React from "react"
import { Root as ProgressRoot, Indicator as ProgressIndicator } from "@radix-ui/react-progress"

import { cn } from "@/utils"

const Progress = React.forwardRef<
  React.ComponentRef<typeof ProgressRoot>,
  React.ComponentPropsWithoutRef<typeof ProgressRoot>
>(({ className, value, ...props }, ref) => (
  <ProgressRoot
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <ProgressIndicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${(100 - (value || 0)).toString()}%)` }}
    />
  </ProgressRoot>
))
Progress.displayName = "Progress"

export { Progress }
