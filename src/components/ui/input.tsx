import * as React from "react"

import { cn } from "@/lib/utils"
import { useTranslation } from "react-i18next"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    const { t } = useTranslation();
    const [isClient, setIsClient] = React.useState(false);
    React.useEffect(() => { setIsClient(true) }, []);

    const fileButtonText = isClient ? t('change') : 'Change';
    const fileNoFileText = isClient ? t('no_file_selected') : 'No file selected';


    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "file:mr-4 file:rounded-md file:border file:border-input file:bg-background file:px-3 file:py-1 file:text-sm file:font-medium file:text-foreground hover:file:bg-accent hover:file:text-accent-foreground",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
