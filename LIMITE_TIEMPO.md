# Límite de Tiempo de Juego - 5 Minutos cada 8 Horas

## Descripción

Se ha implementado un sistema de control de tiempo para limitar el uso de los juegos de Poker y Blackjack a **5 minutos por sesión**, con un **período de espera de 8 horas** entre sesiones. Esta funcionalidad está diseñada para uso en intranets corporativas, asegurando que los empleados:

- Solo puedan jugar 5 minutos por turno de trabajo
- Deban esperar 8 horas (un turno completo) antes de poder jugar nuevamente
- No abusen del tiempo de descanso

## 🔧 Activar/Desactivar la Funcionalidad

Para **desactivar** el límite de tiempo, abre el archivo `src/App.jsx` y busca esta línea (aproximadamente línea 50):

```javascript
// ================= TIME LIMIT CONFIGURATION =================
// Cambia esto a 'false' para desactivar el límite de tiempo de juego
const ENABLE_TIME_LIMIT = true;
const TIME_LIMIT_SECONDS = 300; // 5 minutos de juego
const COOLDOWN_HOURS = 8; // 8 horas de espera entre sesiones
```

Cambia `true` a `false`:

```javascript
const ENABLE_TIME_LIMIT = false; // ✅ Límite de tiempo DESACTIVADO
```

Para **reactivarlo**, simplemente vuelve a poner `true`:

```javascript
const ENABLE_TIME_LIMIT = true; // ✅ Límite de tiempo ACTIVADO
```

## Características Implementadas

### 1. Temporizador de Sesión (5 minutos)
- El temporizador se inicia automáticamente cuando el usuario entra a jugar Blackjack o Video Poker
- Cuenta regresiva desde 5 minutos (300 segundos)
- **Posición FIXED**: Siempre visible en la esquina superior derecha, incluso al hacer scroll

### 2. Período de Espera (8 horas)
- **Después de usar los 5 minutos, el usuario debe esperar 8 horas antes de poder jugar nuevamente**
- El tiempo de espera se guarda en `localStorage` del navegador
- Persiste incluso si el usuario cierra y vuelve a abrir la aplicación
- Equivale a un turno completo de trabajo

### 3. Contador de Cooldown
- Muestra el tiempo restante de espera en formato: `HH:MM:SS`
- Se actualiza cada segundo
- Visible en la pantalla de selección de juegos cuando está activo

### 4. Indicador Visual (Posición Fixed)
- **Verde**: Tiempo normal (más de 30 segundos restantes)
- **Rojo parpadeante**: Advertencia crítica (30 segundos o menos)
- Formato: `MM:SS` (minutos:segundos)
- **Ubicación**: Esquina superior derecha (fixed position)
- **Siempre visible**: No desaparece al hacer scroll down

### 5. Advertencia de 30 Segundos
- Cuando quedan 30 segundos o menos, aparece una notificación flotante en la parte superior central
- Color amarillo/ámbar para llamar la atención
- Mensaje: "¡Tiempo casi agotado! Quedan X segundos de juego"

### 6. Bloqueo Automático con Cooldown
- Al llegar a 0 segundos, el usuario es expulsado automáticamente del juego
- Se activa el período de espera de 8 horas
- Los botones de juego se atenúan y muestran el tiempo restante al hacer clic
- Mensaje informativo con contador regresivo

### 7. Persistencia de Datos
- Usa `localStorage` para guardar el tiempo de bloqueo
- El cooldown persiste entre sesiones del navegador
- Se limpia automáticamente cuando expira el período de 8 horas de un descanso

## Comportamiento del Sistema

### Flujo Normal
1. Usuario entra a "Casino" → Sin restricciones (si no hay cooldown activo)
2. Usuario selecciona Blackjack o Poker → Temporizador de 5 minutos inicia
3. Usuario juega durante 4 minutos → Todo normal
4. Quedan 30 segundos → Aparece advertencia amarilla
5. Llega a 0 segundos → Expulsión automática + **Cooldown de 8 horas activado**
6. Usuario ve mensaje con contador regresivo → Muestra tiempo restante (ej: 7h 59m 45s)
7. Usuario hace clic en "Entendido" → Vuelve al editor
8. Usuario intenta jugar nuevamente → Mensaje: "Debes esperar Xh Xm antes de poder jugar"
9. **Después de 8 horas** → Cooldown expira automáticamente
10. Usuario puede jugar nuevamente por 5 minutos

### Casos Especiales
- **Si el usuario cierra el navegador**: El cooldown persiste en `localStorage`
- **Si el usuario cambia entre Blackjack y Poker**: El temporizador continúa corriendo
- **Si el usuario sale a otra sección (Editor, Preview)**: El temporizador de sesión se pausa, pero el cooldown permanece
- **Si el usuario intenta jugar durante el cooldown**: Aparece alerta con tiempo restante
- **El temporizador es independiente del balance de créditos del juego**

### Ejemplo de Uso Real
```
09:00 AM - Empleado juega 5 minutos
09:05 AM - Se acaba el tiempo, cooldown activado
09:06 AM - Intenta jugar: "Debes esperar 7h 54m"
12:00 PM - Intenta jugar: "Debes esperar 5h 0m"
05:05 PM - Cooldown expira, puede jugar nuevamente
```

## Personalización

### Cambiar el Límite de Tiempo de Juego

Si deseas cambiar el límite de tiempo de juego, modifica la constante en `src/App.jsx` (línea ~51):

```javascript
const ENABLE_TIME_LIMIT = true;
const TIME_LIMIT_SECONDS = 300; // Cambia este valor
const COOLDOWN_HOURS = 8; // Período de espera
```

Valores sugeridos para tiempo de juego:
- 3 minutos: `180`
- 5 minutos: `300` (actual)
- 10 minutos: `600`
- 15 minutos: `900`

### Cambiar el Período de Espera (Cooldown)

Para cambiar las horas de espera entre sesiones:

```javascript
const COOLDOWN_HOURS = 8; // Cambia este valor
```

Valores sugeridos:
- 4 horas (medio turno): `4`
- 8 horas (un turno): `8` (actual)
- 12 horas: `12`
- 24 horas (un día): `24`

### Resetear Manualmente el Cooldown

Si necesitas resetear el cooldown manualmente (por ejemplo, para pruebas), abre la consola del navegador (F12) y ejecuta:

```javascript
localStorage.removeItem('gameCooldownEnd');
location.reload();
```

O desde el código, puedes añadir un botón de administrador que ejecute:

```javascript
localStorage.removeItem('gameCooldownEnd');
setCooldownEndTime(null);
setIsTimeLimitReached(false);
```

### Cambiar el Tiempo de Advertencia

Para cambiar el tiempo de advertencia (actualmente 30 segundos), busca esta línea en el `useEffect` del temporizador:

```javascript
// Busca esta línea (aproximadamente línea 450):
if (remaining <= 30 && !showTimeWarning) {
  // Cambia 30 por el valor deseado (en segundos)
}
```

### Cambiar la Posición del Temporizador

El temporizador está en posición `fixed` en la esquina superior derecha. Para cambiar su posición, busca este código (aproximadamente línea 1800):

```javascript
<div className="fixed top-24 right-8 z-[100] ...">
```

Opciones de posición:
- **Superior derecha** (actual): `top-24 right-8`
- **Superior izquierda**: `top-24 left-8`
- **Inferior derecha**: `bottom-8 right-8`
- **Inferior izquierda**: `bottom-8 left-8`

## Mensajes Personalizables

Los mensajes están en español y pueden modificarse en:

1. **Mensaje de límite alcanzado** (línea ~1350):
```javascript
<p className="text-neutral-300 text-center leading-relaxed">
  Has alcanzado el límite de 5 minutos de juego. Recuerda que esto es solo un descanso. 
  <br />
  <span className="text-amber-400 font-bold">¡Vuelve al trabajo y regresa más tarde!</span>
</p>
```

2. **Advertencia de 30 segundos** (línea ~1780):
```javascript
<p className="font-black text-lg leading-none tracking-tight">¡Tiempo casi agotado!</p>
<p className="text-xs font-bold opacity-80">Quedan {remainingTime} segundos de juego</p>
```

## Notas Técnicas

- Utiliza `useState` y `useEffect` de React para gestionar el estado
- El temporizador usa `setInterval` con actualización cada segundo
- Limpieza automática del intervalo para evitar memory leaks
- Compatible con el sistema de vistas existente de la aplicación
- **Posición Fixed**: El temporizador usa `position: fixed` para permanecer visible durante el scroll
- **Z-index 100**: Asegura que el temporizador esté siempre visible sobre otros elementos
- **localStorage**: Guarda el tiempo de expiración del cooldown en `gameCooldownEnd`
- **Persistencia**: El cooldown sobrevive a recargas de página y cierre del navegador
- **Limpieza automática**: El cooldown se elimina de `localStorage` cuando expira

## Compatibilidad

✅ Funciona con Blackjack
✅ Funciona con Video Poker
✅ No afecta al editor de diseño
✅ No afecta a la vista de preview
✅ Compatible con el sistema de compartir decks
✅ Se puede activar/desactivar fácilmente con una variable
✅ Temporizador siempre visible (fixed position)
✅ Cooldown persiste entre sesiones del navegador
✅ Funciona sin necesidad de backend o base de datos

## Preguntas Frecuentes

**P: ¿Cómo desactivo completamente el límite de tiempo?**
R: Cambia `ENABLE_TIME_LIMIT = true` a `false` en la línea 50 de `src/App.jsx`

**P: ¿El cooldown se reinicia si cierro el navegador?**
R: No, el cooldown persiste en `localStorage` y continuará incluso si cierras y vuelves a abrir el navegador.

**P: ¿El temporizador se reinicia si cambio entre Blackjack y Poker?**
R: No, el temporizador continúa corriendo si cambias entre juegos durante la sesión de 5 minutos.

**P: ¿Puedo cambiar el período de espera de 8 horas?**
R: Sí, cambia el valor de `COOLDOWN_HOURS` en la configuración (línea ~52 de `src/App.jsx`).

**P: ¿Cómo reseteo el cooldown manualmente para pruebas?**
R: Abre la consola del navegador (F12) y ejecuta: `localStorage.removeItem('gameCooldownEnd'); location.reload();`

**P: ¿Puedo cambiar la posición del temporizador?**
R: Sí, busca la clase `fixed top-24 right-8` y cambia los valores de posición.

**P: ¿El temporizador desaparece al hacer scroll?**
R: No, usa `position: fixed` para permanecer siempre visible en la pantalla.

**P: ¿Qué pasa si un empleado usa otro navegador o dispositivo?**
R: El cooldown es por navegador/dispositivo. Si usa otro navegador, podrá jugar nuevamente (el cooldown está en `localStorage` local).

**P: ¿Puedo hacer que el cooldown sea por usuario en lugar de por navegador?**
R: Sí, pero necesitarías implementar un backend que guarde el cooldown asociado al usuario en una base de datos (Firebase, por ejemplo).
