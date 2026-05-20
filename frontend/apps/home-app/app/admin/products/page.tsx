'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@repo/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@repo/ui';
import { Input } from '@repo/ui';
import { Label } from '@repo/ui';
import { productApi } from "@repo/api-client";
import { zodResolver } from '@hookform/resolvers/zod';
import { LogsIcon, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { createProductSchema, ProductFormData } from '@repo/api-client/validations';
import { formatCurrency } from '@/constants';
import { useRouter } from 'next/navigation';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    imageUrl?: string;
    isActive: boolean;
}

function AdminProductsContent() {
    const {push} = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<ProductFormData>({
        resolver: zodResolver(createProductSchema),
        defaultValues: {
            name: '',
            description: '',
            price: "0",
            stock: "0",
            category: '',
            imageUrl: undefined,
        }
    });

    const fetchProducts = async () => {
        try {
            const response = await productApi.getAll();
            setProducts(response.data);
        } catch (error) {
            console.error('Ürünler yüklenirken hata oluştu:', error);
            toast.error('Hata', {
                description: 'Ürünler yüklenirken bir hata oluştu'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const onSubmit: SubmitHandler<ProductFormData> = async (data: ProductFormData) => {
        try {
            if (editingProduct) {
                await productApi.update(editingProduct.id, {
                    ...data,
                    price: parseFloat(data.price),
                    stock: parseInt(data.stock, 10)
                });
                toast.success('Başarılı!', {
                    description: 'Ürün başarıyla güncellendi!'
                });
            } else {
                await productApi.create({
                    ...data,
                    price: parseFloat(data.price),
                    stock: parseInt(data.stock, 10)
                });
                toast.success('Başarılı!', {
                    description: 'Ürün başarıyla oluşturuldu!'
                });
            }

            setIsDialogOpen(false);
            setEditingProduct(null);
            reset();
            fetchProducts();
        } catch (error) {
            console.error("Ürün kaydedilirken hata oluştu:", error);
            toast.error('Hata!', {
                description: 'İşlem başarısız oldu'
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
            try {
                await productApi.delete(id);
                toast.success('Başarılı!', {
                    description: 'Ürün başarıyla silindi!'
                });
                fetchProducts();
            } catch (error) {
                toast.error('Hata!', {
                    description: 'Silme işlemi başarısız oldu'
                });
            }
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        reset({
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            stock: product.stock.toString(),
            category: product.category,
            imageUrl: product.imageUrl || ''
        });
        setIsDialogOpen(true);
    };

    const handleDialogClose = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
            setEditingProduct(null);
            reset();
        }
    };

    if (loading) {
        return <div className="flex min-h-screen items-center justify-center">Yükleniyor...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Admin Paneli - Ürünler</h1>
                    <p className="text-muted-foreground">Ürün envanterinizi yönetin</p>
                </div>
                <div className='flex items-center gap-1'>
                    <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
                        <DialogTrigger asChild>
                            <Button onClick={() => {
                                setEditingProduct(null);
                                reset();
                            }}>
                                <Plus className="mr-2 h-4 w-4" /> Ürün Ekle
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}</DialogTitle>
                                <DialogDescription>
                                    {editingProduct ? 'Ürünü düzenlemek için formu güncelleyin.' : 'Yeni bir ürün eklemek için formu doldurun.'}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className='space-y-1'>
                                    <Label htmlFor="name" className='text-xs'>Ürün Adı</Label>
                                    <Controller
                                        name="name"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                id="name"
                                                {...field}
                                                className={errors.name ? 'border-red-500' : ''}
                                            />
                                        )}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                                    )}
                                </div>

                                <div className='space-y-1'>
                                    <Label htmlFor="description" className='text-xs'>Açıklama</Label>
                                    <Controller
                                        name="description"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                id="description"
                                                {...field}
                                                className={errors.description ? 'border-red-500' : ''}
                                            />
                                        )}
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
                                    )}
                                </div>

                                <div className='space-y-1'>
                                    <Label htmlFor="price" className='text-xs'>Fiyat (₺)</Label>
                                    <Controller
                                        name="price"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                id="price"
                                                type="number"
                                                step="0.01"
                                                {...field}
                                                onChange={field.onChange}
                                                className={errors.price ? 'border-red-500' : ''}
                                            />
                                        )}
                                    />
                                    {errors.price && (
                                        <p className="text-sm text-red-500 mt-1">{errors.price.message}</p>
                                    )}
                                </div>

                                <div className='space-y-1'>
                                    <Label htmlFor="stock" className='text-xs'>Stok</Label>
                                    <Controller
                                        name="stock"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                id="stock"
                                                type="number"
                                                {...field}
                                                onChange={field.onChange}
                                                className={errors.stock ? 'border-red-500' : ''}
                                            />
                                        )}
                                    />
                                    {errors.stock && (
                                        <p className="text-sm text-red-500 mt-1">{errors.stock.message}</p>
                                    )}
                                </div>

                                <div className='space-y-1'>
                                    <Label htmlFor="category" className='text-xs'>Kategori</Label>
                                    <Controller
                                        name="category"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                id="category"
                                                value={field.value || ''}
                                                onChange={field.onChange}
                                                className={errors.category ? 'border-red-500' : ''}
                                            />
                                        )}
                                    />
                                    {errors.category && (
                                        <p className="text-sm text-red-500 mt-1">{errors.category.message}</p>
                                    )}
                                </div>

                                <div className='space-y-1'>
                                    <Label htmlFor="imageUrl" className='text-xs'>Resim URL (isteğe bağlı)</Label>
                                    <Controller
                                        name="imageUrl"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                id="imageUrl"
                                                value={field.value || ''}
                                                onChange={field.onChange}
                                            />
                                        )}
                                    />
                                </div>

                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? 'İşleniyor...' : (editingProduct ? 'Güncelle' : 'Oluştur')}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                    <Button onClick={() => {
                        push("/admin/logs")
                    }}>
                        <LogsIcon className="mr-2 h-4 w-4" /> Sistem Logları
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                    <Card key={product.id} className="relative shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle>{product.name}</CardTitle>
                            <div className="text-sm text-muted-foreground">{product.category}</div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                            <div className="mt-4 flex items-center justify-between">
                                <span className="text-2xl font-bold">₺{formatCurrency(product.price)}</span>
                                <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    Stok: {product.stock}
                                </span>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                                    <Pencil className="mr-1 h-3 w-3" /> Düzenle
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id)}>
                                    <Trash2 className="mr-1 h-3 w-3" /> Sil
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export default function AdminProductsPage() {
    return (
        <ProtectedRoute adminOnly>
            <AdminProductsContent />
        </ProtectedRoute>
    );
}