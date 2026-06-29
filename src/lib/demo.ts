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
            es: "Retrato hiperrealista vertical 9:16 de una mujer latina de unos 35 años, piel real con textura y poros visibles, expresión natural de duda, luz suave de ventana por la izquierda, fondo de baño minimalista beige desenfocado. En la repisa del fondo se ve el frasco del sérum que USA el logotipo de ElaBela proporcionado en su etiqueta (legible, sin deformar). El producto no se deforma ni cambia de forma. Estilo UGC premium, photoreal skin, 8k.",
            pt: "Retrato hiper-realista vertical 9:16 de uma mulher latina de uns 35 anos, pele real com textura e poros visíveis, expressão natural de dúvida, luz suave de janela pela esquerda, fundo de banheiro minimalista bege desfocado. Na prateleira ao fundo vê-se o frasco do sérum que USA o logotipo da ElaBela fornecido no rótulo (legível, sem deformar). O produto não se deforma nem muda de forma. Estilo UGC premium, photoreal skin, 8k.",
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

/** Ejemplo en modo Híbrido (presentador local A-Roll + B-Roll IA). */
export const demoScriptHybrid: ScriptResult = {
  productionMode: "hibrido",
  title: {
    es: "Probé el sérum viral por 7 días (esto pasó con mi piel)",
    pt: "Testei o sérum viral por 7 dias (isto aconteceu com a minha pele)",
  },
  summary: {
    es: "Formato 'acompáñame': la presentadora real conduce y el B-Roll IA muestra producto y texturas.",
    pt: "Formato 'me acompanhe': a apresentadora real conduz e o B-Roll IA mostra produto e texturas.",
  },
  hookStrategy: {
    es: "Testimonio en primera persona + promesa de resultado en 7 días: genera curiosidad y credibilidad.",
    pt: "Depoimento em primeira pessoa + promessa de resultado em 7 dias: gera curiosidade e credibilidade.",
  },
  analysis: [
    {
      layer: "psicologica",
      label: { es: "Estructura de continuidad", pt: "Estrutura de continuidade" },
      finding: {
        es: "'Acompáñame 7 días' mantiene la retención hasta el resultado final.",
        pt: "'Me acompanhe 7 dias' mantém a retenção até o resultado final.",
      },
    },
    {
      layer: "visual",
      label: { es: "Balance humano/producto", pt: "Equilíbrio humano/produto" },
      finding: {
        es: "Presentadora en A-Roll + insertos de producto en B-Roll IA (~50/50).",
        pt: "Apresentadora em A-Roll + insertos de produto em B-Roll IA (~50/50).",
      },
    },
    {
      layer: "auditiva",
      label: { es: "Sonido ambiente", pt: "Som ambiente" },
      finding: {
        es: "Baja la música en el 'clic' del gotero para dar sensación honesta.",
        pt: "Abaixa a música no 'clique' do conta-gotas para dar sensação honesta.",
      },
    },
  ],
  scenes: [
    {
      id: "s1",
      label: { es: "Gancho", pt: "Gancho" },
      timecode: "0s – 3s",
      roll: "A-Roll",
      audio: {
        es: "Llevo 7 días con este sérum y mi piel cambió más de lo que esperaba.",
        pt: "Estou há 7 dias com este sérum e minha pele mudou mais do que eu esperava.",
      },
      visual: {
        es: "Presentadora en plano medio mirando a cámara, gesto de sorpresa honesta, luz natural.",
        pt: "Apresentadora em plano médio olhando para a câmera, gesto de surpresa honesta, luz natural.",
      },
      acting: {
        es: "Tono de amiga cercana, ritmo ágil, levanta el frasco hacia la cámara al decir 'este sérum'.",
        pt: "Tom de amiga próxima, ritmo ágil, levanta o frasco para a câmera ao dizer 'este sérum'.",
      },
      sfx: {
        es: "Ambiente limpio, sin música hasta el segundo 1.5; entra base suave.",
        pt: "Ambiente limpo, sem música até o segundo 1,5; entra base suave.",
      },
      prompts: [
        {
          id: "s1-bg",
          kind: "fondo-chroma",
          title: { es: "Fondo Chroma 0c — Gancho", pt: "Fundo Chroma 0c — Gancho" },
          model: "NanoBanana Pro (Flow)",
          content: {
            es: "Fondo estático vertical 9:16 para incrustar tras la presentadora (chroma): baño/tocador minimalista beige cálido, repisa con plantas y skincare desenfocado (bokeh suave). En la pared del fondo, un cuadro/poster enmarcado que USA el logotipo de ElaBela proporcionado (sin deformarlo, legible). Iluminación suave de mañana, photoreal, 8k. Sin personas en el fondo.",
            pt: "Fundo estático vertical 9:16 para inserir atrás da apresentadora (chroma): banheiro/penteadeira minimalista bege quente, prateleira com plantas e skincare desfocado (bokeh suave). Na parede ao fundo, um quadro/poster emoldurado que USA o logotipo da ElaBela fornecido (sem deformá-lo, legível). Iluminação suave de manhã, photoreal, 8k. Sem pessoas no fundo.",
          },
        },
      ],
    },
    {
      id: "s2",
      label: { es: "Demostración producto", pt: "Demonstração produto" },
      timecode: "3s – 8s",
      roll: "B-Roll",
      audio: {
        es: "Una gota en la mano y se funde al instante, sin sensación grasosa.",
        pt: "Uma gota na mão e derrete na hora, sem sensação oleosa.",
      },
      visual: {
        es: "Inserto B-Roll: macro de la gota cayendo del gotero a la yema del dedo, dolly-in lento.",
        pt: "Inserto B-Roll: macro da gota caindo do conta-gotas na ponta do dedo, dolly-in lento.",
      },
      sfx: {
        es: "Micro-pausa de la locución para oír el 'clic' del gotero + gota.",
        pt: "Micro-pausa da locução para ouvir o 'clique' do conta-gotas + gota.",
      },
      prompts: [
        {
          id: "s2-img",
          kind: "imagen-0c",
          title: { es: "Imagen Base 0c — Gota", pt: "Imagem Base 0c — Gota" },
          model: "NanoBanana Pro (Flow)",
          content: {
            es: "Macro 9:16 de un gotero de vidrio ámbar sobre una mano femenina, gota dorada a punto de caer, fondo cálido bokeh. El frasco mantiene su forma y etiqueta sin deformarse, logo legible. Iluminación de estudio suave que hace brillar el líquido, hyperrealistic, 8k.",
            pt: "Macro 9:16 de um conta-gotas de vidro âmbar sobre uma mão feminina, gota dourada prestes a cair, fundo quente bokeh. O frasco mantém sua forma e rótulo sem deformar, logo legível. Iluminação de estúdio suave que faz o líquido brilhar, hyperrealistic, 8k.",
          },
        },
        {
          id: "s2-anim",
          kind: "animacion",
          title: { es: "Animación — Dolly-in gota", pt: "Animação — Dolly-in gota" },
          model: "Seedance 2.0",
          content: {
            es: "Dolly-in lento hacia la gota que cae en cámara lenta; el producto NO se deforma ni cambia de etiqueta; reflejos dorados estables. 5 s, 720p.",
            pt: "Dolly-in lento em direção à gota que cai em câmera lenta; o produto NÃO se deforma nem muda de rótulo; reflexos dourados estáveis. 5 s, 720p.",
          },
        },
      ],
    },
    {
      id: "s3",
      label: { es: "Textura / Resultado", pt: "Textura / Resultado" },
      timecode: "8s – 12s",
      roll: "B-Roll",
      audio: {
        es: "A los pocos días la piel se ve más jugosa, luminosa y uniforme.",
        pt: "Em poucos dias a pele fica mais suculenta, luminosa e uniforme.",
      },
      visual: {
        es: "Macro de piel luminosa (mejilla), whip pan desde la textura del sérum a la piel.",
        pt: "Macro de pele luminosa (bochecha), whip pan da textura do sérum para a pele.",
      },
      sfx: {
        es: "Whoosh en el whip pan + sparkle al revelar la piel luminosa.",
        pt: "Whoosh no whip pan + sparkle ao revelar a pele luminosa.",
      },
      prompts: [
        {
          id: "s3-img",
          kind: "imagen-0c",
          title: { es: "Imagen Base 0c — Piel luminosa", pt: "Imagem Base 0c — Pele luminosa" },
          model: "Kling 3.0",
          content: {
            es: "Macro 9:16 de mejilla con piel hidratada y luminosa, brillo natural saludable, poros realistas, luz cálida dorada. Photoreal, 4k, foco selectivo. Sin artefactos ni morphing.",
            pt: "Macro 9:16 de bochecha com pele hidratada e luminosa, brilho natural saudável, poros realistas, luz quente dourada. Photoreal, 4k, foco seletivo. Sem artefatos nem morphing.",
          },
        },
        {
          id: "s3-anim",
          kind: "animacion",
          title: { es: "Animación — Whip pan", pt: "Animação — Whip pan" },
          model: "Kling 3.0",
          content: {
            es: "Whip pan rápido desde la textura del sérum hacia la mejilla luminosa, transición fluida sin deformar la piel ni el rostro. 5 s, 720p.",
            pt: "Whip pan rápido da textura do sérum para a bochecha luminosa, transição fluida sem deformar a pele nem o rosto. 5 s, 720p.",
          },
        },
      ],
    },
    {
      id: "s4",
      label: { es: "CTA", pt: "CTA" },
      timecode: "12s – 16s",
      roll: "A-Roll",
      audio: {
        es: "Si quieres ese glow, este es tu sérum. Lo consigues en ElaBela.",
        pt: "Se você quer esse glow, este é o seu sérum. Você encontra na ElaBela.",
      },
      visual: {
        es: "Presentadora sonriendo, sostiene el frasco junto al rostro, asiente segura.",
        pt: "Apresentadora sorrindo, segura o frasco junto ao rosto, assente confiante.",
      },
      acting: {
        es: "Cierre cálido y seguro, contacto visual directo, leve acercamiento a cámara.",
        pt: "Fecho caloroso e seguro, contato visual direto, leve aproximação à câmera.",
      },
      sfx: {
        es: "Sparkle suave al mostrar el frasco; música cierra en alto.",
        pt: "Sparkle suave ao mostrar o frasco; música fecha em alta.",
      },
      prompts: [
        {
          id: "s4-bg",
          kind: "fondo-chroma",
          title: { es: "Fondo Chroma 0c — Cierre", pt: "Fundo Chroma 0c — Fecho" },
          model: "NanoBanana Pro (Flow)",
          content: {
            es: "Mismo fondo de baño cálido 9:16 para chroma, ahora con luz dorada de cierre. En la repisa, el producto y un cuadro de fondo que USA el logotipo de ElaBela proporcionado (legible, sin deformar). Photoreal, 8k, sin personas.",
            pt: "Mesmo fundo de banheiro quente 9:16 para chroma, agora com luz dourada de fecho. Na prateleira, o produto e um quadro ao fundo que USA o logotipo da ElaBela fornecido (legível, sem deformar). Photoreal, 8k, sem pessoas.",
          },
        },
      ],
    },
  ],
  cta: {
    es: "Si quieres ese glow, este es tu sérum — Disponible en ElaBela.",
    pt: "Se você quer esse glow, este é o seu sérum — Disponível na ElaBela.",
  },
  costs: {
    rows: [
      { shot: "Demostración gota (s2)", model: "Seedance 2.0", resolution: "720p", duration: "5s", cost: 23, wallet: "Highfield" },
      { shot: "Piel luminosa (s3)", model: "Kling 3.0", resolution: "4K", duration: "5s", cost: 30, wallet: "Highfield" },
      { shot: "Fondos chroma (s1+s4)", model: "NanoBanana Pro (Flow)", resolution: "imagen", duration: "—", cost: 0, wallet: "Highfield" },
    ],
    highfieldTotal: 53,
    omniFlashTotal: 0,
    highfieldLimit: 100,
    omniFlashLimit: 38,
    notes: {
      es: "Sin gasto en Lipsync: el presupuesto fuerte va al B-Roll de producto en alta calidad.",
      pt: "Sem gasto em Lipsync: o orçamento forte vai para o B-Roll de produto em alta qualidade.",
    },
  },
};
