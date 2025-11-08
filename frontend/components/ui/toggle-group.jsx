"use client";

import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { cn } from "@/lib/utils";

export const ToggleGroup = React.forwardRef(
  ({ className, type = "single", ...props }, ref) => (
    <ToggleGroupPrimitive.Root
      ref={ref}
      type={type}
      className={cn("inline-flex flex-wrap items-center gap-1", className)}
      {...props}
    />
  )
);
ToggleGroup.displayName = "ToggleGroup";

export const ToggleGroupItem = React.forwardRef(
  ({ className, ...props }, ref) => (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        "px-3 py-1 text-sm rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 data-[state=on]:bg-blue-600 data-[state=on]:text-white data-[state=on]:border-blue-600",
        className
      )}
      {...props}
    />
  )
);
ToggleGroupItem.displayName = "ToggleGroupItem";
