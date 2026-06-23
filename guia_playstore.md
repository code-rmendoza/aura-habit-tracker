# Guía de Publicación de Aura en Google Play Store (PWA a TWA)

Dado que **Aura** está diseñada como una **PWA (Progressive Web App)**, no necesitas reescribir todo el código en Java o Kotlin para publicarla en la Play Store. En su lugar, Google proporciona una tecnología llamada **TWA (Trusted Web Activity)**, que permite "envolver" tu aplicación web en un paquete nativo de Android (`.aab` / `.apk`) que se ejecuta en pantalla completa y se comporta exactamente como una aplicación nativa.

Esta guía te guiará paso a paso para empaquetar, firmar y publicar **Aura** en la Play Store.

---

## Requisitos Previos

1. **Servidor HTTPS:** Tu PWA debe estar desplegada en un dominio público seguro (por ejemplo, usando GitHub Pages, Vercel, Netlify o Firebase Hosting) y tener una puntuación óptima en auditorías de PWA.
2. **Cuenta de Desarrollador de Google:** Debes crearte una cuenta en la [Google Play Console](https://play.google.com/console/signup) (tiene un costo de pago único de $25 USD).

---

## Método 1: Usando PWABuilder (El método recomendado y más sencillo)

[PWABuilder](https://www.pwabuilder.com/) es una herramienta gratuita desarrollada por Microsoft que automatiza todo el proceso de conversión.

### Paso 1: Generar el paquete de Android
1. Despliega tu aplicación Aura y obtén la URL de producción (ejemplo: `https://aura-tracker.web.app`).
2. Entra en [PWABuilder.com](https://www.pwabuilder.com/).
3. Pega la URL de tu app y presiona **"Start"**.
4. La herramienta analizará tu manifest y tus iconos para certificar que cumple con las directrices de PWA.
5. Una vez aprobado, haz clic en **"Build My PWA"** y selecciona la opción de **Android**.
6. En la ventana de configuración:
   - **Package ID:** El identificador único de tu app en formato de dominio inverso (ej. `com.aura.habitos`).
   - **App Name / Launcher Name:** El nombre de la aplicación (ej. `Aura`).
   - **App Version / Version Code:** Mantén `1.0.0` y código `1` para el primer lanzamiento.
   - **Signing Options:** Puedes dejar que PWABuilder genere una firma digital o subir una propia.
7. Haz clic en **"Download Package"**.

### Paso 2: El archivo descargado
La descarga contendrá un archivo `.zip` con:
- `app-release-bundle.aab`: Este es el archivo final compilado que subirás a Google Play Console.
- `assetlinks.json`: Archivo de seguridad crucial para enlazar tu dominio web con tu aplicación de Android.

---

## Cómo Obtener e Instalar el Archivo APK Directamente en tu Celular

Si lo único que quieres es **instalar la app en tu propio celular Android sin publicarla en la Play Store**, puedes descargar directamente el archivo `.apk` desde PWABuilder:

1. **Obtener el APK:**
   - En la misma ventana de PWABuilder donde generas tu paquete de Android, junto a la opción de descargar el paquete completo, verás un botón que dice **"Download APK"** (o en la sección de paquetes generados).
   - También, en ocasiones, el paquete `.zip` descargado contiene una carpeta llamada `test` o `debug` que ya contiene el archivo `.apk`.
2. **Transferir a tu Celular:**
   - Envía el archivo `.apk` a tu celular (por ejemplo, a través de cable USB, Google Drive, WhatsApp o Telegram).
3. **Instalar en Android:**
   - Abre el archivo `.apk` desde el gestor de archivos de tu celular.
   - Si es la primera vez que instalas un archivo externo, Android te mostrará una advertencia de seguridad. Debes habilitar la opción de **"Permitir la instalación de fuentes desconocidas"** para tu navegador o gestor de archivos.
   - Haz clic en **Instalar** y ¡listo! Aura estará instalada en tu cajón de aplicaciones de Android.

---

## Paso 3: Configurar Digital Asset Links (¡Muy Importante!)

Para que tu aplicación se ejecute en pantalla completa sin barra de navegación del navegador (Chrome), debes demostrarle a Android que eres el dueño del dominio web de la PWA.

1. Toma el archivo `assetlinks.json` descargado de PWABuilder.
2. Coloca este archivo en tu proyecto en la ruta de archivos públicos:
   `tracker-de-habitos/public/.well-known/assetlinks.json`
3. Vuelve a desplegar tu aplicación.
4. Asegúrate de que el archivo sea accesible públicamente desde el navegador en la ruta:
   `https://tu-dominio.com/.well-known/assetlinks.json`
   *(Debe retornar una respuesta JSON con las firmas SHA256 de tu paquete de Android).*

---

## Método 2: Usando Bubblewrap CLI (Para desarrolladores avanzados)

Si prefieres realizar el empaquetado en tu línea de comandos localmente, puedes usar la herramienta CLI de Google, **Bubblewrap**.

### Paso 1: Instalación
Requiere tener instalados **Node.js** y **Java Development Kit (JDK 17 o superior)**.

1. Abre tu terminal e instala la CLI globalmente:
   ```bash
   npm install -g @bubblewrap/cli
   ```

### Paso 2: Inicializar el proyecto
1. En una nueva carpeta, ejecuta el comando de inicialización apuntando al manifest de tu PWA en producción:
   ```bash
   bubblewrap init --manifest=https://tu-dominio.com/manifest.json
   ```
2. Bubblewrap descargará el manifest e intentará autocompletar la configuración de Android.
3. Te pedirá:
   - Nombre del paquete (ej. `com.aura.habitos`).
   - Nombre de la app.
   - Directorio del JDK y Android SDK (si no los encuentra, te ofrecerá descargarlos automáticamente).
   - Información para generar tu clave criptográfica de firma (Keystore). Guarda bien la contraseña que definas.

### Paso 3: Compilar la aplicación
1. Genera los archivos compilados ejecutando:
   ```bash
   bubblewrap build
   ```
2. Este comando creará tu archivo firmado `.aab` listo para producción.
3. También te dará la firma SHA256 que debes pegar en tu archivo `.well-known/assetlinks.json` en tu servidor web.

---

## Paso 4: Subir a Google Play Console

Una vez que tengas tu archivo `.aab` y hayas desplegado el archivo `assetlinks.json`:

1. Inicia sesión en [Google Play Console](https://play.google.com/console/).
2. Haz clic en **"Crear aplicación"**.
3. Rellena la información básica:
   - Nombre de la aplicación.
   - Idioma predeterminado (Español).
   - Tipo de app (Aplicación, no juego) y si es Gratis o de Pago.
4. Completa la configuración obligatoria del Panel de control:
   - Declarar si la app contiene anuncios (Aura no contiene).
   - Clasificación de contenido (responder cuestionario).
   - Política de privacidad (enlace a una página web con tu política).
   - Target Age (Público objetivo, ej. 13 años o superior).
5. Crea un lanzamiento en la pista de **Producción** (o en Pruebas Cerradas si quieres testearlo antes con amigos).
6. Sube tu archivo `app-release-bundle.aab`.
7. Define tus capturas de pantalla de móvil (necesitarás al menos 2 a 4 capturas en vertical de Aura en acción).
8. Haz clic en **"Revisar y lanzar"**. Google revisará la app en un plazo de 1 a 7 días y, una vez aprobada, estará disponible en la Google Play Store de todo el mundo.
