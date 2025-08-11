import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
    return (
        <Sonner
            className="toaster group"
            position="top-right"
            toastOptions={{
                classNames: {
                    toast:
                        "group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-950 group-[.toaster]:border group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg",
                    description: "group-[.toast]:text-gray-600",
                    actionButton:
                        "group-[.toast]:bg-blue-600 group-[.toast]:text-white group-[.toast]:hover:bg-blue-700",
                    cancelButton:
                        "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-600 group-[.toast]:hover:bg-gray-200",
                    success:
                        "group-[.toaster]:border-green-200 group-[.toaster]:bg-green-50 group-[.toaster]:text-green-800",
                    error:
                        "group-[.toaster]:border-red-200 group-[.toaster]:bg-red-50 group-[.toaster]:text-red-800",
                    warning:
                        "group-[.toaster]:border-yellow-200 group-[.toaster]:bg-yellow-50 group-[.toaster]:text-yellow-800",
                    info:
                        "group-[.toaster]:border-blue-200 group-[.toaster]:bg-blue-50 group-[.toaster]:text-blue-800",
                },
            }}
            {...props}
        />
    )
}

export { Toaster }
