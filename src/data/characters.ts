export interface CharacterAvatars {
  base: string;
  idle: string;
  attack: string;
  hurt: string;
  cinematicIntro: string;
  cinematicDefeat: string;
  cinematicWin: string;
}

export interface Character {
  id: string;
  name: string;
  gender: 'M' | 'F';
  maxHp: number;
  maxStamina: number;
  color: string;
  bgGradient: string;
  arenaBg: string;
  arenaBorder: string;
  arenaText: string;
  avatars: CharacterAvatars;
  dialogues: {
    intro: string[];
    win: string[];
    defeat: string[];
  };
}

const getAvatars = (id: string, extOverrides?: Partial<CharacterAvatars>): CharacterAvatars => ({
  base: extOverrides?.base || `/avatars/${id}_idle.png`,
  idle: extOverrides?.idle || `/avatars/${id}_idle.png`,
  attack: extOverrides?.attack || `/avatars/${id}_attack.png`,
  hurt: extOverrides?.hurt || `/avatars/${id}_hurt.png`,
  cinematicIntro: extOverrides?.cinematicIntro || `/avatars/${id}_cinematic_intro.png`,
  cinematicDefeat: extOverrides?.cinematicDefeat || `/avatars/${id}_cinematic_defeat.png`,
  cinematicWin: extOverrides?.cinematicWin || `/avatars/${id}_cinematic_win.png`,
});

export const CHARACTERS: Character[] = [
  {
    id: 'kaelen',
    name: 'Kaelen',
    gender: 'M',
    maxHp: 3000,
    maxStamina: 150,
    color: 'bg-blue-500',
    bgGradient: 'from-blue-900/50',
    arenaBg: 'bg-blue-500/10',
    arenaBorder: 'border-blue-400/30',
    arenaText: 'text-blue-400',
    avatars: getAvatars('kaelen'),
    dialogues: {
      intro: ['Mi espada no dudará.', 'Prepárate para sentir el acero.', 'El honor me obliga a vencerte.', '¿Estás seguro de querer enfrentarme?'],
      win: ['Ha sido un combate honorable.', 'Mi entrenamiento ha dado sus frutos.', 'Aún te queda mucho por aprender.', 'La victoria es para los de voluntad inquebrantable.'],
      defeat: ['He... fallado...', 'Incluso en la derrota, hay honor.', 'Mi técnica no fue suficiente.', 'Volveré más fuerte...']
    }
  },
  {
    id: 'valeria',
    name: 'Valeria',
    gender: 'F',
    maxHp: 2200,
    maxStamina: 220,
    color: 'bg-emerald-500',
    bgGradient: 'from-emerald-900/50',
    arenaBg: 'bg-emerald-500/10',
    arenaBorder: 'border-emerald-400/30',
    arenaText: 'text-emerald-400',
    avatars: getAvatars('valeria'),
    dialogues: {
      intro: ['Congelaré tus esperanzas.', 'El hielo será tu tumba.', 'Siente el frío absoluto.', '¿Podrás soportar el invierno eterno?'],
      win: ['Te has quedado helado.', 'Demasiado frágil.', 'El hielo es eterno, tú no.', 'Una victoria fría y calculada.'],
      defeat: ['El fuego me consume...', 'Mi hielo se derrite...', 'Imposible... mi magia...', 'Volveré con la tormenta...']
    }
  },
  {
    id: 'darius',
    name: 'Darius',
    gender: 'M',
    maxHp: 4500,
    maxStamina: 100,
    color: 'bg-red-600',
    bgGradient: 'from-red-900/50',
    arenaBg: 'bg-red-600/10',
    arenaBorder: 'border-red-500/30',
    arenaText: 'text-red-400',
    avatars: getAvatars('darius'),
    dialogues: {
      intro: ['¡Te aplastaré como a un insecto!', '¡Jajaja! ¡Hacía tiempo que no me divertía!', '¡Prepara los huesos para romperse!', '¡Nadie detiene a la montaña!'],
      win: ['¡Demasiado débil!', '¡Ni siquiera me he calentado!', '¡Ja! ¡Vuelve cuando tengas más músculo!', '¡Eso es todo lo que tienes?!'],
      defeat: ['¡Argh! ¡Me las pagarás!', '¡Imposible... derrotado por ti!', '¡Mis músculos no...!', '¡Esto no se acaba aquí!']
    }
  },
  {
    id: 'elara',
    name: 'Elara',
    gender: 'F',
    maxHp: 2500,
    maxStamina: 250,
    color: 'bg-orange-500',
    bgGradient: 'from-orange-900/50',
    arenaBg: 'bg-orange-500/10',
    arenaBorder: 'border-orange-500/30',
    arenaText: 'text-orange-400',
    avatars: getAvatars('elara'),
    dialogues: {
      intro: ['Iniciando secuencia de combate.', 'Sistemas en línea. Preparada para desmantelarte.', 'Analizando debilidades... encontradas.', 'La probabilidad de tu derrota es del 99.9%.'],
      win: ['Ejecución perfecta.', 'Sistemas intactos. Amenaza neutralizada.', 'Tu patrón de ataque era predecible.', 'Victoria calculada.'],
      defeat: ['Error crítico... sistemas fallando...', 'Sobrecarga de red...', 'Reiniciando sistema de defensa...', 'Datos corrompidos...']
    }
  },
  {
    id: 'fisiobriel',
    name: 'Fisiobriel',
    gender: 'M',
    maxHp: 2800,
    maxStamina: 180,
    color: 'bg-slate-500',
    bgGradient: 'from-slate-900/50',
    arenaBg: 'bg-slate-500/10',
    arenaBorder: 'border-slate-400/30',
    arenaText: 'text-slate-400',
    avatars: getAvatars('fisiobriel', { cinematicIntro: '/avatars/fisiobriel_cinematic_intro.jpeg', cinematicDefeat: '/avatars/fisiobriel_defeat.jpeg' }),
    dialogues: {
      intro: ['Es hora de un ajuste quiropráctico.', 'Relaja los músculos o dolerá más.', 'Siente el flujo del Taichí.', 'Tus posturas son pésimas. Te curaré a golpes.'],
      win: ['Estás completamente descontracturado.', 'El equilibrio cuerpo-mente es la clave.', 'Factura enviada. Te veo en la próxima sesión.', 'Un cuerpo sano es un arma letal.'],
      defeat: ['Mi propio cuerpo... falla...', 'Necesito hielo en la espalda...', 'He forzado demasiado las cervicales...', 'Retiro... médico...']
    }
  },
  {
    id: 'mamakathi',
    name: 'MaMakathi',
    gender: 'F',
    maxHp: 2600,
    maxStamina: 200,
    color: 'bg-indigo-500',
    bgGradient: 'from-indigo-900/50',
    arenaBg: 'bg-indigo-500/10',
    arenaBorder: 'border-indigo-400/30',
    arenaText: 'text-indigo-400',
    avatars: getAvatars('mamakathi', { cinematicIntro: '/avatars/mamakathi_cinematic_intro.jpeg', cinematicDefeat: '/avatars/mamakathi_defeat.jpeg' }),
    dialogues: {
      intro: ['¡No me pises lo fregao!', 'Te voy a dar con el abanico que vas a ver.', 'Llegas tarde a cenar. Te castigaré.', 'Con este abanico te voy a quitar la tontería.'],
      win: ['¡Y no te acerques más hasta que se seque el suelo!', 'Has comido poco, por eso estás tan débil.', 'Una buena costura lo arregla todo.', 'A ver si aprendes a respetar a tus mayores.'],
      defeat: ['Ay, mis articulaciones...', 'Me he dejado las lentejas en el fuego...', 'Qué falta de respeto...', 'Necesito sentarme un rato...']
    }
  },
  {
    id: 'johnodoctor',
    name: 'JohNoDoctor',
    gender: 'M',
    maxHp: 2400,
    maxStamina: 240,
    color: 'bg-lime-700',
    bgGradient: 'from-lime-900/50',
    arenaBg: 'bg-lime-700/10',
    arenaBorder: 'border-lime-500/30',
    arenaText: 'text-lime-400',
    avatars: getAvatars('johnodoctor', { cinematicIntro: '/avatars/johnodoctor_cinematic_intro.jpeg', cinematicDefeat: '/avatars/johnodoctor_defeat.jpeg' }),
    dialogues: {
      intro: ['¡Sube esos graves!', '¡Prepárate para la cacería!', '¡No podrás esconderte de mi radar!', '¡Siente el ritmo del techno de combate!'],
      win: ['¡Drop letal!', '¡Has sido cazado!', '¡La música no para!', '¡Camuflaje desactivado, victoria asegurada!'],
      defeat: ['¡Me han desconectado los altavoces!', '¡Fallo en el equipo de sonido!', '¡Caza fallida...', 'El ritmo... se desvanece...']
    }
  },
  {
    id: 'fransiskitou',
    name: 'Fransiskitou',
    gender: 'M',
    maxHp: 2100,
    maxStamina: 260,
    color: 'bg-cyan-500',
    bgGradient: 'from-cyan-900/50',
    arenaBg: 'bg-cyan-500/10',
    arenaBorder: 'border-cyan-400/30',
    arenaText: 'text-cyan-400',
    avatars: getAvatars('fransiskitou', { cinematicIntro: '/avatars/fransiskitou_cinematic_intro.jpeg', cinematicDefeat: '/avatars/fransiskitou_defeat.jpeg' }),
    dialogues: {
      intro: ['Iniciando inyección SQL de combate.', 'Voy a borrar tus datos del servidor.', 'Tus algoritmos son primitivos.', 'Vas a conocer la ira de la IA.'],
      win: ['rm -rf /* completado con éxito.', 'Datos borrados. Eres historia.', 'Tu código estaba lleno de bugs.', 'El futuro es digital, y tú estás obsoleto.'],
      defeat: ['Error 404... victoria no encontrada...', '¡Me han hackeado el núcleo!', 'Kernel panic...', 'Necesito reiniciar el sistema...']
    }
  }
];
