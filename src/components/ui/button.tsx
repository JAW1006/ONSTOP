import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

// 레거시 PrimaryBtn(그라디언트) + 테두리 버튼 + 틴트 버튼
const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-1.5 font-bold transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary:
          "[background:var(--ts-grad-primary)] text-primary-foreground shadow-primary disabled:[background:var(--ts-disabled)] disabled:shadow-none",
        outline: "border-[1.5px] border-blue bg-card text-blue disabled:border-disabled disabled:text-faint",
        secondary: "bg-tint text-blue-deep disabled:text-faint",
        ghost: "bg-transparent text-sub disabled:text-faint",
      },
      size: {
        lg: "w-full rounded-lg py-[15px] text-emph",
        md: "rounded-md px-6 py-[13px] text-emph",
        sm: "rounded-sm px-3 py-2 text-body",
        icon: "size-8 rounded-full p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "lg" },
  },
);

export type ButtonProps = ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({ className, variant, size, asChild = false, type = "button", ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...(asChild ? {} : { type })}
      {...props}
    />
  );
}

export { buttonVariants };
