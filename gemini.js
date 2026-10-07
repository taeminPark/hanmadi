// 2단계: DB에 없는 상황을 자유 입력하면 Gemini가 멘트 3개 생성.
// 키는 사용자가 앱 설정에서 입력하고 이 기기에만 저장한다(정적 앱이라 .env로 숨길 수 없음).
import { store } from './store.js';

export const getApiKey = () => store.read('geminiKey', '');
export const setApiKey = key => store.write('geminiKey', key.trim());

export async function generatePhrases(/* { situation, target, tone, freeText } */) {
  throw new Error('AI 멘트 생성은 2단계에서 열려요.');
}
