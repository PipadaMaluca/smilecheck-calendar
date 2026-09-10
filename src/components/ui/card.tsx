import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Card primitive — ONE contract:
 * - Card root: card surface + border + radius + subtle shadow (design tokens only)
 * - CardHeader / CardContent / CardFooter: a single consistent internal padding (16px)
 * - CardTitle: explicit size variants (compact | default | section | hero)
 * - CardDescription: no arbitrary side padding
 * Special spacing belongs on the consumer via className.
 */

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-lg border border-border bg-card text-card-foreground shadow-sm", className)}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-4 pb-2", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

export type CardTitleSize = "compact" | "default" | "section" | "hero";

const CARD_TITLE_SIZES: Record<CardTitleSize, string> = {
  compact: "text-sm",
  default: "text-base",
  section: "text-lg",
  hero: "text-2xl",
};

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  size?: CardTitleSize;
}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, size = "default", ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("font-semibold leading-tight tracking-tight", CARD_TITLE_SIZES[size], className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-4", className)} {...props} />
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-4 pt-0", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
