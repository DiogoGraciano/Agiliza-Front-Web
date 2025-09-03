// Arquivo de compatibilidade - redireciona para os novos serviços
// Este arquivo mantém a compatibilidade com código existente

import {
  authService,
  adminService,
  userService,
  serviceService,
  categoryService,
  typeService,
  manifestService,
  attachmentService,
  sectorService,
  queueService,
  locationService,
  deskService,
  ticketService,
  displayService,
  enterpriseService,
  deviceService
} from './index';

// Classe de compatibilidade que mantém a interface original
class ApiService {
  // Autenticação de Administradores
  adminLogin = (credentials: any) => authService.adminLogin(credentials);
  adminLogout = () => authService.adminLogout();
  getAdminProfile = () => authService.getAdminProfile();
  updateAdminProfile = (data: any) => authService.updateAdminProfile(data);

  // Empresa (endpoint público)
  getEnterprise = () => enterpriseService.getEnterprise();
  updateEnterprise = (data: any) => enterpriseService.updateEnterprise(data);

  // Administradores (Admin)
  getAdmins = (filters?: any, page?: number) => adminService.getAdmins(filters, page);
  createAdmin = (data: any) => adminService.createAdmin(data);
  getAdmin = (id: number) => adminService.getAdmin(id);
  updateAdmin = (id: number, data: any) => adminService.updateAdmin(id, data);
  deleteAdmin = (id: number) => adminService.deleteAdmin(id);

  // Usuários (Admin)
  getUsers = (filters?: any, page?: number) => userService.getUsers(filters, page);
  getAllUsers = () => userService.getAllUsers();
  createUser = (data: any) => userService.createUser(data);
  getUser = (id: number) => userService.getUser(id);
  updateUser = (id: number, data: any) => userService.updateUser(id, data);
  deleteUser = (id: number) => userService.deleteUser(id);

  // Serviços
  getServices = (filters?: any, page?: number) => serviceService.getServices(filters, page);
  getServicesWithManifestCount = () => serviceService.getServicesWithManifestCount();
  searchServices = (query: string) => serviceService.searchServices(query);
  getService = (id: number) => serviceService.getService(id);
  createService = (data: any) => serviceService.createService(data);
  updateService = (id: number, data: any) => serviceService.updateService(id, data);
  deleteService = (id: number) => serviceService.deleteService(id);

  // Categorias
  getCategories = (filters?: any, page?: number) => categoryService.getCategories(filters, page);
  getActiveCategories = () => categoryService.getActiveCategories();
  getCategoriesByService = (serviceId: number) => categoryService.getCategoriesByService(serviceId);
  getCategory = (id: number) => categoryService.getCategory(id);
  createCategory = (data: any) => categoryService.createCategory(data);
  updateCategory = (id: number, data: any) => categoryService.updateCategory(id, data);
  deleteCategory = (id: number) => categoryService.deleteCategory(id);

  // Tipos
  getTypes = (filters?: any, page?: number) => typeService.getTypes(filters, page);
  getActiveTypes = () => typeService.getActiveTypes();
  getType = (id: number) => typeService.getType(id);
  createType = (data: any) => typeService.createType(data);
  updateType = (id: number, data: any) => typeService.updateType(id, data);
  deleteType = (id: number) => typeService.deleteType(id);
  uploadTypeImage = (id: number, image: File) => typeService.uploadTypeImage(id, image);

  // Manifestos
  getManifests = (filters?: any, page?: number) => manifestService.getManifests(filters, page);
  getManifest = (id: number) => manifestService.getManifest(id);
  createManifest = (data: any) => manifestService.createManifest(data);
  createManifestWithAttachments = (data: any, attachments: File[]) => manifestService.createManifestWithAttachments(data, attachments);
  updateManifest = (id: number, data: any) => manifestService.updateManifest(id, data);
  updateManifestWithAttachments = (id: number, data: any, attachments: File[]) => manifestService.updateManifestWithAttachments(id, data, attachments);
  deleteManifest = (id: number) => manifestService.deleteManifest(id);
  updateManifestStatus = (id: number, status: string) => manifestService.updateManifestStatus(id, status);
  setManifestAdmin = (id: number) => manifestService.setManifestAdmin(id);
  changeDeliveryForecastDate = (id: number, date: string) => manifestService.changeDeliveryForecastDate(id, date);
  getManifestStatistics = () => manifestService.getManifestStatistics();

  // Comentários de manifestos
  getManifestComments = (manifestId: number, page?: number) => manifestService.getManifestComments(manifestId, page);
  getComment = (id: number) => manifestService.getComment(id);
  createComment = (data: any) => manifestService.createComment(data);
  updateComment = (id: number, data: any) => manifestService.updateComment(id, data);
  deleteComment = (id: number) => manifestService.deleteComment(id);

  // Anexos
  getManifestAttachments = (filters?: { manifest_id?: number }, page?: number) => attachmentService.getManifestAttachments(filters, page);
  getAttachmentsByManifest = (manifestId: number) => attachmentService.getAttachmentsByManifest(manifestId);
  getAttachment = (id: number) => attachmentService.getAttachment(id);
  createAttachment = (data: any) => attachmentService.createAttachment(data);
  updateAttachment = (id: number, data: any) => attachmentService.updateAttachment(id, data);
  deleteAttachment = (id: number) => attachmentService.deleteAttachment(id);
  uploadAttachment = (manifestId: number, file: File, onProgress?: (progressEvent: any) => void) => attachmentService.uploadAttachment(manifestId, file, onProgress);

  // Setores (Admin)
  getSectors = () => sectorService.getSectors();
  createSector = (data: any) => sectorService.createSector(data);
  getSector = (id: number) => sectorService.getSector(id);
  updateSector = (id: number, data: any) => sectorService.updateSector(id, data);
  deleteSector = (id: number) => sectorService.deleteSector(id);

  // Queue
  getQueues = (filters?: any, page?: number) => queueService.getQueues(filters, page);
  getAllQueues = () => queueService.getAllQueues();
  getQueue = (id: number) => queueService.getQueue(id);
  createQueue = (data: any) => queueService.createQueue(data);
  updateQueue = (id: number, data: any) => queueService.updateQueue(id, data);
  deleteQueue = (id: number) => queueService.deleteQueue(id);

  // Location
  getLocations = (filters?: any, page?: number) => locationService.getLocations(filters, page);
  getAllLocations = () => locationService.getAllLocations();
  getLocation = (id: number) => locationService.getLocation(id);
  createLocation = (data: any) => locationService.createLocation(data);
  updateLocation = (id: number, data: any) => locationService.updateLocation(id, data);
  deleteLocation = (id: number) => locationService.deleteLocation(id);

  // Desk
  getDesks = (filters?: any, page?: number) => deskService.getDesks(filters, page);
  getAllDesks = () => deskService.getAllDesks();
  getDesk = (id: number) => deskService.getDesk(id);
  createDesk = (data: any) => deskService.createDesk(data);
  updateDesk = (id: number, data: any) => deskService.updateDesk(id, data);
  deleteDesk = (id: number) => deskService.deleteDesk(id);

  // Ticket
  getTickets = (filters?: any, page?: number) => ticketService.getTickets(filters, page);
  getTicket = (id: number) => ticketService.getTicket(id);
  getCurrentTicket = (locationId: number) => ticketService.getCurrentTicket(locationId);
  createTicket = (data: any) => ticketService.createTicket(data);
  updateTicket = (id: number, data: any) => ticketService.updateTicket(id, data);
  deleteTicket = (id: number) => ticketService.deleteTicket(id);

  // Display (Monitores)
  getDisplays = (filters?: any, page?: number) => displayService.getDisplays(filters, page);
  getAllDisplays = () => displayService.getAllDisplays();
  getDisplay = (id: number) => displayService.getDisplay(id);
  createDisplay = (data: any) => displayService.createDisplay(data);
  updateDisplay = (id: number, data: any) => displayService.updateDisplay(id, data);
  deleteDisplay = (id: number) => displayService.deleteDisplay(id);

  // Device (Dispositivos)
  getDevices = (filters?: any, page?: number) => deviceService.getDevices(filters, page);
  getAllDevices = () => deviceService.getAllDevices();
  getDevice = (id: number) => deviceService.getDevice(id);
  createDevice = (data: any) => deviceService.createDevice(data);
  updateDevice = (id: number, data: any) => deviceService.updateDevice(id, data);
  deleteDevice = (id: number) => deviceService.deleteDevice(id);
}

export const apiService = new ApiService();
export default apiService;
