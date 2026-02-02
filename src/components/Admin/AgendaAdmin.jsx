import React from 'react';
import Calendarios from '../Clubs/Bitacora.jsx';
import { useRoles } from '../../Contexts/RolesContext';

/**
 * =====================================================
 * COMPONENTE AGENDA
 * =====================================================
 * Wrapper del componente Calendarios configurado
 * específicamente para mostrar la agenda del usuario.
 */
export default function AgendaAdmin() {
  /**
   * =========================
   * CONTEXTO / USUARIO
   * =========================
   * Aquí asumimos que desde el contexto tienes
   * información del usuario logueado.
   */
  const { membresia } = useRoles();

  /**
   * =========================
   * DATOS DEL USUARIO
   * =========================
   * Ajusta estas líneas según cómo venga tu user.
   */
  const usuarioId = membresia?.usuario?.id;
  const nombreUsuario =
    membresia?.usuario?.nombre ||
    membresia?.usuario?.username ||
    'Usuario';

  /**
   * =========================
   * RENDER
   * =========================
   */
  return (
    <Calendarios
      /** Colección de Strapi */
      coleccion="agendas"

      /** Título dinámico */
      titulo={`Agenda de: ${nombreUsuario}`}

      /** Filtro por usuario */
      parametro="usuario"
      parametro_valor={usuarioId}

      /** Configuración visual */
      mostrarboton={false}
      mostrarTipos={false}
    />
  );
}
