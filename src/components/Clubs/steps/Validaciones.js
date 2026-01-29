export async function handleNextStep({
  form,
  steps,
  activeStep,
  setActiveStep,
  enqueueSnackbar,
  user,
}) {
    
    // 🔒 Validación SOLO en el step "Datos Generales"
    const stepLabel = steps[activeStep]?.label;
    const STRAPI_URL = process.env.REACT_APP_STRAPI_URL;
    const TEXTO_REGEX = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$/;
    
    const validarCampo = ({
      valor,
      min,
      emptyMsg,
      minMsg,
      regexMsg,
      enqueueSnackbar,
    }) => {
      if (!valor) {
        enqueueSnackbar(emptyMsg, { variant: "warning" });
        return false;
      }
    
      if (min && valor.length < min) {
        enqueueSnackbar(minMsg, { variant: "warning" });
        return false;
      }
    
      if (!TEXTO_REGEX.test(valor)) {
        enqueueSnackbar(regexMsg, { variant: "error" });
        return false;
      }
    
      return true;
    };
    
    const validarNombre = async ({
      nombre,
      enqueueSnackbar,
      msgError,
    }) => {
      if (!nombre) return false;
    
      try {
        const res = await fetch(
          `${STRAPI_URL}/api/clubs?filters[nombre_club][$eqi]=${encodeURIComponent(nombre)}`
        );
    
        if (!res.ok) {
          throw new Error("Error al consultar Strapi");
        }
    
        const data = await res.json();
    
        // Si existe al menos un club con ese nombre → inválido
        if (data?.data?.length > 0) {
          enqueueSnackbar(
            msgError,
            { variant: "error" }
          );
          return false;
        }
    
        return true;
      } catch (error) {
        enqueueSnackbar(
          "🔥 Error al validar el nombre del club, intenta de nuevo",
          { variant: "error" }
        );
        return false;
      }
    };

    if (stepLabel === "Datos Generales") {
      const data = {
        nombre_club: form.nombre_club?.trim(),
        nombre: form.nombre?.trim(),
        apellido_paterno: form.apellido_paterno?.trim(),
        apellido_materno: form.apellido_materno?.trim(),
        descripcion: form.descripcion?.trim(),
      };

      if (
        !(await validarNombre({
          nombre: data.nombre_club,
          enqueueSnackbar,
          msgError:  "🚫 Ese nombre de club ya existe en esta dimensión… elige otro",
        })) ||
        !validarCampo({
          valor: data.nombre_club,
          min: 5,
          emptyMsg:
            "👽 Saca para Andar Iwal !!… Tu Club necesita un nombre, si no no existe",
          minMsg:
            "👻 Quítate la máscara Anonymous… tu club necesita un nombre de al menos 5 caracteres",
          regexMsg:
            "🌀 Nombre cósmico detectado… pero relax: solo letras, espacios y números terrenales",
          enqueueSnackbar,
        }) ||
        !validarCampo({
          valor: data.nombre,
          min: 3,
          emptyMsg:
            "👀 Quítate la máscara Anonymous, introduce tu nombre completo",
          minMsg:
            "🌀 Nombre cósmico detectado… tu nombre debe de tener al menos 3 letras",
          regexMsg:
            "🌀 Nombre cósmico detectado… pero relax: solo letras, espacios y números terrenales",
          enqueueSnackbar,
        }) ||
        !validarCampo({
          valor: data.apellido_paterno,
          min: 3,
          emptyMsg:
            "👀 Quítate la máscara Anonymous, introduce tu nombre completo con ambos apellidos",
          minMsg:
            "🌀 Nombre cósmico detectado… tu apellido debe de tener al menos 3 letras",
          regexMsg:
            "🌀 Apellido cósmico detectado… pero relax: solo letras, espacios y números terrenales",
          enqueueSnackbar,
        }) ||
        !validarCampo({
          valor: data.apellido_materno,
          min: 3,
          emptyMsg:
            "👀 Quítate la máscara Anonymous, introduce tu nombre completo con ambos apellidos",
          minMsg:
            "🌀 Nombre cósmico detectado… tu apellido debe de tener al menos 3 letras",
          regexMsg:
            "🌀 Apellido cósmico detectado… pero relax: solo letras, espacios y números terrenales",
          enqueueSnackbar,
        })
      ) {
        return;
      }
    }

    if (stepLabel === "Dirección") {
      if (!form.direccion || !form.lat || !form.lng) {
        enqueueSnackbar(
          "📍 Ey… selecciona una dirección válida del mapa... en esta dimensión",
          { variant: "warning" }
        );
        return;
      }
    }

    
    if (stepLabel === "Horarios y Contacto") {
      if (!form.whatsapp || form.whatsapp.length < 10) {
        enqueueSnackbar(
          "💬 Te tiramos señales de humo para las citas... de todos modos pásanos tu Whatsapp para más arre jajaja 😅",
          { variant: "warning" }
        );
        return;
      }
    }

    if (stepLabel === "Archivos") {
       if (!Array.isArray(form.fotos_club) || form.fotos_club.length < 2) {
        enqueueSnackbar(
          "😍  De la vista nace el amor mazter -- Agrega al menos 2 Fotos de tu Club",
          { variant: "warning" }
        );
        return;
      }
      
      if ( form.tipo_club.includes('cultivo') && (!Array.isArray(form.documentales) || form.documentales.length < 5) ) {
        enqueueSnackbar(
          `❓  ¿ Y cómo sabemos que tienes espacio para las flores ? -- Agrega al menos 5 Fotos de tu Verificación según las indicaciones`,
          { variant: "warning" }
        );
        return;
      }

      if ( form.tipo_club.includes('cultivo') && !form.armarios) {
        enqueueSnackbar(
          `❓  ¿ Y cómo sabemos para cuántas flores tienes espacio ? -- Especifica para cuántos armarios tienes espacio`,
          { variant: "warning" }
        );
        return;
      }

      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "application/pdf",
      ];

      // 1️⃣ Validar que existan ambos archivos
      const ineFrente  = form?.ine_frente;
      const ineReverso = form?.ine_reverso;

      if (!ineFrente || !ineReverso) {
        enqueueSnackbar(
          "🪪 Sube tu INE completo: frente y reverso.",
          { variant: "warning" }
        );
        return;
      }

      // 2️⃣ Validar tipo de archivo (solo imágenes)
      const files = [ineFrente, ineReverso];

      const fileInvalido = files.find(
        f => !allowedTypes.includes(f?.type)
      );

      if (fileInvalido) {
        enqueueSnackbar(
          "🖼️ El INE debe ser imagen (.JPG, .PNG o .WEBP) o documento .PDF. No se aceptan otros formatos.",
          { variant: "error" }
        );
        return;
      }






    }

    // ✅ todo bien → avanzamos
    setActiveStep((prev) => prev + 1);
  };
