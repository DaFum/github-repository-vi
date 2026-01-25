import { ComponentProps } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-none border px-2 py-0.5 text-[10px] font-share-tech uppercase tracking-widest w-fit whitespace-nowrap shrink-0 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-primary/50 bg-primary/10 text-primary backdrop-blur-sm shadow-[0_0_10px_rgba(0,243,255,0.2)]',
        secondary:
          'border-secondary bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-destructive/50 bg-destructive/10 text-destructive shadow-[0_0_10px_rgba(255,51,51,0.2)]',
        outline: 'text-foreground border-white/20',
        neon: 'border-primary text-primary shadow-[0_0_10px_rgba(0,243,255,0.4)] bg-primary/5',
        solid: 'border-transparent bg-primary text-black font-bold',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
