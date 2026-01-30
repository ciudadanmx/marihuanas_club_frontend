import React from "react";
import { useLocation } from "react-router-dom";

import AdminClubs from "./AdminClubs.jsx";
import RevisarClub from "./RevisarClub.jsx";
import AgendarClub from "./AgendarClub.jsx";
import AprobarClub from "./AprobarClub.jsx";
import RechazarClub from "./RechazarClub.jsx";

const AdminClubsRouter = () => {
  const { pathname } = useLocation();
  // ej: /admin/clubs/revisar/club-slug

  const parts = pathname.split("/").filter(Boolean);
  // ["admin", "clubs", "revisar", "club-slug"]

  const accion = parts[2] || null;
  const club = parts[3] || null; // STRING

  switch (accion) {
    case "revisar":
      return <RevisarClub clubSlug={club} />;

    case "agendar":
      return <AgendarClub club={club} />;

    case "aprobar":
      return <AprobarClub club={club} />;

    case "rechazar":
      return <RechazarClub club={club} />;

    default:
      return <AdminClubs />;
  }
};

export default AdminClubsRouter;
