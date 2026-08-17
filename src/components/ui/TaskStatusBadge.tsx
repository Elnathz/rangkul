import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { TaskStatus, TASK_STATUS_LABELS, TASK_STATUS_COLORS } from "@/lib/constants/task-status"
import { cn } from "@/lib/utils"

interface TaskStatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: TaskStatus;
}

export function TaskStatusBadge({ status, className, ...props }: TaskStatusBadgeProps) {
  const label = TASK_STATUS_LABELS[status];
  const colorClass = TASK_STATUS_COLORS[status];

  return (
    <Badge 
      variant="outline" 
      className={cn(colorClass, "capitalize whitespace-nowrap px-2.5 py-0.5", className)}
      {...props}
    >
      {label}
    </Badge>
  )
}
