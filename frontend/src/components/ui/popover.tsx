"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Popover
 *
 * Displays the Popover component or handles Popover logic.
 * @param {
 *   ...props
 * } - The component or hook props/parameters.
 * @returns The rendered component or hook result.
 */
function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

/**
 * PopoverTrigger
 *
 * Displays the PopoverTrigger component or handles PopoverTrigger logic.
 * @param {
 *   ...props
 * } - The component or hook props/parameters.
 * @returns The rendered component or hook result.
 */
function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

/**
 * PopoverContent
 *
 * Displays the PopoverContent component or handles PopoverContent logic.
 * @param {
 *   className,
 *   align = "center",
 *   sideOffset = 4,
 *   ...props
 * } - The component or hook props/parameters.
 * @returns The rendered component or hook result.
 */
function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
}

/**
 * PopoverAnchor
 *
 * Displays the PopoverAnchor component or handles PopoverAnchor logic.
 * @param {
 *   ...props
 * } - The component or hook props/parameters.
 * @returns The rendered component or hook result.
 */
function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
}

/**
 * PopoverHeader
 *
 * Displays the PopoverHeader component or handles PopoverHeader logic.
 * @param { className, ...props } - The component or hook props/parameters.
 * @returns The rendered component or hook result.
 */
function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-header"
      className={cn("flex flex-col gap-1 text-sm", className)}
      {...props}
    />
  )
}

/**
 * PopoverTitle
 *
 * Displays the PopoverTitle component or handles PopoverTitle logic.
 * @param { className, ...props } - The component or hook props/parameters.
 * @returns The rendered component or hook result.
 */
function PopoverTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <div
      data-slot="popover-title"
      className={cn("font-medium", className)}
      {...props}
    />
  )
}

/**
 * PopoverDescription
 *
 * Displays the PopoverDescription component or handles PopoverDescription logic.
 * @param {
 *   className,
 *   ...props
 * } - The component or hook props/parameters.
 * @returns The rendered component or hook result.
 */
function PopoverDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="popover-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
}
