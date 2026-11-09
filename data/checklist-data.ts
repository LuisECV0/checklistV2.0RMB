type ChecklistSection = {
  id: string
  title: string
  items: [string, string][]
}

export const sections: ChecklistSection[] = [
  { id: '01', title: 'Eléctrico', items: [['PE059', 'Falla eléctrica']] },
  {
    id: '03',
    title: 'Hidráulico',
    items: [
      ['PE051', 'Falta aceite hidráulico'],
      ['PE052', 'Fuga aceite'],
      ['PE053', 'Fuga agua'],
      ['PE054', 'Fuga aire'],
      ['PE080', 'Mal ruteo'],
      ['PE081', 'Falla al bascular'],
    ],
  },
  {
    id: '05',
    title: 'Pintura',
    items: [
      ['PE006', 'Bajo espesor pintura'],
      ['PE007', 'Exceso espesor pintura'],
      ['PE038', 'Zona por retocar'],
      ['PE039', 'Mala preparación de superficie'],
      ['PE040', 'Falta limpieza mecánica'],
      ['PE041', 'Rayaduras en pintura'],
      ['PE072', 'Falta de sika'],
      ['PE073', 'Falta de sticker, cinta reflectivas'],
    ],
  },
  {
    id: '12',
    title: 'Soldadura',
    items: [
      ['PE001', 'Defecto soldadura'],
      ['PE003', 'Soldadura incompleta'],
      ['PE004', 'Salpicadura'],
      ['PE005', 'Punto de soldadura'],
      ['PE017', 'Golpe de arco'],
      ['PE018', 'Falta coronar'],
      ['PE019', 'Fisuras'],
      ['PE025', 'Falta fusión'],
      ['PE026', 'Cateto insuficiente'],
      ['PE027', 'Soldadura cóncava'],
      ['PE028', 'Descolgamiento'],
      ['PE029', 'Cráter'],
      ['PE030', 'Socavación'],
      ['PE031', 'Porosidad'],
      ['PE032', 'Soldadura convexa'],
      ['PE083', 'Mala preparación de junta'],
    ],
  },
  {
    id: '14',
    title: 'Ensamble',
    items: [
      ['PE011', 'Armado incorrecto'],
      ['PE016', 'Falta accesorio'],
      ['PE042', 'Accesorio fuera de especificación'],
      ['PE043', 'Accesorio desprendido'],
      ['PE044', 'Instalación incorrecta'],
      ['PE045', 'Ubicación incorrecta'],
      ['PE074', 'Pernos flojos'],
      ['PE075', 'Pernos cortos'],
      ['PE076', 'Regulación de accesorios'],
      ['PE077', 'Trabajos incompletos'],
      ['PE085', 'Orden y limpieza'],
    ],
  },
  {
    id: '15',
    title: 'Material',
    items: [
      ['PE008', 'Deformación estructural'],
      ['PE012', 'Daño material'],
      ['PE046', 'Oxidación'],
    ],
  },
  {
    id: '16',
    title: 'Ingeniería / Diseño',
    items: [
      ['PE047', 'Mal diseño plano'],
      ['PE048', 'Falta actualización planos'],
      ['PE049', 'Plano incompleto'],
      ['PE050', 'Incongruencia EE.TT'],
    ],
  },
  {
    id: '17',
    title: 'Funcionamiento',
    items: [
      ['PE010', 'Falla de funcionamiento de accesorio'],
      ['PE055', 'Falla mecanismo apertura'],
      ['PE056', 'Juego excesivo'],
      ['PE057', 'Ruido anormal'],
      ['PE058', 'Falta engrase'],
      ['PE078', 'Rozamiento'],
      ['PE079', 'Ángulo no conforme'],
    ],
  },
  {
    id: '18',
    title: 'Dimensional',
    items: [
      ['PE009', 'Desalineamiento'],
      ['PE015', 'Agujeros faltantes'],
      ['PE060', 'Fuera de medida'],
      ['PE061', 'Luz en viga'],
      ['PE062', 'Luz en zapata'],
      ['PE063', 'Luz en compuerta'],
    ],
  },
  {
    id: '19',
    title: 'Corte / Mecanizado',
    items: [
      ['PE013', 'Rebabas'],
      ['PE064', 'Muescas'],
      ['PE065', 'Filos cortantes'],
    ],
  },
  {
    id: '20',
    title: 'Chasis post carrozado',
    items: [
      ['PE066', 'Daño en componentes del chasis'],
      ['PE067', 'Daño en cabina'],
      ['PE068', 'Tanque silenciador'],
      ['PE069', 'Tanque combustible'],
      ['PE070', 'Pulmón de aire'],
      ['PE071', 'Cámara de retroceso'],
      ['PE082', 'Daño de batería'],
    ],
  },
]

export const allItems = sections.flatMap((section) =>
  section.items.map(([code, description]) => ({
    code,
    description,
    section: section.title,
  })),
)