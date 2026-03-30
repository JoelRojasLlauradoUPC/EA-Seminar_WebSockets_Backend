import { Server as SocketIOServer, Socket } from 'socket.io';
import Logging from '../library/Logging';
import MensajeModel, { IMensajeModel } from '../models/Mensaje';

export class MensajeService {
    private io: SocketIOServer;
    private usuariosConectados: Map<string, string>; //map d usuaris

    constructor(io: SocketIOServer) {
        this.io = io;
        this.usuariosConectados = new Map<string, string>();
    }

    private obtenerUsuariosConectados(): string[] { //petició expressa
        return [...new Set(this.usuariosConectados.values())];
    }

    private emitirUsuariosConectados(): void { //al rebre de front end la indicacio
        const lista = this.obtenerUsuariosConectados();
        console.log('[SOCKET] Emitiendo online-users:', lista);
        this.io.emit('online-users', lista);
    } //llista users connectats

    /**
     * Inicializa los listeners de Socket.io
     */
    public inicializarSockets(): void {
        this.io.on('connection', (socket: Socket) => {
            Logging.info(`Socket conectado: ${socket.id}`);

            //new socket se ha connectat, enviem al nou la llista de connectats
            socket.emit('online-users', this.obtenerUsuariosConectados());

            socket.on('register-user', (payload: string | { usuario?: string }) => {
                const usuario = typeof payload === 'string' ? payload : payload?.usuario;

                if (!usuario || !usuario.trim()) { //validació de datos
                    console.log('[SOCKET] register-user recibido vacío o inválido:', payload);
                    return;
                }

                this.usuariosConectados.set(socket.id, usuario.trim()); //associar socket a user
                Logging.info(`Usuario online: ${usuario} (${socket.id})`);
                console.log(`[SOCKET] Usuario registrado: ${usuario} (socket: ${socket.id})`);
                this.emitirUsuariosConectados();//funcio x enviar connectats al nou
            });

            /* 
            // Unirse a una sala de organización (DESACTIVADO PARA CHAT GLOBAL)
            socket.on('join-organization', (organizacionId: string) => {
                socket.join(`org-${organizacionId}`);
                Logging.info(`Socket ${socket.id} se unió a organización ${organizacionId}`);
            });
            */

            socket.on('typing', (data: { usuario: string }) => {
                Logging.info(`${data.usuario} está escribiendo...`);
                socket.broadcast.emit('user-typing', data);
            });

            socket.on('stop-typing', (data: { usuario: string }) => {
                Logging.info(`${data.usuario} dejó de escribir`);
                socket.broadcast.emit('user-stop-typing', data);
            });

            // Escuchar mensajes incoming
            socket.on('message', async (data: { usuario: string, organizacion: string, contenido: string }) => {
                try {
                    Logging.info(`Mensaje recibido de ${data.usuario}`);
                    
                    // Guardar el mensaje en la BD
                    const nuevoMensaje = await this.guardarMensaje(
                        data.contenido,
                        data.usuario,
                        data.organizacion
                    );

                    // Emitir el mensaje a TODOS los clientes conectados (Chat Global)
                    this.io.emit('message', nuevoMensaje);
                } catch (error) {
                    Logging.error(`Error al guardar mensaje: ${error}`);
                    socket.emit('error', { message: 'Error al guardar el mensaje' });
                }
            });

            // Marcar mensaje como leído
            socket.on('mark-as-read', async (mensajeId: string) => {
                try {
                    await MensajeModel.findByIdAndUpdate(mensajeId, { leido: true });
                    Logging.info(`Mensaje ${mensajeId} marcado como leído`);
                } catch (error) {
                    Logging.error(`Error al marcar mensaje como leído: ${error}`);
                }
            });

            // Desconexión
            socket.on('disconnect', () => {
                const usuario = this.usuariosConectados.get(socket.id);
                this.usuariosConectados.delete(socket.id);
                // x gestionar la desconnexió
                Logging.info(`Socket desconectado: ${socket.id}`);

                if (usuario) {
                    Logging.info(`Usuario offline: ${usuario}`);
                }

                this.emitirUsuariosConectados();
            });
        });
    }

    /**
     * Guarda un nuevo mensaje en la base de datos
     */
    public async guardarMensaje(
        contenido: string,
        usuarioId: string,
        organizacionId: string
    ): Promise<IMensajeModel> {
        const mensaje = new MensajeModel({
            contenido,
            usuario: usuarioId,
            organizacion: organizacionId,
            leido: false
        });

        const savedMensaje = await mensaje.save();
        return await savedMensaje.populate('usuario', 'name email');
    }


    /**
     * Obtiene todos los mensajes de una organización
     */
    public async obtenerMensajesPorOrganizacion(organizacionId: string): Promise<IMensajeModel[]> {
        return await MensajeModel.find({ organizacion: organizacionId })
            .populate('usuario', 'name email')
            .sort({ createdAt: -1 });
    }

    /**
     * Obtiene los mensajes no leídos de un usuario
     */
    public async obtenerMensajesNoLeidos(usuarioId: string): Promise<IMensajeModel[]> {
        return await MensajeModel.find({ usuario: usuarioId, leido: false })
            .populate('usuario', 'name email')
            .populate('organizacion', 'name');
    }
}
