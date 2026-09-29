"use client";

import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes, Ref } from "react";
import { cn } from "./lib/cn";
import {
  buttonVariants,
  type ButtonVariantProps,
} from "./button-styles";

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariantProps {
  asChild?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ref,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
