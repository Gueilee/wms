import {
  LayoutDashboard,
  AlertTriangle,
  Boxes,
  Map,
  Box,
  PackageCheck,
  ClipboardList,
  Truck,
  ScanLine,
  Users,
  Bell,
  TabletSmartphone,
} from "lucide-react";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/diagnostico", label: "Diagnóstico atual", icon: AlertTriangle },
  { href: "/itens", label: "Cadastro de itens", icon: Boxes },
  { href: "/enderecamento", label: "Endereçamento", icon: Map },
  { href: "/mapa-3d", label: "Mapa 3D", icon: Box },
  { href: "/coletor", label: "Simulador de coletor", icon: TabletSmartphone },
  { href: "/recebimento", label: "Recebimento", icon: PackageCheck },
  { href: "/separacao", label: "Separação & Packing", icon: ClipboardList },
  { href: "/expedicao", label: "Expedição", icon: Truck },
  { href: "/inventario", label: "Inventário cíclico", icon: ScanLine },
  { href: "/clientes", label: "Clientes & personalização", icon: Users },
  { href: "/alertas", label: "Alertas", icon: Bell },
];
