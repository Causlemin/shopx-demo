import {
    Button,
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@repo/ui";
import { HomeIcon, LayoutDashboard, LayoutDashboardIcon, LogOut, MenuIcon, Package, PackageIcon, User2Icon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
    roles: string[];
    name: string;
}

const MenuMd = ({
    roles,
    name
}: Props) => {
    const { push } = useRouter();
    const pathname = usePathname();
    const isAdmin = roles?.includes('Admin');
    const [open, setOpen] = useState(false);

    const menuItems = [
        {
            label: "Anasayfa",
            path: "/",
            icon: HomeIcon
        },
        ...(isAdmin ? [
            {
                label: "Yönetim",
                path: "/admin/products",
                subPath: "/admin/logs",
                icon: LayoutDashboardIcon
            },
        ] : []),
        {
            label: "Siparişlerim",
            path: "/orders",
            icon: PackageIcon
        }
    ];

    return (
        <Drawer
            direction="right"
            open={open}
            onOpenChange={setOpen}
        >
            <DrawerTrigger asChild>
                <Button variant="outline" className="capitalize md:hidden">
                    <MenuIcon />
                </Button>
            </DrawerTrigger>
            <DrawerContent className="data-[vaul-drawer-direction=bottom]:max-h-[50vh] data-[vaul-drawer-direction=top]:max-h-[50vh]">
                <DrawerHeader>
                    <DrawerTitle className='flex items-center gap-2 capitalize'>
                        <User2Icon />
                        {name}
                    </DrawerTitle>
                    <DrawerDescription>
                    </DrawerDescription>
                </DrawerHeader>
                <div className="no-scrollbar flex flex-col gap-2 overflow-y-auto px-4">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.path || pathname === item?.subPath;

                        return (
                            <Button key={item.label}
                                variant={isActive ? 'default' : 'ghost'}
                                onClick={() => {
                                    setOpen(false);
                                    setTimeout(() => push(item.path), 300)
                                }}
                                className="py-6"
                            >
                                <item.icon />
                                {item.label}
                            </Button>
                        )
                    })}
                </div>
                <DrawerFooter>
                    <Button>
                        <LogOut className="mr-1 h-4 w-4" /> Çıkış
                    </Button>
                    <DrawerClose asChild>
                        <Button variant="outline">Kapat</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
};

export default MenuMd;