import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverClose = PopoverPrimitive.Close;

const PopoverContent = React.forwardRef(
    ({ children,
        sideOffset = 6,
        collisionPadding = 16,
        showArrow = false,
        ...props
    },
    ref
    ) => (
        <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
                sideOffset={sideOffset}
                collisionPadding={collisionPadding}
                {...props}
                ref={ref}
            >
                {children}
                {showArrow && <PopoverPrimitive.Arrow />}
            </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
    ),
);
PopoverContent.displayName = "PopoverContent";

export {
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverClose,
};
