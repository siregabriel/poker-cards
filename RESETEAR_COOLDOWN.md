# 🔧 Cómo Resetear el Cooldown de Juegos

Si necesitas resetear el período de espera de 8 horas (por ejemplo, para pruebas o en caso de emergencia), tienes varias opciones:

## Opción 1: Desde la Consola del Navegador (Más Rápido)

1. Abre la aplicación en el navegador
2. Presiona `F12` para abrir las herramientas de desarrollador
3. Ve a la pestaña "Console" (Consola)
4. Copia y pega este comando:

```javascript
localStorage.removeItem('gameCooldownEnd');
location.reload();
```

5. Presiona Enter
6. La página se recargará y el cooldown estará reseteado

## Opción 2: Limpiar Todo el localStorage

Si quieres limpiar todos los datos guardados:

```javascript
localStorage.clear();
location.reload();
```

## Opción 3: Desde las Herramientas del Navegador

### Chrome/Edge:
1. Presiona `F12`
2. Ve a la pestaña "Application"
3. En el menú izquierdo, expande "Local Storage"
4. Haz clic en tu dominio
5. Busca la clave `gameCooldownEnd`
6. Haz clic derecho → Delete
7. Recarga la página (`F5`)

### Firefox:
1. Presiona `F12`
2. Ve a la pestaña "Storage"
3. Expande "Local Storage"
4. Haz clic en tu dominio
5. Busca `gameCooldownEnd`
6. Haz clic derecho → Delete Item
7. Recarga la página (`F5`)

## Opción 4: Añadir un Botón de Administrador (Desarrollo)

Si estás en desarrollo y necesitas resetear frecuentemente, puedes añadir un botón temporal en `src/App.jsx`:

```javascript
// Añade esto en algún lugar visible (por ejemplo, en el navbar)
<button 
  onClick={() => {
    localStorage.removeItem('gameCooldownEnd');
    setCooldownEndTime(null);
    setIsTimeLimitReached(false);
    setRemainingCooldown(0);
    alert('Cooldown reseteado!');
  }}
  className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs"
>
  🔧 Reset Cooldown (DEV)
</button>
```

**⚠️ IMPORTANTE**: Elimina este botón antes de desplegar a producción.

## Opción 5: Desactivar Temporalmente el Sistema

Si necesitas desactivar el sistema completamente por un tiempo:

1. Abre `src/App.jsx`
2. Busca la línea ~50:
```javascript
const ENABLE_TIME_LIMIT = true;
```
3. Cámbiala a:
```javascript
const ENABLE_TIME_LIMIT = false;
```
4. Guarda el archivo
5. El sistema de límite de tiempo estará desactivado

## Para Administradores de Sistema

Si necesitas resetear el cooldown para múltiples usuarios:

1. **Opción A**: Pide a cada usuario que limpie su localStorage (Opción 1)
2. **Opción B**: Cambia el nombre de la clave en el código:
   - Busca `'gameCooldownEnd'` en `src/App.jsx`
   - Cámbialo a `'gameCooldownEnd_v2'` (o cualquier otro nombre)
   - Esto hará que el sistema ignore los cooldowns antiguos

## Verificar si hay un Cooldown Activo

Para verificar si hay un cooldown activo y cuándo expira:

```javascript
const cooldownEnd = localStorage.getItem('gameCooldownEnd');
if (cooldownEnd) {
  const now = Date.now();
  const remaining = parseInt(cooldownEnd) - now;
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  console.log(`Cooldown activo. Expira en: ${hours}h ${minutes}m`);
  console.log(`Fecha de expiración: ${new Date(parseInt(cooldownEnd))}`);
} else {
  console.log('No hay cooldown activo');
}
```

## Notas Importantes

- El cooldown se guarda en `localStorage`, que es específico del navegador
- Si un usuario usa otro navegador o dispositivo, no tendrá el cooldown
- El cooldown NO se sincroniza entre dispositivos (es local)
- Para un control más estricto, necesitarías implementar un backend con base de datos
