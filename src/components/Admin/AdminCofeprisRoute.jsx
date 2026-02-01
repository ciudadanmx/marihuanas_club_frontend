// AdminCofeprisRoute.jsx
import React from "react";
import { useLocation } from "react-router-dom";

import CofeprisAdmin from "./CofeprisAdmin.jsx";
import VerCofeprisAdmin from "./VerCofeprisAdmin.jsx";
import ChecarCofeprisAdmin from "./ChecarCofeprisAdmin.jsx";
import ImprimirCofeprisAdmin from "./ImprimirCofeprisAdmin.jsx";

const AdminCofeprisRoute = () => {
  const { pathname } = useLocation();

  // /admin/tramites/ver/UOIA8302239D0
  const parts = pathname.split("/").filter(Boolean);
  // ["admin", "tramites", "ver", "UOIA8302239D0"]

  const accion = parts[2]?.toLowerCase() || null;
  const rfc2 = parts[3] ? decodeURIComponent(parts[3]) : null;
  const rfc = 'uiza8302239d0';

  switch (accion) {
    case "ver":
      return <VerCofeprisAdmin rfc={rfc} />;

    case "checar":
      return <ChecarCofeprisAdmin rfc={rfc} />;

    case "imprimir":
      return <ImprimirCofeprisAdmin rfc={rfc} />;

    case "actualizar":
      return <ChecarCofeprisAdmin rfc={rfc} modo="actualizar" />;

    default:
      return <CofeprisAdmin />;
  }
};

export default AdminCofeprisRoute;
