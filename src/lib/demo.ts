import type { ScriptResult } from "./types";

/**
 * Guion de ejemplo (no llama a la IA). Sirve para previsualizar cómo se ve el
 * resultado: estructura a dos columnas, prompts editables, costos, etc.
 */
export const demoScript: ScriptResult = {
  productionMode: "ia",
  title: {
    es: "El error que apaga tu glow (y cómo arreglarlo en 7 días)",
    pt: "O erro que apaga seu glow (e como resolver em 7 dias)",
  },
  summary: {
    es: "Gancho de error + revelación del sérum como solución, con cierre sensorial.",
    pt: "Gancho de erro + revelação do sérum como solução, com fecho sensorial.",
  },
  hookStrategy: {
    es: "Abrir con una negación rotunda ('No es tu edad...') expone una objeción oculta y frena el dedo en los primeros 2 segundos.",
    pt: "Abrir com uma negação ('Não é a sua idade...') expõe uma objeção oculta e segura o dedo nos primeiros 2 segundos.",
  },
  analysis: [
    {
      layer: "visual",
      label: { es: "Frecuencia de cortes", pt: "Frequência de cortes" },
      finding: {
        es: "Cortes rápidos cada 1–2 s en el gancho para máxima retención.",
        pt: "Cortes rápidos a cada 1–2 s no gancho para máxima retenção.",
      },
    },
    {
      layer: "auditiva",
      label: { es: "Vocabulario sensorial", pt: "Vocabulário sensorial" },
      finding: {
        es: "Palabras 'jugoso', 'se funde', 'terciopelo' para reemplazar el tacto.",
        pt: "Palavras 'suculento', 'derrete', 'veludo' para substituir o toque.",
      },
    },
    {
      layer: "psicologica",
      label: { es: "El villano", pt: "O vilão" },
      finding: {
        es: "Se culpa al 'clima seco' y a la rutina apresurada, no a la persona.",
        pt: "Culpa-se o 'clima seco' e a rotina corrida, não a pessoa.",
      },
    },
  ],
  scenes: [
    {
      id: "s1",
      label: { es: "Gancho", pt: "Gancho" },
      timecode: "0s – 3s",
      audio: {
        es: "No es tu edad la que apaga tu piel… es esto que haces cada mañana.",
        pt: "Não é a sua idade que apaga sua pele… é isto que você faz toda manhã.",
      },
      visual: {
        es: "Primerísimo primer plano del rostro, snap zoom a la mejilla. Luz natural difusa de ventana.",
        pt: "Primeiríssimo plano do rosto, snap zoom na bochecha. Luz natural difusa de janela.",
      },
      sfx: {
        es: "Whoosh seco en el zoom + micro-silencio antes de 'esto'.",
        pt: "Whoosh seco no zoom + micro-silêncio antes de 'isto'.",
      },
      prompts: [
        {
          id: "s1-img",
          kind: "imagen-0c",
          title: { es: "Imagen Base 0c — Gancho", pt: "Imagem Base 0c — Gancho" },
          model: "NanoBanana Pro (Flow)",
          content: {
            es: "Retrato hiperrealista vertical 9:16 de una mujer latina de unos 35 años, piel real con textura y poros visibles, expresión natural de duda, luz suave de ventana por la izquierda, fondo de baño minimalista beige desenfocado. Sobre la repisa del fondo, ligeramente desenfocado, se ve el logotipo de la marca ElaBela (wordmark serif 'Ela, Bela' con un pequeño corazón y 'glow' debajo, tono marrón cacao) impreso en el frasco del sérum, integrado de forma sutil. Estilo UGC premium, photoreal skin, 8k.",
            pt: "Retrato hiper-realista vertical 9:16 de uma mulher latina de uns 35 anos, pele real com textura e poros visíveis, expressão natural de dúvida, luz suave de janela pela esquerda, fundo de banheiro minimalista bege desfocado. Na prateleira ao fundo, levemente desfocado, vê-se o logotipo da marca ElaBela (wordmark serif 'Ela, Bela' com um coraçãozinho e 'glow' embaixo, tom marrom cacau) impresso no frasco do sérum, integrado de forma sutil. Estilo UGC premium, photoreal skin, 8k.",
          },
        },
        {
          id: "s1-anim",
          kind: "animacion",
          title: { es: "Animación — Snap zoom", pt: "Animação — Snap zoom" },
          model: "Seedance 2.0",
          content: {
            es: "Snap zoom rápido (push-in) hacia la mejilla en los primeros 0.5 s, micro-temblor de cámara handheld, parpadeo natural. 5 s, 720p.",
            pt: "Snap zoom rápido (push-in) em direção à bochecha nos primeiros 0,5 s, micro-tremor de câmera handheld, piscar natural. 5 s, 720p.",
          },
        },
      ],
    },
    {
      id: "s2",
      label: { es: "Desarrollo / Villano", pt: "Desenvolvimento / Vilão" },
      timecode: "3s – 8s",
      audio: {
        es: "El clima seco y las prisas dejan tu piel apagada y tirante. Y no, más maquillaje no lo arregla.",
        pt: "O clima seco e a pressa deixam sua pele opaca e repuxada. E não, mais maquiagem não resolve.",
      },
      visual: {
        es: "Macro de piel deshidratada (plano detalle), transición whip pan a una mano apretando crema espesa. Iluminación dirigida.",
        pt: "Macro de pele desidratada (plano detalhe), transição whip pan para uma mão apertando creme espesso. Iluminação dirigida.",
      },
      sfx: {
        es: "Ping al aparecer texto 'piel apagada' + ambiente bajo.",
        pt: "Ping ao aparecer o texto 'pele opaca' + ambiente baixo.",
      },
      prompts: [
        {
          id: "s2-img",
          kind: "imagen-0c",
          title: { es: "Imagen Base 0c — Textura villano", pt: "Imagem Base 0c — Textura vilão" },
          model: "Kling 3.0",
          content: {
            es: "Macro extrema 9:16 de piel de mejilla con leves líneas de deshidratación y aspecto mate, luz lateral dura que marca la textura, tonos neutros fríos. Photoreal, 4k, foco selectivo.",
            pt: "Macro extrema 9:16 de pele da bochecha com leves linhas de desidratação e aspecto fosco, luz lateral dura que marca a textura, tons neutros frios. Photoreal, 4k, foco seletivo.",
          },
        },
      ],
    },
    {
      id: "s3",
      label: { es: "Puente de venta", pt: "Ponte de venda" },
      timecode: "8s – 13s",
      audio: {
        es: "Una gota de este sérum de ElaBela y la piel se siente jugosa al instante: se funde como terciopelo.",
        pt: "Uma gota deste sérum da ElaBela e a pele fica suculenta na hora: derrete como veludo.",
      },
      visual: {
        es: "Product pop: la mano acerca el gotero al rostro tapándolo un instante, dolly-in al producto. Brillo de estudio.",
        pt: "Product pop: a mão aproxima o conta-gotas do rosto cobrindo-o por um instante, dolly-in ao produto. Brilho de estúdio.",
      },
      sfx: {
        es: "'Clic' del gotero + gota de líquido. Música sube.",
        pt: "'Clique' do conta-gotas + gota de líquido. Música sobe.",
      },
      prompts: [
        {
          id: "s3-img",
          kind: "imagen-0c",
          title: { es: "Imagen Base 0c — Product Pop", pt: "Imagem Base 0c — Product Pop" },
          model: "Seedance 2.0",
          content: {
            es: "Frasco de sérum ámbar con gotero en primer plano 9:16, gota suspendida brillando, fondo cálido bokeh, etiqueta con el logotipo ElaBela visible y nítida en el frasco. Iluminación de estudio que resalta el líquido dorado, hyperrealistic, 8k.",
            pt: "Frasco de sérum âmbar com conta-gotas em primeiro plano 9:16, gota suspensa brilhando, fundo quente bokeh, rótulo com o logotipo ElaBela visível e nítido no frasco. Iluminação de estúdio que realça o líquido dourado, hyperrealistic, 8k.",
          },
        },
        {
          id: "s3-anim",
          kind: "animacion",
          title: { es: "Animación — Dolly-in", pt: "Animação — Dolly-in" },
          model: "Seedance 2.0",
          content: {
            es: "Dolly-in suave al gotero, la gota cae en cámara lenta, reflejos dorados moviéndose. 5 s, 720p.",
            pt: "Dolly-in suave ao conta-gotas, a gota cai em câmera lenta, reflexos dourados em movimento. 5 s, 720p.",
          },
        },
      ],
    },
    {
      id: "s4",
      label: { es: "CTA", pt: "CTA" },
      timecode: "13s – 16s",
      audio: {
        es: "Recupera tu glow en 7 días. Disponible en ElaBela.",
        pt: "Recupere seu glow em 7 dias. Disponível na ElaBela.",
      },
      visual: {
        es: "Antes/después rápido de la piel luminosa, texto CTA en pantalla limpio.",
        pt: "Antes/depois rápido da pele luminosa, texto CTA na tela limpo.",
      },
      sfx: {
        es: "Sparkle/brillitos al revelar el 'después'.",
        pt: "Sparkle/brilhinhos ao revelar o 'depois'.",
      },
      prompts: [
        {
          id: "s4-img",
          kind: "imagen-0c",
          title: { es: "Imagen Base 0c — Cierre", pt: "Imagem Base 0c — Fecho" },
          model: "Omni Flash",
          content: {
            es: "Mismo rostro ahora con piel luminosa y jugosa, sonrisa natural, luz cálida dorada, frasco ElaBela junto a la mejilla. 9:16, photoreal, 8k.",
            pt: "Mesmo rosto agora com pele luminosa e suculenta, sorriso natural, luz quente dourada, frasco ElaBela junto à bochecha. 9:16, photoreal, 8k.",
          },
        },
      ],
    },
  ],
  cta: {
    es: "Recupera tu glow en 7 días — Disponible en ElaBela.",
    pt: "Recupere seu glow em 7 dias — Disponível na ElaBela.",
  },
  costs: {
    rows: [
      { shot: "Gancho (s1)", model: "Seedance 2.0", resolution: "720p", duration: "5s", cost: 23, wallet: "Highfield" },
      { shot: "Textura villano (s2)", model: "Kling 3.0", resolution: "720p", duration: "5s", cost: 7.5, wallet: "Highfield" },
      { shot: "Product Pop (s3)", model: "Seedance 2.0", resolution: "720p", duration: "5s", cost: 23, wallet: "Highfield" },
      { shot: "Cierre (s4)", model: "Omni Flash", resolution: "Estándar", duration: "4s", cost: 7, wallet: "Omni Flash" },
    ],
    highfieldTotal: 53.5,
    omniFlashTotal: 7,
    highfieldLimit: 100,
    omniFlashLimit: 38,
    notes: {
      es: "Presupuesto holgado: queda margen para un B-Roll extra de texturas.",
      pt: "Orçamento folgado: sobra margem para um B-Roll extra de texturas.",
    },
  },
};
