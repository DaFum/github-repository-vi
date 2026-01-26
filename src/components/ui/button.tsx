import { ComponentProps } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-xs font-orbitron font-bold uppercase tracking-widest transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 active:scale-95",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-black hover:bg-primary/80 shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:shadow-[0_0_30px_rgba(0,243,255,0.6)] border border-transparent',
        destructive:
          'bg-destructive text-white hover:bg-destructive/80 shadow-[0_0_20px_rgba(255,51,51,0.4)]',
        outline:
          'border border-primary/50 text-primary bg-transparent hover:bg-primary/10 hover:border-primary hover:shadow-[0_0_15px_rgba(0,243,255,0.2)]',
        ghost:
          'text-primary/70 hover:text-primary hover:bg-primary/10',
        link: 'text-primary underline-offset-4 hover:underline',
        holographic:
          'bg-primary/10 border border-primary/30 text-primary backdrop-blur-sm hover:bg-primary/20 hover:border-primary/60 shadow-[0_0_10px_rgba(0,243,255,0.1)] hover:shadow-[0_0_20px_rgba(0,243,255,0.3)]',
        neon:
          'bg-transparent border border-primary text-primary shadow-[inset_0_0_10px_rgba(0,243,255,0.2),0_0_10px_rgba(0,243,255,0.4)] hover:bg-primary hover:text-black hover:shadow-[0_0_30px_rgba(0,243,255,0.6)]'
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 px-3 text-[10px]',
        lg: 'h-10 px-8',
        icon: 'h-9 w-9',
      },
      shape: {
        default: 'rounded-none', // Sharp industrial edges
        chamfer: '[clip-path:polygon(10px_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%,0_10px)]', // Custom clip-path via Tailwind arbitrary property
        rounded: 'rounded-md',
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      shape: 'default',
    },
  }
)

function Button({
  className,
  variant,
  size,
  shape,
  asChild = false,
  ...props
}: ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    shape?: 'default' | 'chamfer' | 'rounded'
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, shape, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
