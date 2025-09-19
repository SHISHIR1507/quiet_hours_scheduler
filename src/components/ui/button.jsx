import * as React from "react";
import { cn } from "@/lib/utils";

const Button = React.forwardRef(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

    const variants = {
      default: "bg-blue-500 text-white hover:bg-blue-600",
      destructive: "bg-red-500 text-white hover:bg-red-600",
      secondary: "bg-gray-200 text-black hover:bg-gray-300",
      outline: "border border-gray-300 bg-white text-black hover:bg-gray-100",
      ghost: "hover:bg-gray-100 text-black",
      link: "text-blue-600 underline hover:text-blue-800",
    };

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-8 px-3 text-sm",
      lg: "h-12 px-6 text-lg",
    };

    const finalClasses = cn(base, variants[variant], sizes[size], className);
    
    // Debug logging
    console.log("Button variant:", variant);
    console.log("Generated classes:", finalClasses);

    return (
      <button
        ref={ref}
        className={finalClasses}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };