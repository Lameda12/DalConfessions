// Client-side soft warning only — never blocks a post outright. Real
// enforcement is the report system + human review down the line.

const PHONE_PATTERN = /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/

const HARASSMENT_WORDS = [
  'kill yourself',
  'kys',
  'i know where you live',
  'i will find you',
  "i'll find you",
  'doxx',
  'dox',
]

export interface ModerationFlag {
  type: 'phone' | 'harassment'
  message: string
}

export function checkModeration(text: string): ModerationFlag | null {
  if (PHONE_PATTERN.test(text)) {
    return {
      type: 'phone',
      message: 'This looks like it contains a phone number. Sharing contact info can put you or others at risk.',
    }
  }

  const lower = text.toLowerCase()
  if (HARASSMENT_WORDS.some((phrase) => lower.includes(phrase))) {
    return {
      type: 'harassment',
      message: 'This sounds like it could be harassment. Confessions should stay anonymous and kind.',
    }
  }

  return null
}
