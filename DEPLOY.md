# 🚀 Cómo hacer Deploy en Vercel

## Opción 1: Interfaz Web (MÁS FÁCIL)

### Paso 1: Sube tu código a GitHub

```bash
# Si no tienes git inicializado
git init
git add .
git commit -m "Catán Cósmico listo para deploy"

# Crea un repositorio en GitHub y luego:
git remote add origin https://github.com/TU_USUARIO/catancosmico.git
git branch -M main
git push -u origin main
```

### Paso 2: Conecta con Vercel

1. Ve a [https://vercel.com](https://vercel.com)
2. Haz clic en "Sign Up" (puedes usar tu cuenta de GitHub)
3. Haz clic en "Add New Project"
4. Selecciona tu repositorio `catancosmico`
5. Vercel detectará automáticamente que es un proyecto Vite
6. Haz clic en "Deploy"

¡Listo! En 2 minutos tendrás tu link: `https://catancosmico.vercel.app`

---

## Opción 2: CLI (Más rápido si tienes terminal)

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Login en Vercel
vercel login

# 3. Deploy (primera vez - responde las preguntas)
vercel

# Te preguntará:
# - Set up and deploy? → Yes
# - Which scope? → (selecciona tu cuenta)
# - Link to existing project? → No
# - Project name? → catancosmico (o el que quieras)
# - In which directory is your code? → ./
# - Want to override settings? → No

# 4. Deploy a producción
vercel --prod
```

---

## 📝 Notas Importantes

- **Dominio gratis**: Vercel te da un dominio como `https://catancosmico-abc123.vercel.app`
- **Actualizaciones**: Para actualizar, solo haz `vercel --prod` de nuevo
- **Gratis**: El plan gratuito es más que suficiente
- **Rápido**: El deploy tarda 1-2 minutos

---

## 🔧 Si hay algún problema

Verifica que:
1. El archivo `vercel.json` esté en la raíz del proyecto ✓
2. Puedas hacer `npm run build` sin errores ✓
3. Tengas Node.js instalado ✓

---

## 🎮 Compartir el Juego

Una vez deployado, solo comparte el link que te da Vercel:
- `https://tu-proyecto.vercel.app`

Tus amigos pueden jugar desde cualquier navegador (PC, Mac, celular) sin instalar nada.

---

## 🔄 Hacer Cambios

Cada vez que quieras actualizar el juego:

```bash
git add .
git commit -m "Descripción de los cambios"
git push
```

Si usaste la interfaz web, Vercel detecta automáticamente el push y re-deploya.
Si usaste CLI, ejecuta `vercel --prod` de nuevo.
