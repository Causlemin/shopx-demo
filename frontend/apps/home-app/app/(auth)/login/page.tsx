'use client';

import { useAuthStore } from '@/store/authStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { authApi } from "@repo/api-client";
import { LoginFormData, loginSchema, RegisterFormData, registerSchema } from '@repo/api-client/validations';
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui";
import { Eye, EyeOff, Loader2, ShoppingBagIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

export default function LoginPage() {
    const router = useRouter();
    const { setAuth, setLoading: setStoreLoading, isLoading: storeLoading } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const loginForm = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: { emailOrUsername: '', password: '' },
    });

    const registerForm = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: { email: '', username: '', password: '', confirmPassword: '', roles: ['User'] },
    });

    const handleLogin: SubmitHandler<LoginFormData> = async (data: LoginFormData) => {
        setStoreLoading(true);

        try {
            const response = await authApi.login(data.emailOrUsername, data.password);

            if (response.success && response.user) {
                setAuth(response.user);
                toast.success('Hoş geldiniz!', {
                    description: `${response.user.username} olarak giriş yaptınız.`,
                });
                router.push('/');
            } else {
                toast.error('Giriş başarısız', {
                    description: response.message || 'E-posta/şifre hatalı.',
                });
            }
        } catch (error: any) {
            toast.error('Hata oluştu', {
                description: error.response?.data?.message || 'Giriş yapılırken bir hata oluştu.',
            });
        } finally {
            setStoreLoading(false);
        }
    };

    const handleRegister: SubmitHandler<RegisterFormData> = async (data: RegisterFormData) => {
        setStoreLoading(true);

        try {
            const response = await authApi.register(data.email, data.username, data.password, data.roles);

            if (response.success) {
                toast.success('Kayıt başarılı!', {
                    description: 'Hesabınız oluşturuldu. Lütfen giriş yapın.',
                });

                loginForm.setValue('emailOrUsername', data.username);
                loginForm.setValue('password', '');

                const loginTab = document.querySelector('[data-value="login"]') as HTMLElement;
                if (loginTab) loginTab.click();

                registerForm.reset();
            } else {
                toast.error('Kayıt başarısız', {
                    description: response.message || 'Hesap oluşturulamadı.',
                });
            }
        } catch (error: any) {
            toast.error('Hata oluştu', {
                description: error.response?.data?.message || 'Kayıt sırasında bir hata oluştu.',
            });
        } finally {
            setStoreLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 p-4 dark:from-slate-950 dark:to-slate-900">
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-3xl font-bold flex items-center gap-2">
                        <ShoppingBagIcon />    
                        ShopX
                    </CardTitle>
                    <CardDescription>Alışverişe başlamak için giriş yap veya hesap oluştur</CardDescription>
                </CardHeader>

                <Tabs defaultValue="login" className="w-full flex flex-col">
                    <TabsList className="mx-6 grid w-auto grid-cols-2">
                        <TabsTrigger value="login" data-value="login">Giriş Yap</TabsTrigger>
                        <TabsTrigger value="register" data-value="register">Kayıt Ol</TabsTrigger>
                    </TabsList>

                    <TabsContent value="login">
                        <form onSubmit={loginForm.handleSubmit(handleLogin)}>
                            <CardContent className="space-y-4 pt-4 pb-4">
                                <div className="space-y-2">
                                    <Label htmlFor="emailOrUsername">E-posta veya Kullanıcı Adı</Label>
                                    <Input
                                        id="emailOrUsername"
                                        placeholder="E-posta adresiniz veya kullanıcı adınız"
                                        {...loginForm.register('emailOrUsername')}
                                        className={loginForm.formState.errors.emailOrUsername ? 'border-red-500' : ''}
                                    />
                                    {loginForm.formState.errors.emailOrUsername && (
                                        <p className="text-sm text-red-500">{loginForm.formState.errors.emailOrUsername.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Şifre</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Şifreniz"
                                            {...loginForm.register('password')}
                                            className={loginForm.formState.errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                    {loginForm.formState.errors.password && (
                                        <p className="text-sm text-red-500">{loginForm.formState.errors.password.message}</p>
                                    )}
                                </div>
                            </CardContent>

                            <CardFooter className="flex flex-col gap-4">
                                <Button type="submit" className="w-full" disabled={storeLoading}>
                                    {storeLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Giriş yapılıyor...
                                        </>
                                    ) : (
                                        'Giriş Yap'
                                    )}
                                </Button>
                            </CardFooter>
                        </form>
                    </TabsContent>

                    <TabsContent value="register">
                        <form onSubmit={registerForm.handleSubmit(handleRegister)}>
                            <CardContent className="space-y-4 pt-4 pb-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">E-posta</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="ornek@email.com"
                                        {...registerForm.register('email')}
                                        className={registerForm.formState.errors.email ? 'border-red-500' : ''}
                                    />
                                    {registerForm.formState.errors.email && (
                                        <p className="text-sm text-red-500">{registerForm.formState.errors.email.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="username">Kullanıcı Adı</Label>
                                    <Input
                                        id="username"
                                        placeholder="Bir kullanıcı adı seçin"
                                        {...registerForm.register('username')}
                                        className={registerForm.formState.errors.username ? 'border-red-500' : ''}
                                    />
                                    {registerForm.formState.errors.username && (
                                        <p className="text-sm text-red-500">{registerForm.formState.errors.username.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="username">Rolü</Label>
                                    <Controller
                                        control={registerForm.control}
                                        name="roles"
                                        render={({ field }) => (
                                            <Select
                                                value={field.value?.[0] || 'User'}
                                                onValueChange={(value) => {
                                                    const roles = value === 'Admin' ? ['Admin', 'User'] : ['User'];
                                                    field.onChange(roles);
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Hesap Tipi Seçin" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="User">Müşteri - Ürünleri satın alabilir</SelectItem>
                                                    <SelectItem value="Admin">Yönetici - Ürünleri yönetebilir</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="register-password">Şifre</Label>
                                    <div className="relative">
                                        <Input
                                            id="register-password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Güçlü bir şifre oluşturun"
                                            {...registerForm.register('password')}
                                            className={registerForm.formState.errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                    {registerForm.formState.errors.password && (
                                        <p className="text-sm text-red-500">{registerForm.formState.errors.password.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="Şifrenizi tekrar girin"
                                            {...registerForm.register('confirmPassword')}
                                            className={registerForm.formState.errors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                    {registerForm.formState.errors.confirmPassword && (
                                        <p className="text-sm text-red-500">{registerForm.formState.errors.confirmPassword.message}</p>
                                    )}
                                </div>
                            </CardContent>

                            <CardFooter>
                                <Button type="submit" className="w-full" disabled={storeLoading}>
                                    {storeLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Hesap oluşturuluyor...
                                        </>
                                    ) : (
                                        'Hesap Oluştur'
                                    )}
                                </Button>
                            </CardFooter>
                        </form>
                    </TabsContent>
                </Tabs>

                <div className="p-6 pt-0 text-center text-xs text-muted-foreground">
                    Devam ederek Kullanım Koşulları ve Gizlilik Politikası'nı kabul etmiş olursunuz.
                </div>
            </Card>
        </div>
    );
}