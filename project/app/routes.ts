import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("laboratorio", "routes/laboratorio-de-campo.tsx"),
  route("laboratorio-de-campo", "routes/laboratorio-de-campo-redirect.tsx"),
  route("biblioteca-de-plantas", "routes/biblioteca-de-plantas.tsx"),
  route("ia", "routes/identificador-plantas.tsx"),
  route("identificador-plantas", "routes/identificador-plantas-redirect.tsx"),
  route("eventos", "routes/eventos.tsx"),
  route("admin", "routes/admin.tsx", [
    index("routes/admin-index.tsx"),
    route("eventos", "routes/admin-eventos.tsx"),
  ]),
] satisfies RouteConfig;
