import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "lib/utils"

const cardVariants = cva(
  "text-card-foreground transition-all duration-300",
  {
    variants: {
      variant: {
        default: "rounded-2xl border bg-card shadow-soft",
        elevated: "rounded-2xl border-0 bg-card shadow-elevated hover:shadow-float",
        float: "rounded-3xl border-0 bg-card shadow-float hover:translate-y-[-4px]",
        glass: "rounded-2xl bg-card/60 backdrop-blur-lg border border-border/50 shadow-glass",
        premium: "rounded-3xl bg-gradient-to-br from-card to-muted border-0 shadow-elevated",
        product: "rounded-3xl border-0 bg-card shadow-soft hover:shadow-elevated overflow-hidden group",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Card = React.forwardRef(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(cardVariants({ variant, className }))}
    {...props} />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2 p-6", className)}
    {...props} />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-serif text-xl font-semibold leading-tight tracking-tight", className)}
    {...props} />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground font-sans", className)}
    {...props} />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props} />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants }

