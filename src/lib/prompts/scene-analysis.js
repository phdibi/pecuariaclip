/**
 * Prompt for per-clip scene classification.
 * Sent with 5-8 best frames from a single video clip.
 */
export function getSceneAnalysisPrompt(sectionId, sectionDesc) {
  return `Você é um editor de vídeo especialista em pecuária de elite brasileira.
Analise estes frames de um vídeo de gado para a seção "${sectionId}" (${sectionDesc}).

Para cada frame, identifique:
1. SCENE_TYPE: um de [lateral_walk, front_view, rear_view, left_side, right_side, head_closeup, muscle_detail, scrotal_detail, leg_detail, hoof_detail, walking_gait, farm_aerial, farm_entrance, static_data, group_shot, unknown]
2. ANIMAL_VISIBILITY: 0-100 (quão claramente o animal está visível e centralizado)
3. COMPOSITION_QUALITY: 0-100 (enquadramento, fundo limpo, iluminação)
4. MOTION_BLUR: 0-100 (0 = perfeitamente nítido, 100 = muito borrado)
5. BEST_MOMENT: boolean (é um momento de pico — animal em pose quadrada, cabeça levantada, boa exibição muscular?)

Também forneça para o clip inteiro:
- RECOMMENDED_IN_FRAME: índice do frame que seria o melhor ponto de entrada
- RECOMMENDED_OUT_FRAME: índice do frame que seria o melhor ponto de saída
- CLIP_RATING: 0-100 avaliação geral do clip para esta seção
- NOTES: observações breves sobre qualidade ou problemas

Responda APENAS em JSON válido com esta estrutura:
{
  "frames": [
    { "index": 0, "scene_type": "...", "animal_visibility": 0, "composition_quality": 0, "motion_blur": 0, "best_moment": false }
  ],
  "clip": {
    "recommended_in_frame": 0,
    "recommended_out_frame": 0,
    "clip_rating": 0,
    "notes": "..."
  }
}`;
}

/**
 * Prompt for section-level edit plan.
 * Sent after all clips in a section are analyzed.
 */
export function getCutRecommendationPrompt(sectionId, sectionDesc, targetDuration, clipsSummary) {
  return `Você é um editor de vídeo profissional especialista em vídeos de pecuária de elite para leilões brasileiros.

Você está editando a seção "${sectionId}" (${sectionDesc}).
Duração alvo: ${targetDuration}.

Aqui estão os clips disponíveis e suas análises:
${clipsSummary}

Crie um plano de edição profissional:
1. Classifique os clips do melhor ao pior para esta seção
2. Recomende timestamps específicos de entrada/saída para cada clip
3. Sugira tipos de transição entre clips (cut, dissolve)
4. Recomende a quantidade total de clips (menos é melhor — 2-4 clips por seção)
5. Sinalize ângulos faltantes que o usuário deveria regravar

Responda APENAS em JSON válido:
{
  "edit_plan": [
    {
      "clip_index": 0,
      "in_time": 0.0,
      "out_time": 0.0,
      "transition_to_next": "cut",
      "reason": "..."
    }
  ],
  "missing_angles": [],
  "total_duration": 0.0,
  "notes": "..."
}`;
}
