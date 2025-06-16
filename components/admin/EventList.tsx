'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Event } from '@/types/event';
import { api } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Edit, Trash2, Search, Plus, Calendar, Users, MapPin, Clock, Minus, UserMinus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function EventList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [cuposToReduce, setCuposToReduce] = useState<number>(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm]);

  const fetchEvents = async () => {
    try {
      const data = await api.get<Event[]>('/event');
      setEvents(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los eventos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    if (!searchTerm) {
      setFilteredEvents(events);
      return;
    }

    const filtered = events.filter(event =>
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.subCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEvents(filtered);
  };

  const deleteEvent = async (id: string) => {
    try {
      await api.delete(`/event/${id}`);
      setEvents(events.filter(e => e.id !== id));
      toast({
        title: "Evento eliminado",
        description: "El evento se ha eliminado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el evento.",
        variant: "destructive",
      });
    }
  };

  const reduceCupos = async (eventId: string, cuposToReduce: number) => {
    try {
      const event = events.find(e => e.id === eventId);
      if (!event) return;

      const newRegistered = Math.min(event.registered + cuposToReduce, event.capacity);
      
      await api.patch(`/event/${eventId}`, { registered: newRegistered });
      
      setEvents(events.map(e => 
        e.id === eventId ? { ...e, registered: newRegistered } : e
      ));
      
      toast({
        title: "Cupos actualizados",
        description: `Se registraron ${cuposToReduce} personas. Total: ${newRegistered}/${event.capacity}`,
      });
      
      setDialogOpen(false);
      setSelectedEvent(null);
      setCuposToReduce(1);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron actualizar los cupos.",
        variant: "destructive",
      });
    }
  };

  const isEventPast = (eventDate: string) => {
    return new Date(eventDate) < new Date();
  };

  const getEventStatus = (event: Event) => {
    const isPast = isEventPast(event.eventDate);
    const isFull = event.registered >= event.capacity;
    
    if (isPast) {
      return <Badge className="bg-gray-100 text-gray-800">Finalizado</Badge>;
    } else if (isFull) {
      return <Badge className="bg-red-100 text-red-800">Completo</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800">Disponible</Badge>;
    }
  };

  const openCuposDialog = (event: Event) => {
    setSelectedEvent(event);
    setCuposToReduce(1);
    setDialogOpen(true);
  };

  const isAdmin = user?.role === 'admin';
  const isATC = user?.role === 'atc';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <Calendar className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Eventos</h1>
            <p className="text-gray-600">
              {isAdmin ? 'Gestiona todos los eventos de tu plataforma' : 'Gestiona cupos de eventos (ventas por WhatsApp)'}
            </p>
          </div>
        </div>
        {isAdmin && (
          <Link href="/admin/events/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Evento
            </Button>
          </Link>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar eventos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>{filteredEvents.length} eventos</span>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No se encontraron eventos' : 'No hay eventos'}
            </h3>
            <p className="text-gray-600 text-center mb-4">
              {searchTerm 
                ? 'Intenta con otros términos de búsqueda'
                : 'Comienza creando tu primer evento'
              }
            </p>
            {!searchTerm && isAdmin && (
              <Link href="/admin/events/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Evento
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video relative">
                <Image
                  src={event.image}
                  alt={event.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                      {event.name}
                    </h3>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Por {event.organizer}</span>
                    <span className="font-medium text-green-600">
                      ${event.price.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Badge variant="secondary">{event.category}</Badge>
                      {getEventStatus(event)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {event.registered}/{event.capacity}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {event.duration}
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(event.eventDate).toLocaleDateString('es-ES')} - {event.eventTime}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="flex justify-between pt-2 gap-2">
                    {isAdmin && (
                      <Link href={`/admin/events/${event.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                      </Link>
                    )}
                    
                    {/* Botón para ATC - Restar cupos */}
                    {(isAdmin || isATC) && event.registered < event.capacity && !isEventPast(event.eventDate) && (
                      <Dialog open={dialogOpen && selectedEvent?.id === event.id} onOpenChange={(open) => {
                        if (!open) {
                          setDialogOpen(false);
                          setSelectedEvent(null);
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openCuposDialog(event)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <UserMinus className="h-4 w-4 mr-2" />
                            {isATC ? 'Vender' : 'Registrar'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              {isATC ? 'Registrar Venta por WhatsApp' : 'Registrar Participantes'}
                            </DialogTitle>
                            <DialogDescription>
                              {isATC 
                                ? `Registra una venta realizada por WhatsApp para "${event.name}"`
                                : `Registra participantes para "${event.name}"`
                              }
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Evento</Label>
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <div className="font-medium">{event.name}</div>
                                <div className="text-sm text-gray-600">
                                  Cupos disponibles: {event.capacity - event.registered}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Registrados: {event.registered}/{event.capacity}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="cupos">
                                {isATC ? 'Cantidad vendida' : 'Cantidad a registrar'}
                              </Label>
                              <Input
                                id="cupos"
                                type="number"
                                min="1"
                                max={event.capacity - event.registered}
                                value={cuposToReduce}
                                onChange={(e) => setCuposToReduce(parseInt(e.target.value) || 1)}
                                placeholder="1"
                              />
                            </div>

                            {isATC && (
                              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-start">
                                  <Users className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                                  <div className="text-sm">
                                    <p className="font-medium text-blue-800">Venta por WhatsApp</p>
                                    <p className="text-blue-700 mt-1">
                                      Esta acción registrará {cuposToReduce} venta(s) realizada(s) por WhatsApp.
                                      Los cupos se reducirán automáticamente.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setDialogOpen(false);
                                setSelectedEvent(null);
                              }}
                            >
                              Cancelar
                            </Button>
                            <Button
                              onClick={() => selectedEvent && reduceCupos(selectedEvent.id!, cuposToReduce)}
                              disabled={cuposToReduce < 1 || cuposToReduce > (event.capacity - event.registered)}
                            >
                              {isATC ? 'Registrar Venta' : 'Registrar Participantes'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                    
                    {isAdmin && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. El evento "{event.name}" será eliminado permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => event.id && deleteEvent(event.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}