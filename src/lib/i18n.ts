import type { Lang } from "./types";

export const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
];

export const dict = {
  es: {
    appName: "Content Studio IA",
    tagline: "Generador de guiones para anuncios con IA",
    brandPill: "Estudio de guiones IA",
    footerNote: "Tu estudio creativo con IA",
    heroTitle: "De un anuncio ganador a tu",
    heroHighlight: "próximo guion viral",
    heroLead:
      "Sube el video de referencia, dime qué producto promocionas y la IA escribe un guion impecable, segundo a segundo, con prompts listos para producir.",

    // Tema / idioma
    theme: "Tema",
    light: "Día",
    dark: "Noche",
    language: "Idioma",
    scriptLanguage: "Idioma del guion",

    // Panel de entrada
    inputTitle: "Brief del anuncio",
    inputSubtitle: "Sube el video ganador y cuéntame qué quieres promocionar.",
    dropTitle: "Arrastra tu video ganador",
    dropSubtitle: "o haz clic para seleccionarlo · MP4, MOV, WEBM",
    dropAnalyzing: "Subiendo y analizando el video…",
    dropReady: "Video listo para analizar",
    dropError: "No se pudo subir el video",
    dropRemove: "Quitar",
    dropChange: "Cambiar video",

    productName: "Nombre del producto",
    productNamePh: "Ej. Sérum Glow Vitamina C",
    benefits: "Beneficios clave",
    benefitsPh: "Ej. hidrata 24h, ilumina, reduce manchas…",
    niche: "Nicho / público",
    nichePh: "Ej. pieles maduras que buscan luminosidad",

    products: "Productos a promocionar",
    productsHint: "Agrega uno o varios productos para el guion.",
    addProduct: "Añadir otro producto",
    removeProduct: "Quitar producto",
    productLabel: "Producto",
    productImage: "Foto del producto (opcional)",
    productImageUploading: "Subiendo…",
    productImageReady: "Foto lista",

    seeExample: "Ver ejemplo",
    exampleBadge: "Ejemplo de demostración",
    createdBy: "Creado por",

    mode: "Modo de producción",
    modeIA: "100% IA",
    modeIADesc: "Lipsync + B-Roll",
    modeHybrid: "Híbrido",
    modeHybridDesc: "Grabación local + B-Roll IA",

    referenceNotes: "Notas del video (opcional)",
    referenceNotesPh:
      "Si no subes video, describe el anuncio ganador: gancho, ritmo, tono…",

    extraPrompt: "Prompt extra (opcional)",
    extraPromptPh: "Instrucciones específicas para esta generación…",

    generate: "Generar guion",
    generating: "La IA está creando tu guion…",

    // Estados de carga
    loadingAnalyzing: "Analizando el video con las 3 capas",
    loadingStructuring: "Estructurando el guion segundo a segundo",
    loadingPrompts: "Escribiendo los prompts de imagen y video",
    loadingCosts: "Cuadrando los créditos",

    // Resultados
    resultsEmptyTitle: "Tu guion aparecerá aquí",
    resultsEmptySubtitle:
      "Completa el brief y pulsa «Generar guion» para ver la magia.",
    summary: "Idea central",
    hookStrategy: "Estrategia del gancho",
    analysisTitle: "Lo que detecté del video",
    scriptTitle: "Guion",
    colAudio: "Locución / Audio",
    colVisual: "Cámara / Visual",
    acting: "Actuación",
    sfx: "SFX / Sonido",
    promptsTitle: "Prompts de producción",
    copy: "Copiar",
    copied: "¡Copiado!",
    edit: "Editar",
    refineTitle: "Refinar prompt",
    refineSubtitle: "¿Qué quieres cambiar de este prompt?",
    refineInstructionPh:
      "Ej. hazlo más cinematográfico, cambia el fondo a un baño mármol, más close-up…",
    refineApply: "Regenerar prompt",
    refineWorking: "Refinando…",
    refineCancel: "Cancelar",
    refineChips: [
      "Más cinematográfico",
      "Cambiar el fondo",
      "Más close-up / macro",
      "Iluminación más cálida",
      "Más minimalista",
      "Realzar el producto",
    ],

    costsTitle: "Desglose de créditos",
    costShot: "Toma",
    costModel: "Modelo",
    costRes: "Resolución",
    costDur: "Duración",
    costCredits: "Costo",
    costWallet: "Billetera",
    walletHighfield: "Highfield",
    walletOmni: "Omni Flash",
    total: "Total",
    limit: "Límite",
    withinBudget: "Dentro del presupuesto",
    overBudget: "Excede el presupuesto",

    download: "Descargar guion (.md)",
    regenerate: "Generar otro",

    // Errores
    errorGeneric: "Algo salió mal. Inténtalo de nuevo.",
    errorNoKey:
      "Falta la clave de Gemini. Configura GEMINI_API_KEY en .env.local.",
    requiredProduct: "Escribe al menos el nombre del producto.",
  },
  pt: {
    appName: "Content Studio IA",
    tagline: "Gerador de roteiros para anúncios com IA",
    brandPill: "Estúdio de roteiros IA",
    footerNote: "Seu estúdio criativo com IA",
    heroTitle: "De um anúncio vencedor ao seu",
    heroHighlight: "próximo roteiro viral",
    heroLead:
      "Suba o vídeo de referência, diga qual produto promove e a IA escreve um roteiro impecável, segundo a segundo, com prompts prontos para produzir.",

    theme: "Tema",
    light: "Dia",
    dark: "Noite",
    language: "Idioma",
    scriptLanguage: "Idioma do roteiro",

    inputTitle: "Brief do anúncio",
    inputSubtitle: "Suba o vídeo vencedor e diga o que quer promover.",
    dropTitle: "Arraste seu vídeo vencedor",
    dropSubtitle: "ou clique para selecionar · MP4, MOV, WEBM",
    dropAnalyzing: "Subindo e analisando o vídeo…",
    dropReady: "Vídeo pronto para análise",
    dropError: "Não foi possível subir o vídeo",
    dropRemove: "Remover",
    dropChange: "Trocar vídeo",

    productName: "Nome do produto",
    productNamePh: "Ex. Sérum Glow Vitamina C",
    benefits: "Benefícios principais",
    benefitsPh: "Ex. hidrata 24h, ilumina, reduz manchas…",
    niche: "Nicho / público",
    nichePh: "Ex. peles maduras que buscam luminosidade",

    products: "Produtos a promover",
    productsHint: "Adicione um ou vários produtos para o roteiro.",
    addProduct: "Adicionar outro produto",
    removeProduct: "Remover produto",
    productLabel: "Produto",
    productImage: "Foto do produto (opcional)",
    productImageUploading: "Enviando…",
    productImageReady: "Foto pronta",

    seeExample: "Ver exemplo",
    exampleBadge: "Exemplo de demonstração",
    createdBy: "Criado por",

    mode: "Modo de produção",
    modeIA: "100% IA",
    modeIADesc: "Lipsync + B-Roll",
    modeHybrid: "Híbrido",
    modeHybridDesc: "Gravação local + B-Roll IA",

    referenceNotes: "Notas do vídeo (opcional)",
    referenceNotesPh:
      "Se não subir vídeo, descreva o anúncio vencedor: gancho, ritmo, tom…",

    extraPrompt: "Prompt extra (opcional)",
    extraPromptPh: "Instruções específicas para esta geração…",

    generate: "Gerar roteiro",
    generating: "A IA está criando seu roteiro…",

    loadingAnalyzing: "Analisando o vídeo com as 3 camadas",
    loadingStructuring: "Estruturando o roteiro segundo a segundo",
    loadingPrompts: "Escrevendo os prompts de imagem e vídeo",
    loadingCosts: "Ajustando os créditos",

    resultsEmptyTitle: "Seu roteiro aparecerá aqui",
    resultsEmptySubtitle:
      "Preencha o brief e clique em «Gerar roteiro» para ver a mágica.",
    summary: "Ideia central",
    hookStrategy: "Estratégia do gancho",
    analysisTitle: "O que detectei do vídeo",
    scriptTitle: "Roteiro",
    colAudio: "Locução / Áudio",
    colVisual: "Câmera / Visual",
    acting: "Atuação",
    sfx: "SFX / Som",
    promptsTitle: "Prompts de produção",
    copy: "Copiar",
    copied: "Copiado!",
    edit: "Editar",
    refineTitle: "Refinar prompt",
    refineSubtitle: "O que você quer mudar neste prompt?",
    refineInstructionPh:
      "Ex. deixe mais cinematográfico, mude o fundo para um banheiro de mármore, mais close-up…",
    refineApply: "Regerar prompt",
    refineWorking: "Refinando…",
    refineCancel: "Cancelar",
    refineChips: [
      "Mais cinematográfico",
      "Trocar o fundo",
      "Mais close-up / macro",
      "Iluminação mais quente",
      "Mais minimalista",
      "Realçar o produto",
    ],

    costsTitle: "Detalhamento de créditos",
    costShot: "Tomada",
    costModel: "Modelo",
    costRes: "Resolução",
    costDur: "Duração",
    costCredits: "Custo",
    costWallet: "Carteira",
    walletHighfield: "Highfield",
    walletOmni: "Omni Flash",
    total: "Total",
    limit: "Limite",
    withinBudget: "Dentro do orçamento",
    overBudget: "Excede o orçamento",

    download: "Baixar roteiro (.md)",
    regenerate: "Gerar outro",

    errorGeneric: "Algo deu errado. Tente novamente.",
    errorNoKey:
      "Falta a chave do Gemini. Configure GEMINI_API_KEY no .env.local.",
    requiredProduct: "Escreva ao menos o nome do produto.",
  },
};

export type Dict = (typeof dict)["es"];
