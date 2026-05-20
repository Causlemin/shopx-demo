import { useCartStore } from "@/store/cartStore";
import { cartApi } from "@repo/api-client";
import { emitCartSync } from "@repo/event-bus";
import {
    Button, DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup, DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@repo/ui";
import { Package2Icon, ShoppingCart, ShoppingCartIcon } from "lucide-react";
import { CartItemComponent } from "./CartItem";
import { useState } from "react";

type Props = {
    items: any[];
}

const NavbarCart = ({
    items
}: Props) => {
    const { clearCart } = useCartStore();
    const [open, setOpen] = useState(false);

    const handleClearCart = async () => {
        clearCart();
        await cartApi.clear();
        await emitCartSync([]);
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="relative">
                    <ShoppingCart className="mr-1 h-4 w-4" />
                    <h1 className='hidden md:block'>Sepet</h1>
                    {items.length > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                            {items.length}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-100 p-4 mr-4">
                <DropdownMenuLabel className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-1">
                        <ShoppingCartIcon className="w-4 h-4" />
                        Sepetiniz
                    </span>
                    <Button variant="ghost" onClick={handleClearCart}>
                        Tümünü Temizle
                    </Button>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup asChild className="mt-4">
                    <div className="max-h-150 p-1 overflow-y-auto">
                        {items.length > 0 ?
                            items.map((item) =>
                                <CartItemComponent key={item.id} item={item} />
                            )
                            :
                            <span className="flex flex-col items-center gap-2 py-8 text-muted-foreground text-sm">
                                <Package2Icon />
                                Henüz ürün eklememişsiniz
                            </span>
                        }
                    </div>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup asChild className="mt-3">
                    <a
                        href="http://localhost:3001"
                        target="_blank"
                        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                        onClick={() => setOpen(false)}
                    >
                        Sepete git
                        <ShoppingCart className='w-4 h-4' />
                    </a>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
};

export default NavbarCart;