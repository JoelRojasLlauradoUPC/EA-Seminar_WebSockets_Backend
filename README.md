# 🧑‍💻 Ejercicio Práctico: WebSockets con Node.js y Angular

Este repositorio contiene el código base para la sesión práctica sobre **WebSockets**. Aquí exploraremos la comunicación bidireccional en tiempo real entre un cliente (Angular) y un servidor (Node.js + Express + Socket.io).

Esta es la rama **`socket_io`**, que contiene la implementación base necesaria para que podáis arrancar con la parte del servidor y explorar cómo se integran los Sockets.

---

## 🎯 Objetivo de la Clase

En la aplicación de Chat con la que hemos estado trabajando, el objetivo de hoy es implementar diferentes funcionalidades interactivas en tiempo real:

1. **Gestión de conexiones:** Detectar cuándo un usuario se conecta y desconecta.
2. **Difusión de mensajes (Broadcast):** Un usuario envía un mensaje y *todos* los demás lo reciben al instante.
3. **Lista de Usuarios Activos (Ejercicio Principal):** Mostrar una lista en tiempo real de quién está escribiendo o está conectado al chat en ese momento.

---

## 🚀 ¿Qué incluye este código? (El Backend)

En este proyecto de Node.js hemos preparado la estructura base para trabajar con `socket.io`. Los elementos clave que debéis revisar son:

### 1. Inicialización de Sockets (`src/server.ts`)
Observad cómo el servidor HTTP tradicional (creado con `express`) se "envuelve" con `socket.io` para poder escuchar tanto peticiones HTTP normales (GET/POST) como conexiones WebSocket.

### 2. Archivos Clave
- `package.json`: Fijaos que hemos añadido `socket.io` como dependencia.
- Las mismas rutas y modelos de MongoDB (`Organizacion`, `Usuario`, `Mensaje`) que hemos estado usando, ya que WebSockets convive perfectamente con nuestra base de datos.

---

## 🛠️ Ejercicio a realizar: Lista de Usuarios en el Chat

Vuestro trabajo consistirá en completar el flujo de información para que el Frontend (Angular) sepa en todo momento quién está conectado.

### Tareas en el Backend (Este repo)
Deberéis añadir la lógica para mantener un registro de quién está online.
* **Pista 1:** Abrid donde estéis escuchando la principal conexión de io (`io.on('connection', socket => {...})`).
* **Pista 2:** ¿Qué tal si usamos un `Array` o un `Map` (ej. `let usuariosConectados = []`) para ir guardando a los usuarios que entran?
* **Pista 3:** Emitid (`io.emit`) un evento a **todos** los clientes cada vez que alguien nuevo se conecte o alguien se desconecte (`socket.on('disconnect')`), enviándoles esa lista actualizada.

### Tareas en el Frontend (Vuestro proyecto Angular)
En la parte del cliente tendréis que escuchar ese evento.
* **Pista 1:** En el servicio de chat (`chat.service.ts`), cread una función que escuche el evento que emite el backend con la lista de usuarios.
* **Pista 2:** En el componente del chat, suscribíos a ese evento para guardar la lista en una variable local.
* **Pista 3:** Renderizad en el HTML (usando `@for` o `*ngFor`) esa lista de usuarios en una barra lateral.

---

## Instalación y ejecución

Para correr este servidor base e ir probando vuestros cambios:

```bash
# Instalar dependencias 
npm install

# Iniciar el servidor (con nodemon y recarga automática)
npm run dev
```

Recordad que necesitáis tener vuestra base de datos de MongoDB corriendo (ver archivo `.env`). El servidor arrancará por defecto en el puerto `1337`.

¡Mucho ánimo y a programar! 🚀

## Materials Consultats
- Els disponibles a Atenea.
- Els publicats pel grup que ha presentat el seminari.

## Detall d'ús de la IA generativa
Descrit al vídeo.

## Vídeo amb la DEMO
https://youtu.be/2eTK47Wh3LE
