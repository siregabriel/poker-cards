# 🔄 Configuración de Redirección al Agotar Tiempo

## Descripción

Cuando un usuario agota sus 5 minutos de juego y hace clic en el botón "Got It", puedes configurar si:

1. **Producción (Vercel)**: Redirige a https://atlasseniorliving.net
2. **Desarrollo Local**: Solo cierra el mensaje y vuelve al editor

## 🎯 Configuración Rápida

Abre el archivo `src/App.jsx` y busca las líneas ~53-56:

```javascript
// ================= REDIRECT CONFIGURATION =================
const ENABLE_REDIRECT_ON_TIMEOUT = true;  // ← Cambia esto
const REDIRECT_URL = 'https://atlasseniorliving.net';
```

### Para Producción (Vercel)
```javascript
const ENABLE_REDIRECT_ON_TIMEOUT = true;  // ✅ Redirige a Atlas Senior Living
```

### Para Desarrollo Local
```javascript
const ENABLE_REDIRECT_ON_TIMEOUT = false; // ✅ Solo cierra el mensaje
```

## 📋 Comportamiento

### Cuando `ENABLE_REDIRECT_ON_TIMEOUT = true` (Producción)
1. Usuario agota los 5 minutos
2. Aparece el mensaje "Game Time Depleted"
3. Usuario hace clic en "Got It"
4. **→ Redirige a https://atlasseniorliving.net**
5. El usuario sale completamente de la aplicación

### Cuando `ENABLE_REDIRECT_ON_TIMEOUT = false` (Desarrollo)
1. Usuario agota los 5 minutos
2. Aparece el mensaje "Game Time Depleted"
3. Usuario hace clic en "Got It"
4. **→ Cierra el mensaje y vuelve al editor**
5. El usuario permanece en la aplicación

## 🚀 Flujo de Trabajo Recomendado

### Durante el Desarrollo
```javascript
const ENABLE_REDIRECT_ON_TIMEOUT = false;
```
Esto te permite seguir probando la aplicación sin ser redirigido constantemente.

### Antes de Subir a Vercel
```javascript
const ENABLE_REDIRECT_ON_TIMEOUT = true;
```
Esto asegura que los empleados sean redirigidos a la página principal después de su descanso.

## 🔧 Cambiar la URL de Redirección

Si necesitas cambiar la URL de destino:

```javascript
const REDIRECT_URL = 'https://tu-nueva-url.com';
```

Ejemplos:
- Página principal: `'https://atlasseniorliving.net'`
- Portal de empleados: `'https://atlasseniorliving.net/employee-portal'`
- Intranet: `'https://intranet.atlasseniorliving.net'`

## ⚙️ Configuración Avanzada

### Opción 1: Detectar Automáticamente el Entorno

Si quieres que se active automáticamente según el entorno:

```javascript
// Detecta si estás en localhost (desarrollo) o en producción
const IS_PRODUCTION = window.location.hostname !== 'localhost';
const ENABLE_REDIRECT_ON_TIMEOUT = IS_PRODUCTION;
```

### Opción 2: Usar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
VITE_ENABLE_REDIRECT=false
```

Y en `src/App.jsx`:

```javascript
const ENABLE_REDIRECT_ON_TIMEOUT = import.meta.env.VITE_ENABLE_REDIRECT === 'true';
```

En Vercel, configura la variable de entorno:
- Variable: `VITE_ENABLE_REDIRECT`
- Valor: `true`

## 📝 Notas Importantes

1. **El cooldown de 8 horas persiste**: Incluso si el usuario es redirigido, cuando vuelva a la aplicación seguirá teniendo el cooldown activo.

2. **localStorage se mantiene**: El tiempo de espera se guarda en el navegador, así que si vuelven a entrar a la app, verán el contador de cooldown.

3. **Cierre de ventana**: Si quieres que se cierre la ventana/pestaña en lugar de redirigir, usa:
   ```javascript
   window.close(); // Intenta cerrar la ventana
   ```
   Nota: Esto solo funciona si la ventana fue abierta por JavaScript.

## 🎨 Personalizar el Mensaje

Si quieres cambiar el mensaje antes de redirigir, busca la línea del botón "Got It" y añade:

```javascript
onClick={() => {
  if (ENABLE_REDIRECT_ON_TIMEOUT) {
    alert('Thanks for taking a break! Redirecting you back to work...');
    setTimeout(() => {
      window.location.href = REDIRECT_URL;
    }, 1000); // Espera 1 segundo antes de redirigir
  } else {
    setView('editor');
  }
}}
```

## ✅ Checklist Antes de Desplegar

Antes de hacer `git push` y desplegar a Vercel:

- [ ] `ENABLE_REDIRECT_ON_TIMEOUT = true`
- [ ] `REDIRECT_URL` apunta a la URL correcta
- [ ] Probaste localmente con `false` que todo funciona
- [ ] Verificaste que el cooldown de 8 horas funciona correctamente

## 🐛 Solución de Problemas

**P: La redirección no funciona en Vercel**
R: Verifica que `ENABLE_REDIRECT_ON_TIMEOUT = true` en el código que subiste.

**P: Quiero que cierre la ventana en lugar de redirigir**
R: Cambia `window.location.href = REDIRECT_URL;` por `window.close();`

**P: Quiero diferentes URLs según el turno**
R: Puedes usar lógica basada en la hora:
```javascript
const hour = new Date().getHours();
const REDIRECT_URL = hour < 12 
  ? 'https://atlasseniorliving.net/morning' 
  : 'https://atlasseniorliving.net/afternoon';
```

## 📞 Resumen Rápido

**Para trabajar localmente:**
```javascript
const ENABLE_REDIRECT_ON_TIMEOUT = false;
```

**Para producción en Vercel:**
```javascript
const ENABLE_REDIRECT_ON_TIMEOUT = true;
```

¡Así de simple! 🎉
