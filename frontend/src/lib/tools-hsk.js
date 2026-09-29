/**
 * HSK-specific tools for Needle2 AI Assistant
 */

import cnchar from 'cnchar-all'
import { useConfigStore } from '../stores/config'

// Tool schemas for the model
export function getToolSchemas() {
  return [
    {
      name: "lookup",
      description: "Look up detailed info about a specific Chinese character you know: pinyin, radical, stroke count, words, idioms. Pass the character directly (e.g. '好' or '爱').",
      parameters: {
        type: "object",
        properties: {
          char: {
            type: "string",
            description: "The Chinese character(s) to look up"
          }
        },
        required: ["char"]
      }
    },
    {
      name: "search",
      description: "Search HSK vocabulary for characters matching a keyword or level. Use when user says 'search', 'find', 'show me characters with', or 'list HSK words'. Returns matching characters.",
      parameters: {
        type: "object",
        properties: {
          keyword: {
            type: "string",
            description: "Search keyword (Chinese character, pinyin, or partial match)"
          },
          level: {
            type: "string",
            description: "HSK level filter (e.g. 'hsk1', 'hsk2', 'hsk3' to 'hsk7-9')"
          }
        },
        required: ["keyword"]
      }
    },
    {
      name: "explain",
      description: "Explain or define the meaning of a Chinese character, word, idiom, proverb, or sentence. Use when user asks 'what does X mean', 'explain', 'definition', or 'meaning of'.",
      parameters: {
        type: "object",
        properties: {
          content: {
            type: "string",
            description: "Text to explain or define"
          }
        },
        required: ["content"]
      }
    },
    {
      name: "say",
      description: "Say or speak Chinese text. Play audio pronunciation of the text. Use when user asks to 'say', 'speak', or 'pronounce' something.",
      parameters: {
        type: "object",
        properties: {
          text: {
            type: "string",
            description: "Chinese text to say or speak"
          }
        },
        required: ["text"]
      }
    },
    {
      name: "translate",
      description: "Translate Chinese text into another language, default to English. Use when user asks to 'translate' or 'convert to English/Japanese/etc'.",
      parameters: {
        type: "object",
        properties: {
          text: {
            type: "string",
            description: "Text to translate"
          },
          target_lang: {
            type: "string",
            description: "Target language (default 'English')"
          }
        },
        required: ["text"]
      }
    },
    {
      name: "navigate",
      description: "Navigate to a page within the app.",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "Target path, e.g. '/read', '/write', '/grammar', '/word/好', '/favorites'"
          }
        },
        required: ["path"]
      }
    }
  ]
}

// Tool executor
export async function executeTool(name, args) {
  switch (name) {
    case "lookup":
      return executeGetHanziInfo(args.char)
    case "search":
      return executeSearchHskWords(args.keyword, args.level)
    case "explain":
      return executeExplainContent(args.content)
    case "translate":
      return executeTranslateText(args.text, args.target_lang)
    case "say":
      return await executeSpeakText(args.text)
    case "navigate":
      return executeNavigateTo(args.path)
    default:
      return { error: `unknown tool: ${name}` }
  }
}

// Speak text implementation
async function executeSpeakText(text) {
  if (!text || text.length === 0) {
    return { error: "请提供要朗读的文本" }
  }

  const configStore = useConfigStore()

  try {
    const response = await fetch(configStore.getEndpoint('/api/v1/tts'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, format: 'mp3' })
    })

    if (!response.ok) throw new Error('TTS API error')

    const result = await response.json()
    const audioUrl = result.file_path

    if (audioUrl) {
      // Fetch audio as blob to avoid COEP cross-origin blocking, then play
      const audioRes = await fetch(audioUrl)
      if (!audioRes.ok) throw new Error('Failed to fetch audio')
      const blob = await audioRes.blob()
      const blobUrl = URL.createObjectURL(blob)

      const audio = new Audio(blobUrl)
      audio.play().catch(err => {
        console.log('Audio play failed:', err)
      })

      return {
        text: text,
        audio_url: blobUrl,
        played: true
      }
    }

    return { error: 'No audio URL in response' }
  } catch (e) {
    return { error: e.message }
  }
}

// Tool implementations

function executeGetHanziInfo(char) {
  if (!char || char.length === 0) {
    return { error: "请提供要查询的汉字" }
  }

  const results = []
  for (const c of char) {
    try {
      // Get basic info from cnchar
      const strokeCount = cnchar.stroke(c)
      const spell = cnchar.spell(c)
      const radicalInfo = cnchar.radical(c)
      const radical = radicalInfo && radicalInfo.length > 0 ? radicalInfo[0]?.radical || '' : ''
      const toneInfo = cnchar.transformTone(spell)
      const toneNum = toneInfo?.tone || 0
      const pinyin = spell.toLowerCase()

      // Get stroke detail
      const strokeDetail = cnchar.stroke(c, 'order', 'detail')
      const strokes = strokeDetail && strokeDetail[0] ? strokeDetail[0] : []

      // Get words, idioms, xiehouyu
      const words = cnchar.words(c) || []
      const idioms = cnchar.idiom(c) || []
      const xiehouyu = cnchar.xhy(c, 'fuzzy') || []

      // Get related characters
      const sameStrokeStr = cnchar.strokeToWord(strokeCount) || ''
      const samePinyinStr = cnchar.spellToWord(spell, 'alltone') || ''

      results.push({
        char: c,
        pinyin,
        tone: toneNum,
        stroke_count: strokeCount,
        radical,
        strokes: strokes.map((s, i) => ({
          order: i + 1,
          shape: s.shape || s,
          name: s.name || '',
          type: s.type || ''
        })),
        words: words.slice(0, 20),
        words_count: words.length,
        idioms: idioms.slice(0, 20),
        idioms_count: idioms.length,
        xiehouyu: xiehouyu.slice(0, 10),
        xiehouyu_count: xiehouyu.length,
        same_stroke_chars: sameStrokeStr.split('').filter(x => x !== c).slice(0, 10),
        same_pinyin_chars: samePinyinStr.split('').filter(x => x !== c).slice(0, 10)
      })
    } catch (e) {
      results.push({ char: c, error: e.message })
    }
  }

  return results.length === 1 ? results[0] : results
}

async function executeSearchHskWords(keyword, level) {
  try {
    const params = new URLSearchParams()
    if (level) params.append('level', level)

    const url = `/api/hanzi${params.toString() ? '?' + params.toString() : ''}`
    const response = await fetch(url)

    if (!response.ok) throw new Error('Failed to fetch hanzi list')

    const hanziList = await response.json()

    // Filter by keyword (match pinyin, word, or partial)
    const keywordLower = keyword.toLowerCase()
    const filtered = hanziList.filter(h =>
      h.word.includes(keyword) ||
      h.pinyin?.toLowerCase().includes(keywordLower) ||
      (h.radicals && h.radicals.includes(keyword))
    )

    return {
      total: filtered.length,
      keyword,
      level: level || 'all',
      results: filtered.slice(0, 50).map(h => ({
        word: h.word,
        pinyin: h.pinyin,
        levels: h.levels,
        strokes: h.strokes
      }))
    }
  } catch (e) {
    return { error: e.message }
  }
}

async function executeTranslateText(text, targetLang = 'English') {
  const configStore = useConfigStore()

  try {
    const prompt = configStore.buildTranslatePrompt(text, targetLang)
    const response = await fetch(configStore.getEndpoint('/api/v1/translate'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text, prompt })
    })

    if (!response.ok) throw new Error('Translation API error')

    const result = await response.json()
    return {
      original: text,
      translated: result.translated_text || result.translation || '暂无翻译',
      target_lang: targetLang
    }
  } catch (e) {
    return { error: e.message }
  }
}

async function executeTextToSpeech(text, autoPlay = true) {
  const configStore = useConfigStore()

  try {
    const response = await fetch(configStore.getEndpoint('/api/v1/tts'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, format: 'mp3' })
    })

    if (!response.ok) throw new Error('TTS API error')

    const result = await response.json()
    const audioUrl = result.file_path

    if (audioUrl) {
      // Fetch audio as blob to avoid COEP cross-origin blocking, then play
      const audioRes = await fetch(audioUrl)
      if (!audioRes.ok) throw new Error('Failed to fetch audio')
      const blob = await audioRes.blob()
      const blobUrl = URL.createObjectURL(blob)

      if (autoPlay) {
        const audio = new Audio(blobUrl)
        audio.play().catch(() => {
          console.log('Audio play failed')
        })
      }

      return {
        text: text,
        audio_url: blobUrl,
        played: autoPlay
      }
    }

    return { error: 'No audio URL in response' }
  } catch (e) {
    return { error: e.message }
  }
}

async function executeExplainContent(content) {
  const configStore = useConfigStore()

  try {
    const promptTemplate = configStore.wordPrompt
    const prompt = promptTemplate.replace('{content}', content)

    const response = await fetch(configStore.getEndpoint('/api/v1/explain'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, prompt })
    })

    if (!response.ok) throw new Error('Explain API error')

    const text = await response.text()

    // Try to parse as JSON
    try {
      const json = JSON.parse(text)
      return {
        content,
        explanation: json.explained_text || json.explanation || json.definition || text
      }
    } catch {
      return { content, explanation: text }
    }
  } catch (e) {
    return { error: e.message }
  }
}

function executeNavigateTo(path) {
  // Return navigation instruction
  return {
    navigation: {
      path,
      label: path
    }
  }
}