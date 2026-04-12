"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Table
 *
 * Displays the Table component or handles Table logic.
 * @param { className, ...props } - The component or hook props/parameters.
 * @returns The rendered component or hook result.
 */
function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

/**
 * TableHeader
 *
 * Displays the TableHeader component or handles TableHeader logic.
 * @param { className, ...props } - The component or hook props/parameters.
 * @returns The rendered component or hook result.
 */
function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  )
}

/**
 * TableBody
 *
 * Displays the TableBody component or handles TableBody logic.
 * @param { className, ...props } - The component or hook props/parameters.
 * @returns The rendered component or hook result.
 */
function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

/**
 * TableFooter
 *
 * Displays the TableFooter component or handles TableFooter logic.
 * @param { className, ...props } - The component or hook props/parameters.
 * @returns The rendered component or hook result.
 */
function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

/**
 * TableRow
 *
 * Displays the TableRow component or handles TableRow logic.
 * @param { className, ...props } - The component or hook props/parameters.
 * @returns The rendered component or hook result.
 */
function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    />
  )
}

/**
 * TableHead
 *
 * Displays the TableHead component or handles TableHead logic.
 * @param { className, ...props } - The component or hook props/parameters.
 * @returns The rendered component or hook result.
 */
function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

/**
 * TableCell
 *
 * Displays the TableCell component or handles TableCell logic.
 * @param { className, ...props } - The component or hook props/parameters.
 * @returns The rendered component or hook result.
 */
function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

/**
 * TableCaption
 *
 * Displays the TableCaption component or handles TableCaption logic.
 * @param {
 *   className,
 *   ...props
 * } - The component or hook props/parameters.
 * @returns The rendered component or hook result.
 */
function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
