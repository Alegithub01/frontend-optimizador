'use client';

import { useState, useEffect } from 'react';
import { User, UserStats, UserRole } from '@/types/user';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  Shield, 
  UserCheck, 
  User as UserIcon,
  Search,
  RefreshCw,
  Filter,
  Crown,
  Settings,
  Mail,
  Calendar,
  Edit
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    adminUsers: 0,
    atcUsers: 0,
    regularUsers: 0,
    newUsersThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('user');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      const data = await api.get<User[]>('/users');
      setUsers(data);
      calculateStats(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (usersData: User[]) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const stats: UserStats = {
      totalUsers: usersData.length,
      adminUsers: usersData.filter(user => user.role === 'admin').length,
      atcUsers: usersData.filter(user => user.role === 'atc').length,
      regularUsers: usersData.filter(user => user.role === 'user').length,
      newUsersThisMonth: usersData.filter(user => {
        // Asumiendo que tienes un campo createdAt, si no, puedes omitir esta estadística
        return true; // Placeholder - ajusta según tu estructura de datos
      }).length,
    };
    
    setStats(stats);
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.surname && user.surname.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const updateUserRole = async (userId: number, newRole: UserRole) => {
    try {
      await api.patch(`/users/${userId}`, { role: newRole });
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      calculateStats(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      toast({
        title: "Rol actualizado",
        description: `El rol del usuario se ha actualizado a ${getRoleLabel(newRole)}.`,
      });
      setDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el rol del usuario.",
        variant: "destructive",
      });
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><Crown className="h-3 w-3 mr-1" />Admin</Badge>;
      case 'atc':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100"><Settings className="h-3 w-3 mr-1" />ATC</Badge>;
      case 'user':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100"><UserIcon className="h-3 w-3 mr-1" />Usuario</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'atc':
        return 'ATC';
      case 'user':
        return 'Usuario';
      default:
        return role;
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4 text-red-600" />;
      case 'atc':
        return <Settings className="h-4 w-4 text-blue-600" />;
      case 'user':
        return <UserIcon className="h-4 w-4 text-gray-600" />;
      default:
        return <UserIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const getInitials = (name: string, surname?: string) => {
    const firstInitial = name.charAt(0).toUpperCase();
    const lastInitial = surname ? surname.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial;
  };

  const openRoleDialog = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600">Administra usuarios y sus roles en el sistema</p>
        </div>
        <Button
          variant="outline"
          onClick={fetchUsers}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">usuarios registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <Crown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.adminUsers}</div>
            <p className="text-xs text-muted-foreground">con acceso completo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ATC</CardTitle>
            <Settings className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.atcUsers}</div>
            <p className="text-xs text-muted-foreground">personal de atención</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Regulares</CardTitle>
            <UserIcon className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.regularUsers}</div>
            <p className="text-xs text-muted-foreground">usuarios estándar</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="admin">Administradores</SelectItem>
                <SelectItem value="atc">ATC</SelectItem>
                <SelectItem value="user">Usuarios</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-2" />
              {filteredUsers.length} usuarios
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol Actual</TableHead>
                  <TableHead>Método de Registro</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={user.picture} alt={user.name} />
                          <AvatarFallback>
                            {getInitials(user.name, user.surname)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {user.name} {user.surname || ''}
                          </div>
                          <div className="text-sm text-gray-600">ID: #{user.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(user.role)}
                        {getRoleBadge(user.role)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {user.googleId ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            Google
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Email
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Dialog open={dialogOpen && selectedUser?.id === user.id} onOpenChange={(open) => {
                        if (!open) {
                          setDialogOpen(false);
                          setSelectedUser(null);
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openRoleDialog(user)}
                          >
                            <Edit className="h-4 w-4 mr-2 bg-white" />
                            Cambiar Rol
                          </Button>
                        </DialogTrigger>
                        <DialogContent className='bg-white'>
                          <DialogHeader>
                            <DialogTitle>Cambiar Rol de Usuario</DialogTitle>
                            <DialogDescription>
                              Estás a punto de cambiar el rol de <strong>{user.name}</strong>. 
                              Esta acción afectará los permisos del usuario en el sistema.
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Usuario</Label>
                              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <Avatar>
                                  <AvatarImage src={user.picture} alt={user.name} />
                                  <AvatarFallback>
                                    {getInitials(user.name, user.surname)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{user.name} {user.surname || ''}</div>
                                  <div className="text-sm text-gray-600">{user.email}</div>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label>Rol Actual</Label>
                              <div className="flex items-center space-x-2">
                                {getRoleIcon(user.role)}
                                {getRoleBadge(user.role)}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="newRole">Nuevo Rol</Label>
                              <Select value={newRole} onValueChange={(value: UserRole) => setNewRole(value)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className='bg-white'>
                                  <SelectItem value="user">
                                    <div className="flex items-center bg-white">
                                      <UserIcon className="h-4 w-4 mr-2 text-gray-600" />
                                      Usuario - Acceso básico
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="atc">
                                    <div className="flex items-center">
                                      <Settings className="h-4 w-4 mr-2 text-blue-600" />
                                      ATC - Atención al cliente
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="admin">
                                    <div className="flex items-center">
                                      <Crown className="h-4 w-4 mr-2 text-red-600" />
                                      Admin - Acceso completo
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <div className="flex items-start">
                                <Shield className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                                <div className="text-sm">
                                  <p className="font-medium text-yellow-800">Información sobre roles:</p>
                                  <ul className="mt-1 text-yellow-700 space-y-1">
                                    <li><strong>Usuario:</strong> Acceso básico a la plataforma</li>
                                    <li><strong>ATC:</strong> Puede gestionar ventas</li>
                                    <li><strong>Admin:</strong> Acceso completo a todas las funciones</li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>

                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setDialogOpen(false);
                                setSelectedUser(null);
                              }}
                            >
                              Cancelar
                            </Button>
                            <Button
                              onClick={() => selectedUser && updateUserRole(selectedUser.id, newRole)}
                              disabled={newRole === user.role}
                            >
                              Actualizar Rol
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron usuarios
              </h3>
              <p className="text-gray-600">
                {searchTerm || roleFilter !== 'all'
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Aún no hay usuarios registrados'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}